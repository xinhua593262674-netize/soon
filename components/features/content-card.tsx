/**
 * 内容卡片 — 可复用的内容展示卡片
 *
 * 从 app/page.tsx 提取，新增 contentScenarios 展示。
 * 用于首页、板块页、场景详情页。
 */

import Link from "next/link"
import Image from "next/image"
import { ScenarioTag } from "./scenario-tag"

// ============================================================
// Props
// ============================================================
export interface ContentCardContent {
  id: string
  title: string
  url: string
  summary: string | null
  thumbnailUrl: string | null
  contentType: string
  publishedAt: Date
  source: {
    name: string
    platform: string
    avatarUrl: string | null
  }
  tags: { tag: { name: string } }[]
  contentScenarios?: {
    scenario: { icon: string; name: string; slug: string }
  }[]
  _count: { comments: number }
}

interface ContentCardProps {
  content: ContentCardContent
}

// ============================================================
// 常量
// ============================================================
const PLATFORM_ICONS: Record<string, string> = {
  YOUTUBE: "▶️",
  BILIBILI: "📺",
  GITHUB: "📦",
  XIAOHONGSHU: "📕",
  DOUYIN: "🎵",
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  VIDEO: "视频",
  ARTICLE: "文章",
  REPOSITORY: "仓库",
}

// ============================================================
// 组件
// ============================================================
export function ContentCard({ content }: ContentCardProps) {
  const platformIcon = PLATFORM_ICONS[content.source.platform] ?? "🔗"
  const typeLabel = CONTENT_TYPE_LABELS[content.contentType] ?? content.contentType

  return (
    <article className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* 平台图标 + 类型标签 + 标题 */}
      <div className="flex items-start gap-2">
        <span className="mt-0.5 inline-flex flex-shrink-0 items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
          {platformIcon} {typeLabel}
        </span>
        <Link
          href={`/contents/${content.id}`}
          className="text-base font-semibold text-gray-900 transition-colors hover:text-primary-600"
        >
          {content.title}
        </Link>
      </div>

      {/* AI 摘要 */}
      {content.summary && (
        <p className="mt-1.5 text-sm leading-relaxed text-gray-500 line-clamp-2">
          {content.summary}
        </p>
      )}

      {/* 元数据行 */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
        {/* 来源信息 */}
        {content.source.avatarUrl && (
          <Image
            src={content.source.avatarUrl}
            alt=""
            width={16}
            height={16}
            className="h-4 w-4 rounded-full"
          />
        )}
        <span>{content.source.name}</span>

        {/* 发布时间 */}
        <span>{formatTimeAgo(content.publishedAt)}</span>

        {/* 互动统计 */}
        <span>💬 {content._count.comments}</span>

        {/* 场景标签（蓝色圆角矩形，区别于普通标签） */}
        {content.contentScenarios?.map((cs) => (
          <ScenarioTag
            key={cs.scenario.slug}
            icon={cs.scenario.icon}
            name={cs.scenario.name}
            slug={cs.scenario.slug}
          />
        ))}

        {/* 普通标签 */}
        {content.tags.slice(0, 3).map((ct) => (
          <span
            key={ct.tag.name}
            className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500"
          >
            #{ct.tag.name}
          </span>
        ))}

        {/* 原文链接 */}
        <a
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-gray-300 transition-colors hover:text-gray-500"
          title="查看原文"
        >
          🔗 原文
        </a>
      </div>
    </article>
  )
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
