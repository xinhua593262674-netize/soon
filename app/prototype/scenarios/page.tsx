"use client"

/**
 * 🎨 设计原型 — 应用场景 + 日期筛选 + 分页
 *
 * 演示所有列表增强 UI 组件：
 * - 应用场景维度（导航卡片、场景标签、场景筛选）
 * - 日期筛选（快捷 chip + 自定义日期面板）
 * - 分页器（页码 + 省略号 + 上下页）
 * - 组合筛选栏（日期 + 场景共存）
 *
 * 路由: /prototype/scenarios
 */

import { useState } from "react"
import { cn } from "@/lib/utils"

// ============================================================
// Mock Data
// ============================================================
const MOCK_SCENARIOS = [
  { id: "1", slug: "ai-coding", icon: "🤖", name: "AI Coding", desc: "AI 辅助编程、代码生成、IDE 插件", count: 12 },
  { id: "2", slug: "ai-ppt", icon: "📊", name: "AI 做 PPT", desc: "AI 生成演示文稿、幻灯片工具", count: 8 },
  { id: "3", slug: "ai-video", icon: "🎬", name: "AI 做视频", desc: "AI 视频生成、剪辑、特效", count: 5 },
  { id: "4", slug: "ai-writing", icon: "✍️", name: "AI 写作", desc: "AI 文案、小说、公文、翻译", count: 15 },
  { id: "5", slug: "ai-drawing", icon: "🎨", name: "AI 绘画", desc: "AI 图像生成、风格迁移、修图", count: 9 },
  { id: "6", slug: "ai-data", icon: "📈", name: "AI 数据分析", desc: "AI 数据处理、可视化、报表", count: 3 },
  { id: "7", slug: "ai-automation", icon: "⚡", name: "AI 自动化", desc: "AI Agent、工作流、RPA", count: 7 },
  { id: "8", slug: "ai-voice", icon: "🎙️", name: "AI 语音", desc: "TTS、语音克隆、音乐生成", count: 4 },
  { id: "9", slug: "ai-search", icon: "🔍", name: "AI 搜索", desc: "智能搜索、知识库、RAG", count: 6 },
  { id: "10", slug: "ai-design", icon: "🧑‍🎨", name: "AI 设计", desc: "UI 设计、Logo、海报生成", count: 2 },
]

const MOCK_CONTENTS = [
  {
    id: "c1", title: "Claude Code 最佳实践：从入门到精通",
    summary: "深入介绍如何在 Claude Code 中高效使用 Skills、MCP Servers 和 Hooks，提升 AI 编程效率。",
    platform: "YOUTUBE", platformIcon: "▶️", contentType: "VIDEO", typeLabel: "视频",
    source: { name: "Matt Pocock", avatarUrl: "" },
    publishedAt: new Date("2026-05-30T10:00:00"), commentCount: 23,
    scenarios: [{ icon: "🤖", name: "AI Coding", slug: "ai-coding" }],
    tags: [{ name: "ClaudeCode" }, { name: "Skill" }, { name: "MCP" }],
  },
  {
    id: "c2", title: "Gamma.app 推出 AI PPT 3.0：一句话生成整套演示文稿",
    summary: "Gamma 3.0 支持自然语言描述生成完整 PPT，自动匹配设计风格和图表，大幅降低做 PPT 门槛。",
    platform: "GITHUB", platformIcon: "📦", contentType: "ARTICLE", typeLabel: "文章",
    source: { name: "TechCrunch", avatarUrl: "" },
    publishedAt: new Date("2026-05-29T14:00:00"), commentCount: 45,
    scenarios: [{ icon: "📊", name: "AI 做 PPT", slug: "ai-ppt" }, { icon: "🧑‍🎨", name: "AI 设计", slug: "ai-design" }],
    tags: [{ name: "Gamma" }, { name: "PPT" }, { name: "新产品" }],
  },
  {
    id: "c3", title: "Runway Gen-4 视频生成模型发布：质量飞跃",
    summary: "Runway 推出新一代视频生成模型，支持更长时长、更高分辨率的 AI 视频创作，效果逼近实拍。",
    platform: "BILIBILI", platformIcon: "📺", contentType: "VIDEO", typeLabel: "视频",
    source: { name: "AI科技评论", avatarUrl: "" },
    publishedAt: new Date("2026-05-28T09:30:00"), commentCount: 67,
    scenarios: [{ icon: "🎬", name: "AI 做视频", slug: "ai-video" }],
    tags: [{ name: "Runway" }, { name: "视频生成" }, { name: "Gen-4" }],
  },
  {
    id: "c4", title: "Cursor + Vercel + Prisma: 全栈 AI Coding 工具链实战",
    summary: "使用 Cursor IDE 搭配 Vercel 部署和 Prisma ORM，30 分钟搭建一个完整的全栈应用。",
    platform: "YOUTUBE", platformIcon: "▶️", contentType: "VIDEO", typeLabel: "视频",
    source: { name: "Fireship", avatarUrl: "" },
    publishedAt: new Date("2026-05-27T16:00:00"), commentCount: 34,
    scenarios: [{ icon: "🤖", name: "AI Coding", slug: "ai-coding" }, { icon: "⚡", name: "AI 自动化", slug: "ai-automation" }],
    tags: [{ name: "Cursor" }, { name: "Vercel" }, { name: "Prisma" }],
  },
]

const BOARDS = [
  { id: "b1", name: "AI 资讯", desc: "最新 AI 行业资讯与动态", totalCount: 156 },
  { id: "b2", name: "AI 教程", desc: "AI 工具与开发实战教程", totalCount: 89 },
]

const PERIODS = [
  { value: "all", label: "全部" },
  { value: "today", label: "今天" },
  { value: "7d", label: "最近7天" },
  { value: "30d", label: "最近30天" },
  { value: "90d", label: "最近3个月" },
] as const

type Period = (typeof PERIODS)[number]["value"] | "custom"
type View = "home" | "scenario-detail" | "board" | "admin"

// ============================================================
// 主页面
// ============================================================
export default function PrototypeScenariosPage() {
  const [view, setView] = useState<View>("home")
  const [activeScenario, setActiveScenario] = useState(MOCK_SCENARIOS[0])
  const [selectedScenarioSlug, setSelectedScenarioSlug] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [showEmpty, setShowEmpty] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [showCustomDate, setShowCustomDate] = useState(false)
  const totalPages = 8 // 模拟总页数
  const totalCount = 156

  return (
    <div className="mx-auto max-w-5xl">
      {/* 原型控制栏 */}
      <PrototypeToolbar
        view={view} setView={setView}
        period={period} setPeriod={setPeriod}
        currentPage={currentPage} setCurrentPage={setCurrentPage}
        showEmpty={showEmpty} setShowEmpty={setShowEmpty}
        showLoading={showLoading} setShowLoading={setShowLoading}
        showCustomDate={showCustomDate} setShowCustomDate={setShowCustomDate}
        onScenarioChange={(slug) => {
          const s = MOCK_SCENARIOS.find((x) => x.slug === slug)
          if (s) setActiveScenario(s)
        }}
        totalPages={totalPages}
      />

      {/* 原型内容区 */}
      <div className="rounded-xl border-2 border-dashed border-primary-200 bg-white p-6">
        <div className="mb-4 text-xs font-medium uppercase tracking-wider text-primary-400">
          {view === "home" && `🏠 首页 — period=${period}`}
          {view === "scenario-detail" && `📄 场景详情页 — /scenarios/${activeScenario?.slug}?period=${period}&page=${currentPage}`}
          {view === "board" && `📋 板块页 — period=${period}&page=${currentPage}${selectedScenarioSlug ? `&scenario=${selectedScenarioSlug}` : ""}`}
          {view === "admin" && "⚙️ 管理后台 — 场景标注与管理"}
        </div>

        {showLoading ? (
          <LoadingState view={view} />
        ) : showEmpty ? (
          <EmptyState view={view} period={period} onClear={() => { setPeriod("all"); setShowEmpty(false) }} />
        ) : view === "home" ? (
          <HomeView scenarios={MOCK_SCENARIOS} contents={MOCK_CONTENTS} boards={BOARDS} selectedScenarioSlug={selectedScenarioSlug} period={period} setPeriod={setPeriod} showCustomDate={showCustomDate} setShowCustomDate={setShowCustomDate} />
        ) : view === "scenario-detail" ? (
          <ScenarioDetailView scenario={activeScenario!} contents={MOCK_CONTENTS} period={period} setPeriod={setPeriod} showCustomDate={showCustomDate} setShowCustomDate={setShowCustomDate} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} totalCount={activeScenario!.count} />
        ) : view === "board" ? (
          <BoardView board={BOARDS[0]!} scenarios={MOCK_SCENARIOS} contents={MOCK_CONTENTS} selectedScenarioSlug={selectedScenarioSlug} onSelectScenario={setSelectedScenarioSlug} period={period} setPeriod={setPeriod} showCustomDate={showCustomDate} setShowCustomDate={setShowCustomDate} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} totalCount={totalCount} />
        ) : (
          <AdminView scenarios={MOCK_SCENARIOS} contents={MOCK_CONTENTS} />
        )}
      </div>
    </div>
  )
}

// ============================================================
// 原型控制栏
// ============================================================
function PrototypeToolbar({
  view, setView,
  period, setPeriod,
  currentPage, setCurrentPage,
  showEmpty, setShowEmpty,
  showLoading, setShowLoading,
  showCustomDate, setShowCustomDate,
  onScenarioChange,
  totalPages,
}: {
  view: View; setView: (v: View) => void
  period: Period; setPeriod: (p: Period) => void
  currentPage: number; setCurrentPage: (p: number) => void
  showEmpty: boolean; setShowEmpty: (b: boolean) => void
  showLoading: boolean; setShowLoading: (b: boolean) => void
  showCustomDate: boolean; setShowCustomDate: (b: boolean) => void
  onScenarioChange: (slug: string) => void
  totalPages: number
}) {
  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {/* 视图切换 */}
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">视图:</span>
        {(["home", "scenario-detail", "board", "admin"] as const).map((v) => (
          <button key={v} onClick={() => { setView(v); setCurrentPage(1) }}
            className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              view === v ? "bg-gray-900 text-white" : "border border-gray-200 bg-white text-gray-500 hover:border-gray-300")}>
            {v === "home" && "🏠 首页"}
            {v === "scenario-detail" && "📄 场景详情"}
            {v === "board" && "📋 板块筛选"}
            {v === "admin" && "⚙️ 管理后台"}
          </button>
        ))}

        <span className="text-xs text-gray-300">|</span>

        {/* 日期筛选 */}
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">时间:</span>
        {PERIODS.map((p) => (
          <button key={p.value} onClick={() => { setPeriod(p.value); setCurrentPage(1); setShowEmpty(false); setShowCustomDate(false) }}
            className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              period === p.value && !showCustomDate ? "bg-gray-900 text-white" : "border border-gray-200 bg-white text-gray-500 hover:border-gray-300")}>
            {p.label}
          </button>
        ))}
        <button onClick={() => { setShowCustomDate(!showCustomDate); setPeriod("custom"); setCurrentPage(1); setShowEmpty(false) }}
          className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            showCustomDate ? "bg-gray-900 text-white" : "border border-gray-200 bg-white text-gray-400 hover:border-gray-300")}>
          📅 自定义
        </button>

        <span className="text-xs text-gray-300">|</span>

        {/* 分页 */}
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">页码:</span>
        <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-500 hover:border-gray-300 disabled:opacity-30 transition-colors">◀</button>
        <span className="text-xs font-mono text-gray-700 min-w-[3ch] text-center">{currentPage}</span>
        <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-500 hover:border-gray-300 disabled:opacity-30 transition-colors">▶</button>
        <span className="text-[11px] text-gray-400">/ {totalPages}</span>

        <span className="text-xs text-gray-300">|</span>

        {/* 状态切换 */}
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">状态:</span>
        <button onClick={() => { setShowEmpty(!showEmpty); setShowLoading(false) }}
          className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            showEmpty ? "bg-amber-500 text-white" : "border border-gray-200 bg-white text-gray-500 hover:border-gray-300")}>
          📭 空状态
        </button>
        <button onClick={() => { setShowLoading(!showLoading); setShowEmpty(false) }}
          className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            showLoading ? "bg-purple-500 text-white" : "border border-gray-200 bg-white text-gray-500 hover:border-gray-300")}>
          ⏳ 加载态
        </button>

        <span className="text-xs text-gray-300">|</span>
        <label className="text-xs text-gray-500">
          场景:
          <select onChange={(e) => onScenarioChange(e.target.value)}
            className="ml-1 rounded border border-gray-200 px-2 py-1 text-xs">
            {MOCK_SCENARIOS.map((s) => (<option key={s.slug} value={s.slug}>{s.name}</option>))}
          </select>
        </label>
      </div>
    </div>
  )
}

// ============================================================
// 日期筛选 Chip 组（可复用）
// ============================================================
function DateFilter({
  period, showCustomDate, setShowCustomDate,
}: {
  period: Period; showCustomDate: boolean; setShowCustomDate: (b: boolean) => void
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      <span className="text-xs text-gray-400 font-medium flex-shrink-0">时间</span>
      {PERIODS.map((p) => {
        const isActive = period === p.value && !showCustomDate
        return (
          <span key={p.value}
            className={cn("flex-shrink-0 rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap cursor-pointer",
              isActive ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50")}>
            {p.label}
          </span>
        )
      })}
      <span onClick={() => setShowCustomDate(!showCustomDate)}
        className={cn("flex-shrink-0 rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap cursor-pointer",
          showCustomDate ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300")}>
        📅
      </span>
    </div>
  )
}

// ============================================================
// 自定义日期面板（P1）
// ============================================================
function CustomDatePanel({ onApply, onClear }: { onApply: () => void; onClear: () => void }) {
  return (
    <div className="absolute right-0 top-full mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-lg z-20 w-[280px]">
      <p className="text-xs font-medium text-gray-700 mb-3">自定义时间范围</p>
      <div className="space-y-3">
        <div>
          <label className="text-[11px] text-gray-400 mb-1 block">起始日期</label>
          <input type="date" defaultValue="2026-05-01"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300" />
        </div>
        <div>
          <label className="text-[11px] text-gray-400 mb-1 block">结束日期</label>
          <input type="date" defaultValue="2026-05-31"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <button onClick={onClear}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors">清除筛选</button>
        <button onClick={onApply}
          className="rounded-lg bg-gray-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors">应用</button>
      </div>
    </div>
  )
}

// ============================================================
// 分页器
// ============================================================
function Pagination({ currentPage, totalPages, totalCount }: { currentPage: number; totalPages: number; totalCount: number }) {
  if (totalPages <= 1) return null

  const pages = generatePageNumbers(currentPage, totalPages)

  return (
    <div className="flex flex-col items-center gap-2 pt-6 pb-4 border-t border-gray-100">
      <p className="text-xs text-gray-400">共 {totalCount} 条内容</p>
      <div className="flex items-center gap-1">
        {/* 上一页 */}
        {currentPage > 1 ? (
          <span className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 cursor-pointer">
            ← 上一页
          </span>
        ) : (
          <span className="inline-flex items-center rounded-lg border border-gray-100 px-3 py-1.5 text-xs text-gray-300 cursor-not-allowed">
            ← 上一页
          </span>
        )}

        {/* 页码 */}
        {pages.map((p, i) =>
          p === null ? (
            <span key={`e-${i}`} className="inline-flex items-center justify-center w-8 h-8 text-xs text-gray-300">...</span>
          ) : (
            <span key={p}
              className={cn("inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs transition-colors cursor-pointer",
                p === currentPage ? "bg-gray-900 text-white hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100")}>
              {p}
            </span>
          ))}
        {/* 下一页 */}
        {currentPage < totalPages ? (
          <span className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 cursor-pointer">
            下一页 →
          </span>
        ) : (
          <span className="inline-flex items-center rounded-lg border border-gray-100 px-3 py-1.5 text-xs text-gray-300 cursor-not-allowed">
            下一页 →
          </span>
        )}
      </div>
    </div>
  )
}

function generatePageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | null)[] = [1]
  if (current <= 4) {
    for (let i = 2; i <= Math.min(5, total - 1); i++) pages.push(i)
    if (total > 6) pages.push(null, total)
  } else if (current >= total - 3) {
    pages.push(null)
    for (let i = Math.max(total - 4, 2); i <= total; i++) pages.push(i)
  } else {
    pages.push(null)
    for (let i = current - 1; i <= current + 1; i++) pages.push(i)
    pages.push(null, total)
  }
  return pages
}

// ============================================================
// 筛选无结果空状态
// ============================================================
function FilterEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
      <p className="text-4xl">📭</p>
      <p className="mt-3 text-sm text-gray-400">该时间范围内暂无内容</p>
      <p className="mt-1 text-xs text-gray-300">尝试扩大时间范围或清除筛选条件</p>
      <button onClick={onClear}
        className="mt-3 inline-flex items-center rounded-lg border border-gray-200 px-4 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-50 cursor-pointer">
        清除筛选
      </button>
    </div>
  )
}

// ============================================================
// 1. 首页视图 — 场景导航区 + 日期筛选 + 内容卡片
// ============================================================
function HomeView({
  scenarios, contents, boards, selectedScenarioSlug, period, setPeriod, showCustomDate, setShowCustomDate,
}: {
  scenarios: typeof MOCK_SCENARIOS; contents: typeof MOCK_CONTENTS; boards: typeof BOARDS
  selectedScenarioSlug: string | null; period: Period; setPeriod: (p: Period) => void
  showCustomDate: boolean; setShowCustomDate: (b: boolean) => void
}) {
  return (
    <div>
      {/* ─── 1A. 首页场景导航区 ─── */}
      <section className="mb-8">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">📍 按场景浏览</h3>
        <div className="overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
          <div className="flex gap-3">
            {scenarios.map((s) => (
              <span key={s.id}
                className={cn("flex-shrink-0 w-[100px] rounded-xl border bg-white p-3 text-center transition hover:border-primary-300 hover:shadow-sm cursor-pointer",
                  "focus:outline-none focus:ring-2 focus:ring-primary-200",
                  selectedScenarioSlug === s.slug ? "border-primary-500 bg-primary-50 ring-1 ring-primary-200" : "border-gray-200")}>
                <span className="text-3xl mb-1.5 block">{s.icon}</span>
                <span className="text-sm font-medium text-gray-700 leading-tight">{s.name}</span>
                <span className="text-[11px] text-gray-400 mt-0.5 block">{s.count} 条内容</span>
              </span>
            ))}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-gray-300">← 横向滑动查看更多场景 →</p>
      </section>

      {/* ─── 1B. 日期筛选（新增） ─── */}
      <div className="mb-8 relative">
        <DateFilter period={period} showCustomDate={showCustomDate} setShowCustomDate={setShowCustomDate} />
        {showCustomDate && (
          <CustomDatePanel onApply={() => setShowCustomDate(false)} onClear={() => { setPeriod("all"); setShowCustomDate(false) }} />
        )}
      </div>

      {/* ─── 1C. 板块 + 内容卡片 ─── */}
      {boards.map((board) => (
        <section key={board.id} className="mb-12">
          <div className="mb-4 flex items-baseline justify-between border-b border-gray-200 pb-3">
            <h2 className="text-lg font-semibold text-gray-900">{board.name}</h2>
            <span className="text-xs text-gray-400">{board.totalCount} 条内容</span>
          </div>
          <div className="space-y-4">
            {contents.map((content) => (<ContentCard key={content.id} content={content} />))}
          </div>
        </section>
      ))}
    </div>
  )
}

// ============================================================
// 2. 内容卡片（含场景标签）
// ============================================================
function ContentCard({ content }: { content: (typeof MOCK_CONTENTS)[number] }) {
  return (
    <article className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 inline-flex flex-shrink-0 items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
          {content.platformIcon} {content.typeLabel}
        </span>
        <span className="text-base font-semibold text-gray-900 transition-colors hover:text-primary-600 cursor-pointer">
          {content.title}
        </span>
      </div>
      {content.summary && (
        <p className="mt-1.5 text-sm leading-relaxed text-gray-500 line-clamp-2">{content.summary}</p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
        <span>{content.source.name}</span>
        <span>{formatTimeAgo(content.publishedAt)}</span>
        <span>💬 {content.commentCount}</span>
        {/* 场景标签 */}
        {content.scenarios.map((s) => (
          <span key={s.slug}
            className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700 transition-colors hover:bg-primary-100 cursor-pointer">
            {s.icon} {s.name}
          </span>
        ))}
        {/* 普通标签 */}
        {content.tags.slice(0, 3).map((t) => (
          <span key={t.name} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">#{t.name}</span>
        ))}
        <span className="ml-auto text-gray-300 transition-colors hover:text-gray-500 cursor-pointer">🔗 原文</span>
      </div>
    </article>
  )
}

// ============================================================
// 3. 场景详情页 — 标题 + 板块子筛选 + 日期筛选 + 分页
// ============================================================
function ScenarioDetailView({
  scenario, contents, period, setPeriod, showCustomDate, setShowCustomDate,
  currentPage, totalPages, totalCount,
}: {
  scenario: (typeof MOCK_SCENARIOS)[number]; contents: typeof MOCK_CONTENTS
  period: Period; setPeriod: (p: Period) => void; showCustomDate: boolean; setShowCustomDate: (b: boolean) => void
  currentPage: number; setCurrentPage: (p: number) => void; totalPages: number; totalCount: number
}) {
  const [boardFilter, setBoardFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"latest" | "hot">("latest")

  return (
    <div>
      {/* 场景标题区 */}
      <div className="text-center py-8 border-b border-gray-100 mb-6">
        <span className="text-5xl mb-3 block">{scenario.icon}</span>
        <h1 className="text-2xl font-bold text-gray-900">{scenario.name}</h1>
        <p className="text-sm text-gray-500 mt-1.5">{scenario.desc}</p>
        <p className="text-xs text-gray-400 mt-2">{scenario.count} 条内容 · 最近更新：2小时前</p>
      </div>

      {/* 板块子筛选 */}
      <div className="flex items-center gap-2 text-xs mb-3">
        <span className="text-gray-400 flex-shrink-0">板块</span>
        {["all", ...BOARDS.map((b) => b.name)].map((label) => (
          <span key={label} onClick={() => setBoardFilter(label === "all" ? "all" : label)}
            className={cn("rounded-full px-3 py-1 text-xs border transition-colors whitespace-nowrap cursor-pointer",
              boardFilter === (label === "all" ? "all" : label) ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-300")}>
            {label === "all" ? "全部" : label}
          </span>
        ))}
      </div>

      {/* 日期筛选 + 排序 */}
      <div className="flex items-center justify-between gap-4 mb-6 relative">
        <DateFilter period={period} showCustomDate={showCustomDate} setShowCustomDate={setShowCustomDate} />
        {showCustomDate && (
          <CustomDatePanel onApply={() => setShowCustomDate(false)} onClear={() => { setPeriod("all"); setShowCustomDate(false) }} />
        )}
        <div className="flex items-center gap-2 text-xs ml-auto flex-shrink-0">
          <span className="text-gray-400">排序:</span>
          {(["latest", "hot"] as const).map((s) => (
            <span key={s} onClick={() => setSortBy(s)}
              className={cn("transition-colors cursor-pointer", sortBy === s ? "text-gray-900 font-medium underline underline-offset-4" : "text-gray-400 hover:text-gray-600")}>
              {s === "latest" ? "最新 ↑" : "最热"}
            </span>
          ))}
        </div>
      </div>

      {/* 内容列表 */}
      <div className="space-y-4">
        {contents.map((content) => (<ContentCard key={content.id} content={content} />))}
      </div>

      {/* 分页器 */}
      <Pagination currentPage={currentPage} totalPages={totalPages} totalCount={totalCount} />
    </div>
  )
}

// ============================================================
// 4. 板块页 — 日期筛选 + 场景筛选 + 分页
// ============================================================
function BoardView({
  board, scenarios, contents, selectedScenarioSlug, onSelectScenario,
  period, setPeriod, showCustomDate, setShowCustomDate,
  currentPage, totalPages, totalCount,
}: {
  board: (typeof BOARDS)[number]; scenarios: typeof MOCK_SCENARIOS; contents: typeof MOCK_CONTENTS
  selectedScenarioSlug: string | null; onSelectScenario: (slug: string | null) => void
  period: Period; setPeriod: (p: Period) => void; showCustomDate: boolean; setShowCustomDate: (b: boolean) => void
  currentPage: number; setCurrentPage: (p: number) => void; totalPages: number; totalCount: number
}) {
  return (
    <div>
      {/* 板块标题 */}
      <div className="mb-4 border-b border-gray-200 pb-3">
        <h2 className="text-lg font-semibold text-gray-900">{board.name}</h2>
        <p className="text-xs text-gray-400 mt-1">{board.desc}</p>
      </div>

      {/* ─── 组合筛选栏: 日期 + 场景 ─── */}
      <div className="space-y-3 mb-6">
        {/* 日期筛选 */}
        <div className="relative">
          <DateFilter period={period} showCustomDate={showCustomDate} setShowCustomDate={setShowCustomDate} />
          {showCustomDate && (
            <CustomDatePanel onApply={() => setShowCustomDate(false)} onClear={() => { setPeriod("all"); setShowCustomDate(false) }} />
          )}
        </div>

        {/* 场景筛选 */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-gray-400 font-medium flex-shrink-0">场景</span>
          <span onClick={() => onSelectScenario(null)}
            className={cn("flex-shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap cursor-pointer",
              !selectedScenarioSlug ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50")}>
            全部 {board.totalCount}
          </span>
          {scenarios.map((s) => {
            const isSelected = selectedScenarioSlug === s.slug
            const isEmpty = s.count === 0
            return (
              <span key={s.id} onClick={() => !isEmpty && onSelectScenario(s.slug)}
                className={cn("flex-shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap",
                  isSelected ? "bg-gray-900 text-white border-gray-900 cursor-pointer"
                  : isEmpty ? "border-gray-100 text-gray-300 cursor-not-allowed"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 cursor-pointer")}>
                {s.icon} {s.name}
                <span className="text-[10px] opacity-60">{s.count}</span>
              </span>
            )
          })}
        </div>
      </div>

      {/* 内容列表 */}
      <div className="space-y-4">
        {contents
          .filter((c) => selectedScenarioSlug ? c.scenarios.some((s) => s.slug === selectedScenarioSlug) : true)
          .map((content) => (<ContentCard key={content.id} content={content} />))}
        {selectedScenarioSlug && contents.filter((c) => c.scenarios.some((s) => s.slug === selectedScenarioSlug)).length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">该场景下暂无内容</p>
        )}
      </div>

      {/* 分页器 */}
      <Pagination currentPage={currentPage} totalPages={totalPages} totalCount={totalCount} />
    </div>
  )
}

// ============================================================
// 5. 管理后台 — 场景标注 + 场景管理
// ============================================================
function AdminView({ scenarios, contents }: { scenarios: typeof MOCK_SCENARIOS; contents: typeof MOCK_CONTENTS }) {
  const [activeTab, setActiveTab] = useState<"content" | "scenario-mgmt">("content")
  const [editingContentId, setEditingContentId] = useState<string | null>(null)
  const [selectedScenarios, setSelectedScenarios] = useState<Record<string, string[]>>({
    c1: ["1", "2"], c2: ["2", "10"], c3: ["3"], c4: ["1", "7"],
  })

  const toggleScenarioForContent = (contentId: string, scenarioId: string) => {
    setSelectedScenarios((prev) => {
      const current = prev[contentId] ?? []
      const next = current.includes(scenarioId) ? current.filter((id) => id !== scenarioId) : [...current, scenarioId].slice(0, 3)
      return { ...prev, [contentId]: next }
    })
  }

  const aiRecommendedIds = ["1", "2"]

  return (
    <div>
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        {(["content", "scenario-mgmt"] as const).map((tab) => (
          <span key={tab} onClick={() => setActiveTab(tab)}
            className={cn("pb-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] cursor-pointer",
              activeTab === tab ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600")}>
            {tab === "content" ? "📝 内容场景标注" : "🏷️ 场景管理"}
          </span>
        ))}
      </div>

      {activeTab === "content" ? (
        <div className="space-y-4">
          {contents.map((content) => {
            const isEditing = editingContentId === content.id
            const contentScenarioIds = selectedScenarios[content.id] ?? []
            const hasLowConfidence = content.id === "c3"
            return (
              <div key={content.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{content.platformIcon} {content.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{content.source.name} · {formatTimeAgo(content.publishedAt)}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-gray-400">场景:</span>
                      {contentScenarioIds.map((sid) => {
                        const s = scenarios.find((x) => x.id === sid)
                        if (!s) return null
                        const isAi = aiRecommendedIds.includes(sid)
                        return (
                          <span key={sid} className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium",
                            isAi ? "bg-green-50 text-green-700 border border-green-200" : "bg-primary-50 text-primary-700")}>
                            {s.icon} {s.name}{isAi && <span className="text-[9px] text-green-500 ml-0.5">AI</span>}
                          </span>
                        )
                      })}
                      {contentScenarioIds.length === 0 && <span className="text-[11px] text-gray-300">未标注</span>}
                      {hasLowConfidence && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-500">⚠️ 待确认场景</span>
                      )}
                    </div>
                  </div>
                  <span onClick={() => setEditingContentId(isEditing ? null : content.id)}
                    className="flex-shrink-0 text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors cursor-pointer">
                    {isEditing ? "收起" : "✏️ 编辑场景"}
                  </span>
                </div>

                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-3">选择场景（最多 3 个）:</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {scenarios.map((s) => {
                        const isSelected = contentScenarioIds.includes(s.id)
                        const isAiRecommended = aiRecommendedIds.includes(s.id)
                        const confidence = isAiRecommended ? (s.id === "1" ? 92 : 78) : null
                        return (
                          <span key={s.id} onClick={() => toggleScenarioForContent(content.id, s.id)}
                            className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors text-left cursor-pointer",
                              isSelected && isAiRecommended ? "border-green-400 bg-green-50"
                              : isSelected ? "border-primary-400 bg-primary-50"
                              : "border-gray-200 hover:border-gray-300")}>
                            <span className="text-sm">{isSelected ? "✓" : "○"}</span>
                            <span className="text-sm font-medium text-gray-700 truncate">{s.icon} {s.name}</span>
                            {isAiRecommended && confidence && <span className="text-[10px] text-gray-400 ml-auto flex-shrink-0">{confidence}%</span>}
                          </span>
                        )
                      })}
                    </div>
                    <div className="mt-3 text-xs text-gray-400">
                      🤖 AI 推荐:{" "}
                      {aiRecommendedIds.map((id) => { const s = scenarios.find((x) => x.id === id); return s ? (
                        <span key={id} onClick={() => setSelectedScenarios((prev) => ({ ...prev, [content.id]: aiRecommendedIds }))}
                          className="text-primary-600 hover:underline ml-1 cursor-pointer">{s.icon} {s.name}</span>
                      ) : null })}
                      <span className="ml-1">（点击快速应用）</span>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <span onClick={() => setEditingContentId(null)}
                        className="rounded-lg border border-gray-200 px-4 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">取消</span>
                      <span onClick={() => setEditingContentId(null)}
                        className="rounded-lg bg-gray-900 px-4 py-1.5 text-xs text-white hover:bg-gray-800 transition-colors cursor-pointer">保存</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">场景数: {scenarios.length} · 未标注内容: 3</p>
            <span className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors cursor-pointer">+ 新增</span>
          </div>
          <div className="space-y-3">
            {scenarios.map((s) => (
              <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{s.icon}</span>
                    <span className="text-base font-semibold text-gray-900">{s.name}</span>
                    <span className="text-xs text-gray-400">{s.count} 条内容</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">{s.slug}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
                  <p className="text-[11px] text-gray-300 mt-1">排序: {s.id}</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">编辑</span>
                  <span className="text-amber-500 hover:text-amber-700 transition-colors cursor-pointer">禁用</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// 状态组件
// ============================================================

function LoadingState({ view }: { view: View }) {
  return (
    <div className="space-y-8 animate-pulse">
      {/* 场景导航骨架 */}
      {view === "home" && (
        <div>
          <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
          <div className="flex gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[100px] h-[110px] rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      )}

      {/* 日期筛选骨架 */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-10 bg-gray-200 rounded" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-6 w-16 bg-gray-100 rounded-full" />
        ))}
      </div>

      {/* 内容卡片骨架 */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 p-5 space-y-3">
          <div className="h-5 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-1/2 bg-gray-100 rounded" />
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-gray-100 rounded-full" />
            <div className="h-5 w-16 bg-gray-100 rounded-full" />
            <div className="h-5 w-20 bg-gray-100 rounded-md" />
          </div>
        </div>
      ))}

      {/* 分页器骨架 (非首页) */}
      {view !== "home" && (
        <div className="flex flex-col items-center gap-2 pt-6 pb-4 border-t border-gray-100">
          <div className="h-3 w-24 bg-gray-100 rounded" />
          <div className="flex gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ view, period, onClear }: { view: View; period: Period; onClear: () => void }) {
  // 有时间筛选 → 筛选无结果
  if (period !== "all") {
    return (
      <div>
        {/* 依然展示筛选栏 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-400 font-medium">时间</span>
            <span className="rounded-full bg-gray-900 text-white border-gray-900 px-3 py-1 text-xs">{PERIODS.find(p => p.value === period)?.label}</span>
            <span className="text-[11px] text-gray-300">— 该时段内无结果</span>
          </div>
        </div>
        <FilterEmptyState onClear={onClear} />
      </div>
    )
  }

  if (view === "home") {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-200 py-20 text-center">
        <p className="text-5xl">📭</p>
        <p className="mt-4 text-base font-medium text-gray-500">还没有任何内容</p>
        <p className="mt-2 text-sm text-gray-400">
          前往<span className="mx-1 text-primary-600 underline underline-offset-2 cursor-pointer">管理后台</span>添加种子博主，内容会自动采集到这里
        </p>
      </div>
    )
  }

  if (view === "scenario-detail") {
    return (
      <div>
        <div className="text-center py-8 border-b border-gray-100 mb-6">
          <span className="text-5xl mb-3 block">🤖</span>
          <h1 className="text-2xl font-bold text-gray-900">AI Coding</h1>
          <p className="text-sm text-gray-500 mt-1.5">AI 辅助编程、代码生成、IDE 插件</p>
          <p className="text-xs text-gray-400 mt-2">0 条内容</p>
        </div>
        <div className="rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-4xl">📭</p>
          <p className="mt-3 text-sm text-gray-400">该场景下还没有内容</p>
          <p className="mt-1 text-xs text-gray-300">采集到的相关内容会自动出现在这里</p>
        </div>
      </div>
    )
  }

  if (view === "board") {
    return (
      <div>
        <div className="mb-4 border-b border-gray-200 pb-3">
          <h2 className="text-lg font-semibold text-gray-900">AI 资讯</h2>
          <p className="text-xs text-gray-400 mt-1">最新 AI 行业资讯与动态</p>
        </div>
        <div className="rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-4xl">📭</p>
          <p className="mt-3 text-sm text-gray-400">AI 资讯 板块还没有内容</p>
          <p className="mt-1 text-xs text-gray-300">采集到的内容会自动出现在这里</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
      <p className="text-4xl">📋</p>
      <p className="mt-3 text-sm text-gray-400">暂无场景</p>
      <span className="mt-4 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors cursor-pointer">新增第一个场景</span>
    </div>
  )
}

// ============================================================
// 工具函数
// ============================================================
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时前`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} 天前`
  return date.toLocaleDateString("zh-CN")
}
