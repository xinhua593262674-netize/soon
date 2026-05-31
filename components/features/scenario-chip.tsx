/**
 * 场景筛选 Chip — 板块页/场景页的筛选器
 *
 * 圆形 chip，选中态为深色实心。
 * 计数为 0 时置灰不可点击。
 */

import Link from "next/link"
import { cn } from "@/lib/utils"
import { buildUrl } from "@/lib/periods"

interface ScenarioChipProps {
  icon: string
  name: string
  slug: string
  count: number
  isSelected: boolean
  basePath: string
  searchParams: Record<string, string | undefined>
}

export function ScenarioChip({
  icon,
  name,
  slug,
  count,
  isSelected,
  basePath,
  searchParams,
}: ScenarioChipProps) {
  const isEmpty = count === 0

  const href = isSelected
    ? // 取消选中 → 移除 scenario 参数
      buildUrl(basePath, { ...searchParams, scenario: undefined, page: "1" })
    : // 选中 → 添加 scenario 参数
      buildUrl(basePath, { ...searchParams, scenario: slug, page: "1" })

  if (isEmpty) {
    return (
      <span
        className={cn(
          "flex-shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs whitespace-nowrap",
          "border-gray-100 text-gray-300 cursor-not-allowed",
        )}
        aria-disabled="true"
      >
        {icon} {name}
        <span className="text-[10px] opacity-60">{count}</span>
      </span>
    )
  }

  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "flex-shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap",
        isSelected
          ? "bg-gray-900 text-white border-gray-900"
          : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50",
      )}
    >
      {icon} {name}
      <span className="text-[10px] opacity-60">{count}</span>
    </Link>
  )
}
