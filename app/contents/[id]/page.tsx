/**
 * 内容详情页 — /contents/[id]
 *
 * 展示完整内容信息 + 评论。
 * 对齐 docs/ui-来源切换与详情页.md 设计规范。
 */

import { db } from "@/lib/db"
import { ScenarioTag } from "@/components/features/scenario-tag"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

interface ContentDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ContentDetailPage({
  params,
}: ContentDetailPageProps) {
  const { id } = await params

  const content = await db.content.findUnique({
    where: { id },
    include: {
      source: true,
      board: true,
      tags: { include: { tag: true } },
      contentScenarios: { include: { scenario: true } },
      comments: { orderBy: { likeCount: "desc" } },
      evaluations: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  })

  if (!content || content.status !== "PUBLISHED") notFound()

  // 上下篇
  const [prevContent, nextContent] = await Promise.all([
    db.content.findFirst({
      where: { status: "PUBLISHED", publishedAt: { lt: content.publishedAt } },
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true },
    }),
    db.content.findFirst({
      where: { status: "PUBLISHED", publishedAt: { gt: content.publishedAt } },
      orderBy: { publishedAt: "asc" },
      select: { id: true, title: true },
    }),
  ])

  const metadata = content.metadata as Record<string, any> | null
  const platformIcon = PLATFORM_ICONS[content.source.platform] ?? "🔗"
  const typeLabel = CONTENT_TYPE_LABELS[content.contentType] ?? content.contentType

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* 返回链接 */}
      <Link
        href="/"
        className="inline-flex items-center text-xs text-gray-400 hover:text-gray-600 transition-colors mb-6"
      >
        ← 返回列表
      </Link>

      {/* ─── 标题区 ─── */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            {platformIcon} {typeLabel}
          </span>
          <span className="text-xs text-gray-400">
            {content.publishedAt.toLocaleDateString("zh-CN")}
          </span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 leading-snug">
          {content.title}
        </h1>
      </div>

      {/* ─── 来源信息卡 ─── */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-6">
        <p className="text-sm text-gray-600">
          转载自{" "}
          <span className="font-medium">
            {platformIcon} {content.source.name}
          </span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          板块: {content.board.name}
          {metadata?.viewCount && ` · 👀 ${formatNumber(Number(metadata.viewCount))} 次观看`}
          {metadata?.stars && ` · ⭐ ${formatNumber(Number(metadata.stars))}`}
        </p>
        <a
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          🔗 查看原文
        </a>
      </div>

      <hr className="border-gray-100 mb-6" />

      {/* ─── AI 摘要 ─── */}
      {content.summary && (
        <>
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              📝 AI 摘要
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {content.summary}
            </p>
          </section>
          <hr className="border-gray-100 mb-6" />
        </>
      )}

      {/* ─── 标签区 ─── */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">🏷️ 标签</h3>
        <div className="flex flex-wrap gap-2">
          {content.contentScenarios.map((cs) => (
            <ScenarioTag
              key={cs.scenario.slug}
              icon={cs.scenario.icon}
              name={cs.scenario.name}
              slug={cs.scenario.slug}
            />
          ))}
          {content.tags.map((ct) => (
            <span
              key={ct.tag.name}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500"
            >
              #{ct.tag.name}
            </span>
          ))}
        </div>
      </section>

      <hr className="border-gray-100 mb-6" />

      {/* ─── 元数据区 ─── */}
      {metadata && Object.keys(metadata).length > 0 && (
        <>
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              📊 元数据
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {metadata.viewCount != null && (
                <div>
                  <span className="text-xs text-gray-400">观看</span>
                  <p className="text-sm text-gray-700 font-medium">
                    {formatNumber(Number(metadata.viewCount))}
                  </p>
                </div>
              )}
              {metadata.stars != null && (
                <div>
                  <span className="text-xs text-gray-400">星标</span>
                  <p className="text-sm text-gray-700 font-medium">
                    {formatNumber(Number(metadata.stars))}
                  </p>
                </div>
              )}
              {metadata.forks != null && (
                <div>
                  <span className="text-xs text-gray-400">复刻</span>
                  <p className="text-sm text-gray-700 font-medium">
                    {formatNumber(Number(metadata.forks))}
                  </p>
                </div>
              )}
              {metadata.language && (
                <div>
                  <span className="text-xs text-gray-400">语言</span>
                  <p className="text-sm text-gray-700 font-medium">
                    {metadata.language}
                  </p>
                </div>
              )}
            </div>
          </section>
          <hr className="border-gray-100 mb-6" />
        </>
      )}

      {/* ─── 评论区 ─── */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          💬 评论 ({content.comments.length})
        </h3>

        {content.comments.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
            <p className="text-4xl">💬</p>
            <p className="mt-3 text-sm text-gray-400">暂无评论</p>
            <p className="mt-1 text-xs text-gray-300">
              采集到评论后会出现在这里
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {content.comments.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-gray-100 bg-white p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                      {c.authorName[0] ?? "?"}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-800">
                        {c.authorName}
                      </span>
                      <span className="ml-2 text-[11px] text-gray-400">
                        {formatTimeAgo(c.createdAt)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    👍 {c.likeCount}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <hr className="border-gray-100 mb-6" />

      {/* ─── 底部导航 ─── */}
      <div className="flex justify-between pt-2">
        {prevContent ? (
          <Link
            href={`/contents/${prevContent.id}`}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← 上一篇
          </Link>
        ) : (
          <span className="text-sm text-gray-300">← 第一篇</span>
        )}
        {nextContent ? (
          <Link
            href={`/contents/${nextContent.id}`}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            下一篇 →
          </Link>
        ) : (
          <span className="text-sm text-gray-300">最后一篇 →</span>
        )}
      </div>
    </main>
  )
}

// ============================================================
// 常量
// ============================================================
const PLATFORM_ICONS: Record<string, string> = {
  YOUTUBE: "▶️",
  BILIBILI: "📺",
  GITHUB: "📦",
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  VIDEO: "视频",
  ARTICLE: "文章",
  REPOSITORY: "仓库",
}

// ============================================================
// 辅助函数
// ============================================================
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时前`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} 天前`
  return date.toLocaleDateString("zh-CN")
}

function formatNumber(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
