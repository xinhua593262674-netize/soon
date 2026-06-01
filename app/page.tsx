/**
 * 假装社区 — 首页
 *
 * 按板块展示已发布的聚合内容，卡片式布局。
 * 新增：
 * - 场景导航卡片区（按场景浏览）
 * - 日期筛选 chip 行
 * - 内容卡片展示场景标签
 */

import { db } from "@/lib/db"
import { periodToDateRange } from "@/lib/periods"
import { DateFilter, PlatformFilter, ScenarioCard, ContentCard } from "@/components"
import Link from "next/link"

interface HomePageProps {
  searchParams: Promise<{ period?: string; platform?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = await searchParams
  const period = sp.period || "all"
  const platform = sp.platform || ""
  const dateRange = periodToDateRange(period)

  // 并发查场景 + 板块
  const [scenarios, boards] = await Promise.all([
    db.scenario.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { contents: { where: { content: { status: "PUBLISHED" } } } },
        },
      },
    }),
    db.board.findMany({
      orderBy: { order: "asc" },
      include: {
        contents: {
          where: { status: "PUBLISHED", publishedAt: dateRange },
          orderBy: { publishedAt: "desc" },
          take: 20,
          include: {
            source: true,
            tags: { include: { tag: true } },
            contentScenarios: { include: { scenario: true } },
            _count: { select: { comments: true } },
          },
        },
        _count: { select: { contents: { where: { status: "PUBLISHED" } } } },
      },
    }),
  ])

  const hasAnyContent = boards.some((b) => b.contents.length > 0)
  const searchParamObj: Record<string, string | undefined> = { period: sp.period, platform: sp.platform }

  // 各平台内容计数
  const platformCounts = { bilibili: 0, youtube: 0, github: 0 }
  for (const b of boards) {
    for (const c of b.contents) {
      const pt = c.source.platform.toLowerCase()
      if (pt in platformCounts) platformCounts[pt as keyof typeof platformCounts]++
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          🏘️ 假装社区
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          AI 资讯 & 教程 · 个人内容聚合器
        </p>
      </header>

      {/* ─── 场景导航区 ─── */}
      {scenarios.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            📍 按场景浏览
          </h3>
          <div className="overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
            <div className="flex gap-3">
              {scenarios.map((s) => (
                <ScenarioCard
                  key={s.id}
                  icon={s.icon}
                  name={s.name}
                  slug={s.slug}
                  contentCount={s._count.contents}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 筛选栏：日期 + 平台 ─── */}
      <section className="space-y-3 mb-8">
        <DateFilter
          currentPeriod={period}
          basePath="/"
          searchParams={searchParamObj}
        />
        <PlatformFilter
          currentPlatform={platform}
          basePath="/"
          searchParams={searchParamObj}
          counts={platformCounts}
        />
      </section>

      {/* ─── 板块 + 内容卡片 ─── */}
      {!hasAnyContent && (
        <div className="mb-12 rounded-xl border-2 border-dashed border-gray-200 py-20 text-center">
          <p className="text-5xl">🚀</p>
          <p className="mt-4 text-base font-medium text-gray-500">还没有任何内容</p>
          <p className="mt-2 text-sm text-gray-400">
            前往
            <Link
              href="/admin"
              className="mx-1 text-primary-600 underline underline-offset-2 hover:text-primary-700"
            >
              管理后台
            </Link>
            添加种子博主，内容会自动采集到这里
          </p>
        </div>
      )}

      {boards.map((board) => (
        <section key={board.id} className="mb-12">
          <div className="mb-4 flex items-baseline justify-between border-b border-gray-200 pb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              <Link
                href={`/boards/${board.slug}`}
                className="hover:text-primary-600 transition-colors"
              >
                {board.name}
              </Link>
            </h2>
            <Link
              href={`/boards/${board.slug}`}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {board._count.contents} 条内容 →
            </Link>
          </div>

          {board.contents.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
              <p className="text-4xl">📭</p>
              <p className="mt-3 text-sm text-gray-400">
                {board.name} 板块还没有内容
              </p>
              <p className="mt-1 text-xs text-gray-300">
                采集到的内容会自动出现在这里
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {board.contents.map((content) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          )}
        </section>
      ))}
    </main>
  )
}
