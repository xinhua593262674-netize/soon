/**
 * 板块详情页 — /boards/[slug]
 *
 * 展示某板块下的所有内容，支持：
 * - 日期筛选（DateFilter）
 * - 场景筛选（ScenarioChip 链接）
 * - 分页（Pagination）
 * - 日期 + 场景 + 分页组合筛选
 */

import { db } from "@/lib/db"
import { periodToDateRange, buildUrl } from "@/lib/periods"
import { DateFilter, PlatformFilter, Pagination, ScenarioChip, ContentCard, FilterEmptyState } from "@/components"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

const PER_PAGE = 20

interface BoardPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    period?: string
    platform?: string
    scenario?: string
    page?: string
  }>
}

export default async function BoardPage({ params, searchParams }: BoardPageProps) {
  const { slug } = await params
  const sp = await searchParams

  const page = Math.max(1, Number(sp.page) || 1)
  const period = sp.period || "all"
  const dateRange = periodToDateRange(period)

  // 获取板块
  const board = await db.board.findUnique({ where: { slug } })
  if (!board) notFound()

  const platform = sp.platform || ""

  // 内容查询条件
  const where = {
    boardId: board.id,
    status: "PUBLISHED" as const,
    publishedAt: dateRange,
    ...(platform ? { source: { platform: platform.toUpperCase() as any } } : {}),
    ...(sp.scenario
      ? { contentScenarios: { some: { scenario: { slug: sp.scenario } } } }
      : {}),
  }

  const basePath = `/boards/${slug}`
  const searchParamObj: Record<string, string | undefined> = {
    period: sp.period,
    platform: sp.platform,
    scenario: sp.scenario,
    page: String(page),
  }

  // 并发查内容 + 计数 + 场景列表（含本板块计数）
  const [contents, totalCount, scenarios] = await Promise.all([
    db.content.findMany({
      where,
      orderBy: { publishedAt: "desc" },
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
    db.scenario.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: {
            contents: {
              where: {
                content: {
                  boardId: board.id,
                  status: "PUBLISHED",
                  publishedAt: dateRange,
                },
              },
            },
          },
        },
      },
    }),
  ])

  const totalPages = Math.ceil(totalCount / PER_PAGE)

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* 返回链接 */}
      <Link
        href="/"
        className="inline-flex items-center text-xs text-gray-400 hover:text-gray-600 transition-colors mb-6"
      >
        ← 返回首页
      </Link>

      {/* 板块标题 */}
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">{board.name}</h1>
        {board.description && (
          <p className="text-sm text-gray-500 mt-1">{board.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">{totalCount} 条内容</p>
      </div>

      {/* 组合筛选栏 */}
      <div className="space-y-3 mb-6">
        {/* 日期筛选 */}
        <DateFilter
          currentPeriod={period}
          basePath={basePath}
          searchParams={searchParamObj}
        />

        {/* 平台筛选 */}
        <PlatformFilter
          currentPlatform={platform}
          basePath={basePath}
          searchParams={searchParamObj}
        />

        {/* 场景筛选 */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-gray-400 font-medium flex-shrink-0">场景</span>

          {/* 全部 */}
          <Link
            href={buildUrl(basePath, { ...searchParamObj, scenario: undefined, page: "1" })}
            scroll={false}
            className={`flex-shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap ${
              !sp.scenario
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            全部 {totalCount}
          </Link>

          {scenarios.map((s) => (
            <ScenarioChip
              key={s.id}
              icon={s.icon}
              name={s.name}
              slug={s.slug}
              count={s._count.contents}
              isSelected={sp.scenario === s.slug}
              basePath={basePath}
              searchParams={searchParamObj}
            />
          ))}
        </div>
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
          message={sp.scenario ? "该场景下暂无内容" : "该板块暂无内容"}
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
