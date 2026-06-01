"use client"

/**
 * 🎨 设计原型 — 来源切换 + 内容详情页 + 评论
 *
 * 路由: /prototype/detail
 * 演示: 平台筛选｜内容详情页｜评论区｜组合筛选栏
 */

import { useState } from "react"
import { cn } from "@/lib/utils"

// ============================================================
// Mock Data
// ============================================================
const MOCK_DETAIL = {
  id: "c1",
  title: "Claude Code 最佳实践：从入门到精通",
  summary: "深入介绍如何在 Claude Code 中高效使用 Skills、MCP Servers 和 Hooks。\n\n涵盖自定义 Slash Command 创建、Memory 文件管理、项目级配置以及多 Agent 协作模式。\n\n适合想要提升 AI 编程效率的开发者。",
  platform: "YOUTUBE" as const,
  platformIcon: "▶️",
  contentType: "VIDEO",
  source: { name: "Matt Pocock", avatarUrl: "", platform: "YOUTUBE" },
  publishedAt: new Date("2026-05-30T10:00:00"),
  viewCount: 125000,
  commentCount: 23,
  url: "https://www.youtube.com/watch?v=xxx",
  scenarios: [
    { icon: "🤖", name: "AI Coding", slug: "ai-coding" },
    { icon: "⚡", name: "AI 自动化", slug: "ai-automation" },
  ],
  tags: [{ name: "ClaudeCode" }, { name: "Skill" }, { name: "MCP" }],
  metadata: {
    duration: "24:18",
    viewCount: 125000,
    likeCount: 8900,
  },
}

const MOCK_COMMENTS = [
  { id: "cm1", authorName: "devguy42", authorAvatar: "", body: "This is exactly what I needed! The Skill system is a game changer for my workflow. Been using it for a week now.", likeCount: 45, platform: "YOUTUBE", createdAt: new Date("2026-05-30T15:00:00") },
  { id: "cm2", authorName: "aibuilder", authorAvatar: "", body: "Great tutorial. One question — how do you handle MCP server reconnection when the underlying service restarts?", likeCount: 23, platform: "YOUTUBE", createdAt: new Date("2026-05-30T18:00:00") },
  { id: "cm3", authorName: "typescript_fan", authorAvatar: "", body: "Finally someone explaining this clearly. The packet system is underrated.", likeCount: 12, platform: "YOUTUBE", createdAt: new Date("2026-05-30T20:00:00") },
  { id: "cm4", authorName: "newbie_coder", authorAvatar: "", body: "Just starting out with Claude Code. This helped a ton! 🙏", likeCount: 8, platform: "YOUTUBE", createdAt: new Date("2026-05-31T02:00:00") },
  { id: "cm5", authorName: "senior_dev", authorAvatar: "", body: "Would love to see a follow-up on how to combine multiple Skills into a workflow. The composability aspect is fascinating.", likeCount: 31, platform: "YOUTUBE", createdAt: new Date("2026-05-31T08:00:00") },
]

const MOCK_COMMENTS_ZH = [
  { id: "cm6", authorName: "小明学AI", authorAvatar: "", body: "太棒了！Claude Code 真的是我今年用过最好的 AI 编程工具", likeCount: 128, platform: "BILIBILI", createdAt: new Date("2026-05-29T10:00:00") },
  { id: "cm7", authorName: "程序员老王", authorAvatar: "", body: "Skill 系统确实好用，我已经写了 5 个自定义 Skill 了", likeCount: 67, platform: "BILIBILI", createdAt: new Date("2026-05-29T14:00:00") },
  { id: "cm8", authorName: "AI工具评测", authorAvatar: "", body: "对比了一下 Cursor 和 Claude Code，感觉各有千秋。Claude Code 的灵活性更强", likeCount: 89, platform: "BILIBILI", createdAt: new Date("2026-05-29T20:00:00") },
]

const SCENARIOS = [
  { id: "1", slug: "ai-coding", icon: "🤖", name: "AI Coding", count: 12 },
  { id: "2", slug: "ai-ppt", icon: "📊", name: "AI 做 PPT", count: 8 },
  { id: "3", slug: "ai-video", icon: "🎬", name: "AI 做视频", count: 5 },
]

const PERIODS = ["全部", "今天", "最近7天", "最近30天", "最近3个月"]
const PLATFORMS = [
  { value: "", label: "全部", icon: "" },
  { value: "bilibili", label: "B站", icon: "📺", count: 0 },
  { value: "youtube", label: "YouTube", icon: "▶️", count: 15 },
  { value: "github", label: "GitHub", icon: "📦", count: 42 },
]

// ============================================================
// 视图
// ============================================================
type View = "filter-bar" | "detail" | "detail-zh" | "detail-empty" | "detail-loading"

export default function PrototypeDetailPage() {
  const [view, setView] = useState<View>("filter-bar")
  const [period, setPeriod] = useState("全部")
  const [platform, setPlatform] = useState("")
  const [scenario, setScenario] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-5xl">
      {/* 控制栏 */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">视图:</span>
          {([
            { v: "filter-bar", label: "📋 组合筛选栏" },
            { v: "detail", label: "📄 详情页-YouTube" },
            { v: "detail-zh", label: "📄 详情页-B站" },
            { v: "detail-empty", label: "📭 详情页-空评论" },
            { v: "detail-loading", label: "⏳ 详情页-加载态" },
          ] as const).map(({ v, label }) => (
            <button key={v} onClick={() => setView(v as View)}
              className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                view === v ? "bg-gray-900 text-white" : "border border-gray-200 bg-white text-gray-500 hover:border-gray-300")}>
              {label}
            </button>
          ))}
          <span className="text-xs text-gray-300">|</span>
          <label className="text-xs text-gray-500">
            时间: <select value={period} onChange={e => setPeriod(e.target.value)} className="ml-1 rounded border border-gray-200 px-2 py-1 text-xs">
              {PERIODS.map(p => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label className="text-xs text-gray-500">
            平台: <select value={platform} onChange={e => setPlatform(e.target.value)} className="ml-1 rounded border border-gray-200 px-2 py-1 text-xs">
              {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      {/* 内容区 */}
      <div className="rounded-xl border-2 border-dashed border-primary-200 bg-white p-6">
        <div className="mb-4 text-xs font-medium uppercase tracking-wider text-primary-400">
          {view === "filter-bar" && "📋 组合筛选栏 — 时间 + 平台 + 场景"}
          {view === "detail" && "📄 /contents/c1 — YouTube 视频详情"}
          {view === "detail-zh" && "📄 /contents/c1 — B站 视频详情"}
          {view === "detail-empty" && "📭 详情页（无评论）"}
          {view === "detail-loading" && "⏳ 详情页加载态"}
        </div>

        {view === "detail-loading" ? (
          <DetailLoadingSkeleton />
        ) : view === "filter-bar" ? (
          <CombinedFilterBar period={period} platform={platform} scenario={scenario} setScenario={setScenario} />
        ) : view === "detail-empty" ? (
          <ContentDetail content={MOCK_DETAIL} comments={[]} />
        ) : (
          <ContentDetail content={MOCK_DETAIL} comments={view === "detail-zh" ? MOCK_COMMENTS_ZH : MOCK_COMMENTS} />
        )}
      </div>
    </div>
  )
}

// ============================================================
// 1. 组合筛选栏（三层）
// ============================================================
function CombinedFilterBar({ period, platform, scenario, setScenario }: {
  period: string; platform: string; scenario: string | null; setScenario: (s: string | null) => void
}) {
  return (
    <div className="space-y-3 pb-3 border-b border-gray-100">
      {/* 时间 */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <span className="text-xs text-gray-400 font-medium flex-shrink-0 w-8">时间</span>
        {PERIODS.map((p) => {
          const isActive = period === p
          return (
            <span key={p} className={cn("flex-shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap cursor-pointer",
              isActive ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50")}>
              {p}
            </span>
          )
        })}
        <span className="flex-shrink-0 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-400 cursor-pointer">📅</span>
      </div>

      {/* 平台 */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <span className="text-xs text-gray-400 font-medium flex-shrink-0 w-8">平台</span>
        {PLATFORMS.map((p) => {
          const isActive = platform === p.value
          return (
            <span key={p.value} className={cn("flex-shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap cursor-pointer",
              isActive ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50")}>
              {p.icon && <span>{p.icon}</span>}
              {p.label}
              {p.count !== undefined && <span className="text-[10px] opacity-60">{p.count}</span>}
            </span>
          )
        })}
      </div>

      {/* 场景 */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <span className="text-xs text-gray-400 font-medium flex-shrink-0 w-8">场景</span>
        <span onClick={() => setScenario(null)}
          className={cn("flex-shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap cursor-pointer",
            !scenario ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50")}>
          全部 57
        </span>
        {SCENARIOS.map((s) => (
          <span key={s.id} onClick={() => setScenario(s.slug)}
            className={cn("flex-shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap cursor-pointer",
              scenario === s.slug ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50")}>
            {s.icon} {s.name}
            <span className="text-[10px] opacity-60">{s.count}</span>
          </span>
        ))}
      </div>

      {/* 说明 */}
      <p className="text-[11px] text-gray-400 pt-2">
        ↑ 三层筛选自由组合。切换任一筛选 → 分页回到第1页。所有状态写入 URL searchParams。
      </p>
    </div>
  )
}

// ============================================================
// 2. 内容详情页
// ============================================================
function ContentDetail({ content, comments }: { content: typeof MOCK_DETAIL; comments: typeof MOCK_COMMENTS }) {
  const isZh = comments.length > 0 && comments[0]!.body.includes("太棒")

  return (
    <div>
      {/* 返回链接 */}
      <span className="inline-flex items-center text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer mb-6">
        ← 返回列表
      </span>

      {/* ─── 标题区 ─── */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            {content.platformIcon} {content.source.platform === "YOUTUBE" ? "视频" : "仓库"}
          </span>
          <span className="text-xs text-gray-400">
            {content.publishedAt.toLocaleDateString("zh-CN")}
          </span>
          {content.metadata?.duration && (
            <span className="text-xs text-gray-400">⏱ {content.metadata.duration}</span>
          )}
        </div>
        <h1 className="text-xl font-bold text-gray-900 leading-snug">{content.title}</h1>
      </div>

      {/* ─── 来源信息卡 ─── */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-6">
        <p className="text-sm text-gray-600">
          转载自 <span className="font-medium">{content.platformIcon} {content.source.name}</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          发布于 {content.publishedAt.toLocaleDateString("zh-CN")}
          {content.metadata?.viewCount && ` · 👀 ${formatNumber(content.metadata.viewCount)} 次观看`}
          {content.metadata?.likeCount && ` · 👍 ${formatNumber(content.metadata.likeCount)} 次点赞`}
        </p>
        <a href={content.url} target="_blank" rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
          🔗 查看原文 ({content.source.platform === "YOUTUBE" ? "youtube.com" : "bilibili.com"})
        </a>
      </div>

      <hr className="border-gray-100 mb-6" />

      {/* ─── AI 摘要 ─── */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">📝 AI 摘要</h3>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {content.summary}
        </p>
      </section>

      <hr className="border-gray-100 mb-6" />

      {/* ─── 标签区 ─── */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">🏷️ 标签</h3>
        <div className="flex flex-wrap gap-2">
          {content.scenarios.map((s) => (
            <span key={s.slug} className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700">
              {s.icon} {s.name}
            </span>
          ))}
          {content.tags.map((t) => (
            <span key={t.name} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">
              #{t.name}
            </span>
          ))}
        </div>
      </section>

      <hr className="border-gray-100 mb-6" />

      {/* ─── 元数据区 ─── */}
      {content.metadata && (
        <>
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">📊 元数据</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {content.metadata.viewCount && <div><span className="text-xs text-gray-400">观看</span><p className="text-sm text-gray-700 font-medium">{formatNumber(content.metadata.viewCount)}</p></div>}
              {content.metadata.likeCount && <div><span className="text-xs text-gray-400">点赞</span><p className="text-sm text-gray-700 font-medium">{formatNumber(content.metadata.likeCount)}</p></div>}
              {content.metadata.duration && <div><span className="text-xs text-gray-400">时长</span><p className="text-sm text-gray-700 font-medium">{content.metadata.duration}</p></div>}
              <div><span className="text-xs text-gray-400">平台</span><p className="text-sm text-gray-700 font-medium">{content.source.platform}</p></div>
            </div>
          </section>
          <hr className="border-gray-100 mb-6" />
        </>
      )}

      {/* ─── 评论区 ─── */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          💬 评论 ({comments.length})
        </h3>

        {comments.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
            <p className="text-4xl">💬</p>
            <p className="mt-3 text-sm text-gray-400">暂无评论</p>
            <p className="mt-1 text-xs text-gray-300">采集到评论后会出现在这里</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="rounded-lg border border-gray-100 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                      {c.authorName[0]}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-800">{c.authorName}</span>
                      <span className="ml-2 text-[11px] text-gray-400">
                        {isZh ? formatTimeZh(c.createdAt) : formatTimeAgo(c.createdAt)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    👍 {c.likeCount}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <hr className="border-gray-100 mb-6" />

      {/* ─── 底部导航 ─── */}
      <div className="flex justify-between pt-2">
        <span className="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
          ← 上一篇
        </span>
        <span className="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
          下一篇 →
        </span>
      </div>
    </div>
  )
}

// ============================================================
// 3. 详情页加载骨架
// ============================================================
function DetailLoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-20 bg-gray-200 rounded mb-6" />
      <div className="flex items-center gap-3 mb-2">
        <div className="h-5 w-12 bg-gray-200 rounded" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
      <div className="h-7 w-3/4 bg-gray-300 rounded mb-6" />
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-6 space-y-2">
        <div className="h-5 w-48 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
      <hr className="border-gray-100 mb-6" />
      <div className="h-4 w-16 bg-gray-200 rounded mb-2" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
      </div>
      <hr className="border-gray-100 mb-6 mt-6" />
      <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-full bg-gray-200 rounded mt-2" />
        </div>
      ))}
    </div>
  )
}

// ============================================================
// 工具函数
// ============================================================
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString("zh-CN")
}

function formatTimeZh(date: Date): string {
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
