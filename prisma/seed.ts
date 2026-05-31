/**
 * 假装社区 — 数据库种子脚本
 *
 * 初始化两个板块: AI 资讯 + AI 教程
 * 运行: pnpm prisma:seed
 */

import { PrismaClient } from "@prisma/client"
import { TOPICS } from "../lib/topics"

const db = new PrismaClient()

async function main() {
  console.log("🌱 开始播种...\n")

  for (const topic of TOPICS) {
    const board = await db.board.upsert({
      where: { slug: topic.boardSlug },
      update: {
        name: topic.boardName,
        description: topic.boardDescription,
        keywords: {
          primary: topic.primary,
          secondary: topic.secondary,
          tertiary: topic.tertiary,
        },
      },
      create: {
        name: topic.boardName,
        slug: topic.boardSlug,
        description: topic.boardDescription,
        keywords: {
          primary: topic.primary,
          secondary: topic.secondary,
          tertiary: topic.tertiary,
        },
        order: topic.boardSlug === "ai-news" ? 0 : 1,
      },
    })

    // 为板块创建初始标签
    const allKeywords = [...topic.primary, ...topic.secondary]
    for (const kw of allKeywords.slice(0, 30)) {
      // 最多 30 个常用标签
      await db.tag.upsert({
        where: { name_boardId: { name: kw, boardId: board.id } },
        update: {},
        create: { name: kw, boardId: board.id },
      })
    }

    console.log(`  ✅ ${topic.boardName} (${topic.boardSlug})`)
  }

  // ============================================================
  // 种子场景
  // ============================================================
  const SCENARIOS = [
    { slug: "ai-coding", icon: "🤖", name: "AI Coding", description: "AI 辅助编程、代码生成、IDE 插件", order: 0 },
    { slug: "ai-ppt", icon: "📊", name: "AI 做 PPT", description: "AI 生成演示文稿、幻灯片工具", order: 1 },
    { slug: "ai-video", icon: "🎬", name: "AI 做视频", description: "AI 视频生成、剪辑、特效", order: 2 },
    { slug: "ai-writing", icon: "✍️", name: "AI 写作", description: "AI 文案、小说、公文、翻译", order: 3 },
    { slug: "ai-drawing", icon: "🎨", name: "AI 绘画", description: "AI 图像生成、风格迁移、修图", order: 4 },
    { slug: "ai-data", icon: "📈", name: "AI 数据分析", description: "AI 数据处理、可视化、报表", order: 5 },
    { slug: "ai-automation", icon: "⚡", name: "AI 自动化", description: "AI Agent、工作流、RPA", order: 6 },
    { slug: "ai-voice", icon: "🎙️", name: "AI 语音", description: "TTS、语音克隆、音乐生成", order: 7 },
    { slug: "ai-search", icon: "🔍", name: "AI 搜索", description: "智能搜索、知识库、RAG", order: 8 },
    { slug: "ai-design", icon: "🧑‍🎨", name: "AI 设计", description: "UI 设计、Logo、海报生成", order: 9 },
  ]

  console.log("\n🏷️  播种场景...")
  for (const sc of SCENARIOS) {
    await db.scenario.upsert({
      where: { slug: sc.slug },
      update: {},
      create: sc,
    })
    console.log(`  ✅ ${sc.icon} ${sc.name}`)
  }

  console.log(`\n🎉 播种完成!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
