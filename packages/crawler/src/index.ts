/**
 * 假装社区 — 内容采集爬虫入口
 *
 * 由 GitHub Actions 定时触发 (每天 3 次)
 * 或手动运行: pnpm --filter @jiazhuang/crawler crawl
 *
 * 流程:
 *   1. 加载板块和种子博主配置
 *   2. 并发调用各平台 API 获取最新内容
 *   3. 对每条内容运行评测引擎
 *   4. 自动发布 / 待审核 / 丢弃
 *   5. 记录采集日志
 */

import { PrismaClient } from "@prisma/client"
import { crawlGitHub } from "./platforms/github"
import { crawlBilibili } from "./platforms/bilibili"
import { crawlYouTube } from "./platforms/youtube"
import { evaluate, type EvalInput } from "./eval/evaluator-adapter"
import type { TopicKeywords } from "./eval/topics-adapter"
import { translateItem } from "./translate"

const db = new PrismaClient()

interface CrawlOptions {
  boardSlug?: string
  dryRun?: boolean
}

async function main() {
  const args = process.argv.slice(2)
  const opts: CrawlOptions = {
    boardSlug: getArg(args, "--board"),
    dryRun: args.includes("--dry-run"),
  }

  console.log("🚀 开始内容采集...")
  console.log(`   时间: ${new Date().toISOString()}`)
  if (opts.boardSlug) console.log(`   板块: ${opts.boardSlug}`)

  // 1. 加载板块配置
  const boards = await db.board.findMany({
    where: opts.boardSlug ? { slug: opts.boardSlug } : undefined,
    include: { sources: true },
  })

  if (boards.length === 0) {
    console.log("⚠️  没有找到板块，请先运行 pnpm prisma:seed")
    return
  }

  let totalCollected = 0
  let totalPublished = 0
  let totalPending = 0
  let totalRejected = 0

  for (const board of boards) {
    const topic: TopicKeywords = {
      boardName: board.name,
      boardSlug: board.slug,
      boardDescription: board.description ?? "",
      primary: (board.keywords as any)?.primary ?? [],
      secondary: (board.keywords as any)?.secondary ?? [],
      tertiary: (board.keywords as any)?.tertiary ?? [],
    }

    const sources = board.sources

    console.log(`\n📋 采集板块: ${board.name} (${sources.length} 个关注源)`)

    // 2. 各平台采集
    const allItems: CrawledItem[] = []

    // YouTube
    const ytSources = sources.filter((s) => s.platform === "YOUTUBE")
    if (ytSources.length > 0) {
      const items = await crawlYouTube(ytSources)
      allItems.push(...items)
      console.log(`   ▶️  YouTube: ${items.length} 条`)
    }

    // B站
    const blSources = sources.filter((s) => s.platform === "BILIBILI")
    if (blSources.length > 0) {
      const items = await crawlBilibili(blSources)
      allItems.push(...items)
      console.log(`   📺 B站: ${items.length} 条`)
    }

    // GitHub
    const ghSources = sources.filter((s) => s.platform === "GITHUB")
    if (ghSources.length > 0) {
      const items = await crawlGitHub(ghSources)
      allItems.push(...items)
      console.log(`   📦 GitHub: ${items.length} 条`)
    }

    totalCollected += allItems.length

    // 3. 对每条内容评测
    for (const item of allItems) {
      const evalInput: EvalInput = {
        title: item.title,
        summary: item.summary,
        tags: item.tags ?? [],
        platform: item.platform,
        publishedAt: item.publishedAt,
        sourceIsSeed: item.sourceIsSeed,
        sourceFollowerCount: item.sourceFollowerCount,
        likeCount: item.likeCount ?? 0,
        commentCount: item.commentCount ?? 0,
        starCount: item.starCount,
        viewCount: item.viewCount,
        hasThumbnail: !!item.thumbnailUrl,
        hasSourceUrl: !!item.url,
        metadataComplete: !!(item.title && item.url && item.summary),
      }

      const result = evaluate(evalInput, topic)

      if (opts.dryRun) {
        console.log(
          `   ${result.decision === "AUTO_PUBLISH" ? "✅" : result.decision === "MANUAL_REVIEW" ? "🔍" : "❌"} ${item.title.slice(0, 50)}... → ${result.finalScore}`
        )
        continue
      }

      // 3.5 翻译为中文
      const { titleZh, summaryZh } = await translateItem(item)

      // 4. 写入数据库
      const status =
        result.decision === "AUTO_PUBLISH"
          ? "PUBLISHED"
          : result.decision === "MANUAL_REVIEW"
            ? "PENDING"
            : "REJECTED"

      try {
        const metadata = {
          ...(item.metadata as any ?? {}),
          titleEn: item.title,
          summaryEn: item.summary,
        }

        await db.content.upsert({
          where: { url: item.url },
          update: {
            title: titleZh || item.title,
            summary: summaryZh || item.summary,
            thumbnailUrl: item.thumbnailUrl,
            status: status as any,
            metadata,
          },
          create: {
            title: titleZh || item.title,
            url: item.url,
            summary: summaryZh || item.summary,
            thumbnailUrl: item.thumbnailUrl,
            contentType: item.contentType,
            publishedAt: item.publishedAt,
            status: status as any,
            metadata,
            sourceId: item.sourceId,
            boardId: board.id,
          },
        })

        // 创建评测记录
        await db.evaluation.create({
          data: {
            content: { connect: { url: item.url } },
            relevance: result.relevance,
            quality: result.quality,
            freshness: result.freshness,
            engagement: result.engagement,
            completeness: result.completeness,
            finalScore: result.finalScore,
            decision: result.decision as any,
            reason: result.reason,
          },
        })

        if (status === "PUBLISHED") totalPublished++
        else if (status === "PENDING") totalPending++
        else totalRejected++
      } catch (e: any) {
        if (e?.code === "P2002") {
          // 唯一键冲突，跳过
        } else {
          console.error(`   ⚠️ 写入失败: ${item.title.slice(0, 30)}`, e)
        }
      }
    }
  }

  console.log(`\n📊 采集完成:`)
  console.log(`   收集: ${totalCollected} 条`)
  console.log(`   发布: ${totalPublished} 条`)
  console.log(`   待审: ${totalPending} 条`)
  console.log(`   丢弃: ${totalRejected} 条`)
  if (opts.dryRun) console.log(`   (dry-run 模式，未实际写入)`)
}

// ============================================================
// 类型定义
// ============================================================
export interface CrawledItem {
  title: string
  url: string
  summary: string
  thumbnailUrl?: string
  contentType: "VIDEO" | "ARTICLE" | "REPOSITORY"
  platform: "YOUTUBE" | "BILIBILI" | "GITHUB"
  publishedAt: Date
  sourceId: string
  sourceIsSeed: boolean
  sourceFollowerCount: number
  tags?: string[]
  likeCount?: number
  commentCount?: number
  starCount?: number
  viewCount?: number
  metadata?: Record<string, any>
}

// ============================================================
// 辅助函数
// ============================================================
function getArg(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag)
  return idx >= 0 ? args[idx + 1] : undefined
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
