/**
 * 分页器 — 页码 + 省略号 + 上下页
 *
 * 作为 <a> 链接渲染，切换页码 = URL 导航 = SSR 刷新。
 * 总页数 ≤ 1 时不渲染。
 * 用于板块页、场景详情页。
 */

import Link from "next/link"
import { cn } from "@/lib/utils"
import { buildUrl } from "@/lib/periods"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  basePath: string
  searchParams: Record<string, string | undefined>
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  basePath,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = generatePageNumbers(currentPage, totalPages)

  const prevHref =
    currentPage > 1
      ? buildUrl(basePath, { ...searchParams, page: String(currentPage - 1) })
      : ""

  const nextHref =
    currentPage < totalPages
      ? buildUrl(basePath, { ...searchParams, page: String(currentPage + 1) })
      : ""

  return (
    <div className="flex flex-col items-center gap-2 pt-6 pb-4 border-t border-gray-100">
      <p className="text-xs text-gray-400">共 {totalCount} 条内容</p>

      <div className="flex items-center gap-1">
        {/* 上一页 */}
        {prevHref ? (
          <Link
            href={prevHref}
            scroll={false}
            className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            ← 上一页
          </Link>
        ) : (
          <span className="inline-flex items-center rounded-lg border border-gray-100 px-3 py-1.5 text-xs text-gray-300 cursor-not-allowed">
            ← 上一页
          </span>
        )}

        {/* 页码 */}
        {pages.map((p, i) =>
          p === null ? (
            <span
              key={`e-${i}`}
              className="inline-flex items-center justify-center w-8 h-8 text-xs text-gray-300"
            >
              ...
            </span>
          ) : (
            <Link
              key={p}
              href={buildUrl(basePath, { ...searchParams, page: p === 1 ? undefined : String(p) })}
              scroll={false}
              className={cn(
                "inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs transition-colors",
                p === currentPage
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-500 hover:bg-gray-100",
              )}
            >
              {p}
            </Link>
          ),
        )}

        {/* 下一页 */}
        {nextHref ? (
          <Link
            href={nextHref}
            scroll={false}
            className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            下一页 →
          </Link>
        ) : (
          <span className="inline-flex items-center rounded-lg border border-gray-100 px-3 py-1.5 text-xs text-gray-300 cursor-not-allowed">
            下一页 →
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * 生成页码数组，null 表示省略号。
 * 总页数 ≤ 7: 全部展示
 * 总页数 > 7: 折叠中间页码
 */
function generatePageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | null)[] = [1]

  if (current <= 4) {
    // 前 4 页: 1 2 3 4 5 ... N
    for (let i = 2; i <= Math.min(5, total - 1); i++) pages.push(i)
    if (total > 6) pages.push(null, total)
  } else if (current >= total - 3) {
    // 后 4 页: 1 ... N-4 N-3 N-2 N-1 N
    pages.push(null)
    for (let i = Math.max(total - 4, 2); i <= total; i++) pages.push(i)
  } else {
    // 中间: 1 ... C-1 C C+1 ... N
    pages.push(null)
    for (let i = current - 1; i <= current + 1; i++) pages.push(i)
    pages.push(null, total)
  }

  return pages
}
