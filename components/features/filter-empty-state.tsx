/**
 * 筛选无结果空状态 — 当筛选条件（日期/场景）导致零结果时展示
 */

import Link from "next/link"

interface FilterEmptyStateProps {
  /** 清除筛选后的目标链接 */
  clearHref: string
  /** 可选自定义文案 */
  message?: string
}

export function FilterEmptyState({
  clearHref,
  message = "该时间范围内暂无内容",
}: FilterEmptyStateProps) {
  return (
    <div className="rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
      <p className="text-4xl">📭</p>
      <p className="mt-3 text-sm text-gray-400">{message}</p>
      <p className="mt-1 text-xs text-gray-300">尝试扩大时间范围或清除筛选条件</p>
      <Link
        href={clearHref}
        className="mt-3 inline-flex items-center rounded-lg border border-gray-200 px-4 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-50"
      >
        清除筛选
      </Link>
    </div>
  )
}
