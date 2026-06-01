/**
 * 场景详情页 — /scenarios/[slug]
 *
 * 展示某应用场景下的所有内容，支持：
 * - 板块子筛选（chip 链接）
 * - 日期筛选（DateFilter）
 * - 排序切换（最新/最热 — 链接切换）
 * - 分页（Pagination）
 */

import { db } from "@/lib/db"
import { periodToDateRange, buildUrl } from "@/lib/periods"
import { DateFilter, PlatformFilter, Pagination, ContentCard, FilterEmptyState } from "@/components"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

const PER_PAGE = 20

interface ScenarioPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    period?: string
    platform?: string
    page?: string
    board?: string
    sort?: string
  }>
}

export default async function ScenarioPage({
  params,
  searchParams,
}: ScenarioPageProps) {
  const { slug } = await params
  const sp = await searchParams

  const page = Math.max(1, Number(sp.page) || 1)
  const period = sp.period || "all"
  const sort = sp.sort === "hot" ? "hot" : "latest"
  const dateRange = periodToDateRange(period)

  // 获取场景
  const scenario = await db.scenario.findUnique({
    where: { slug, isActive: true },
  })
  if (!scenario) notFound()

  const platform = sp.platform || ""

  // 板块子筛选条件
  const boardFilter = sp.board ? { board: { name: sp.board } } : {}

  // 内容查询条件
  const where = {
    status: "PUBLISHED" as const,
    contentScenarios: { some: { scenarioId: scenario.id } },
    publishedAt: dateRange,
    ...(platform ? { source: { platform: platform.toUpperCase() as any } } : {}),
    ...boardFilter,
  }

  // 并发查内容 + 计数 + 板块列表
  const orderBy =
    sort === "hot"
      ? ({ comments: { _count: "desc" as const } } as const)
      : ({ publishedAt: "desc" as const } as const)

  const [contents, totalCount, boards] = await Promise.all([
    db.content.findMany({
      where,
      orderBy,
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        source: true,
        tags: { include: { tag: true } },
        contentScenarios: { include: { scenario: true } },
        _count: { select: { comments: true } },
      },
    }),
    db.content.count({ where }),
    db.board.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: {
            contents: {
              where: {
                status: "PUBLISHED",
                contentScenarios: { some: { scenarioId: scenario.id } },
                publishedAt: dateRange,
              },
            },
          },
        },
      },
    }),
  ])

  const totalPages = Math.ceil(totalCount / PER_PAGE)
  const basePath = `/scenarios/${slug}`
  const searchParamObj: Record<string, string | undefined> = {
    period: sp.period,
    platform: sp.platform,
    page: String(page),
    board: sp.board,
    sort: sp.sort,
  }

  // 最近更新时间
  const latestContent = contents[0]
  const latestUpdate = latestContent
    ? formatTimeAgoShort(latestContent.publishedAt)
    : null

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* 返回链接 */}
      <Link
        href="/"
        className="inline-flex items-center text-xs text-gray-400 hover:text-gray-600 transition-colors mb-6"
      >
        ← 返回首页
      </Link>

      {/* 场景标题区 */}
      <div className="text-center py-8 border-b border-gray-100 mb-6">
        <span className="text-5xl mb-3 block">{scenario.icon}</span>
        <h1 className="text-2xl font-bold text-gray-900">{scenario.name}</h1>
        {scenario.description && (
          <p className="text-sm text-gray-500 mt-1.5">{scenario.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          {totalCount} 条内容
          {latestUpdate && ` · 最近更新：${latestUpdate}`}
        </p>
      </div>

      {/* 板块子筛选 + 排序 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 flex-shrink-0">板块</span>
          {/* 全部 */}
          <Link
            href={buildUrl(basePath, { ...searchParamObj, board: undefined, page: "1" })}
            scroll={false}
            className={cn(
              "rounded-full px-3 py-1 text-xs border transition-colors whitespace-nowrap",
              !sp.board
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-500 hover:border-gray-300",
            )}
          >
            全部
          </Link>
          {boards.map((b) => (
            <Link
              key={b.id}
              href={buildUrl(basePath, { ...searchParamObj, board: b.name, page: "1" })}
              scroll={false}
              className={cn(
                "rounded-full px-3 py-1 text-xs border transition-colors whitespace-nowrap",
                sp.board === b.name
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 text-gray-500 hover:border-gray-300",
              )}
            >
              {b.name}
            </Link>
          ))}
        </div>

        {/* 排序切换 */}
        <div className="flex items-center gap-2 text-xs ml-auto flex-shrink-0">
          <span className="text-gray-400">排序:</span>
          <Link
            href={buildUrl(basePath, { ...searchParamObj, sort: undefined, page: "1" })}
            scroll={false}
            className={cn(
              "transition-colors",
              sort === "latest"
                ? "text-gray-900 font-medium underline underline-offset-4"
                : "text-gray-400 hover:text-gray-600",
            )}
          >
            最新 ↑
          </Link>
          <Link
            href={buildUrl(basePath, { ...searchParamObj, sort: "hot", page: "1" })}
            scroll={false}
            className={cn(
              "transition-colors",
              sort === "hot"
                ? "text-gray-900 font-medium underline underline-offset-4"
                : "text-gray-400 hover:text-gray-600",
            )}
          >
            最热
          </Link>
        </div>
      </div>

      {/* 日期 + 平台筛选 */}
      <div className="space-y-3 mb-6">
        <DateFilter
          currentPeriod={period}
          basePath={basePath}
          searchParams={searchParamObj}
        />
        <PlatformFilter
          currentPlatform={platform}
          basePath={basePath}
          searchParams={searchParamObj}
        />
      </div>

      {/* 内容列表 */}
      {contents.length > 0 ? (
        <div className="space-y-4">
          {contents.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      ) : (
        <FilterEmptyState
          clearHref={buildUrl(basePath, {})}
          message="该场景下暂无内容"
        />
      )}

      {/* 分页器 */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        basePath={basePath}
        searchParams={searchParamObj}
      />
    </main>
  )
}

// ============================================================
// 辅助函数
// ============================================================
function formatTimeAgoShort(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时前`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} 天前`
  return date.toLocaleDateString("zh-CN")
}
