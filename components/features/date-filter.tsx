/**
 * 日期筛选 Chip 组 — 可复用的日期快捷筛选组件
 *
 * 作为 <a> 链接渲染，切换筛选 = URL 导航 = SSR 刷新。
 * 用于首页、板块页、场景详情页。
 */

import Link from "next/link"
import { cn } from "@/lib/utils"
import { PERIODS, buildUrl } from "@/lib/periods"

interface DateFilterProps {
  currentPeriod: string
  basePath: string
  searchParams: Record<string, string | undefined>
}

export function DateFilter({ currentPeriod, basePath, searchParams }: DateFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      <span className="text-xs text-gray-400 font-medium flex-shrink-0">时间</span>

      {PERIODS.map((p) => {
        const isActive = currentPeriod === p.value
        const href = buildUrl(basePath, {
          ...searchParams,
          period: p.value,
          page: "1", // 切换时间 → 回到第 1 页
        })

        return (
          <Link
            key={p.value}
            href={href}
            scroll={false}
            className={cn(
              "flex-shrink-0 rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap",
              isActive
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50",
            )}
          >
            {p.label}
          </Link>
        )
      })}
    </div>
  )
}
