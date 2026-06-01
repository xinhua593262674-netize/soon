/**
 * 平台筛选 Chip 组 — 按 B站/YouTube/GitHub 筛选
 *
 * 用于首页、板块页、场景详情页的筛选栏。
 */

import Link from "next/link"
import { cn } from "@/lib/utils"
import { buildUrl } from "@/lib/periods"

interface PlatformOption {
  value: string
  label: string
  icon: string
  count: number
}

const PLATFORMS: PlatformOption[] = [
  { value: "", label: "全部", icon: "", count: 0 },
  { value: "bilibili", label: "B站", icon: "📺", count: 0 },
  { value: "youtube", label: "YouTube", icon: "▶️", count: 0 },
  { value: "github", label: "GitHub", icon: "📦", count: 0 },
]

interface PlatformFilterProps {
  currentPlatform: string
  basePath: string
  searchParams: Record<string, string | undefined>
  /** 各平台内容计数 { bilibili: 0, youtube: 15, github: 42 } */
  counts?: Record<string, number>
}

export function PlatformFilter({
  currentPlatform,
  basePath,
  searchParams,
  counts,
}: PlatformFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      <span className="text-xs text-gray-400 font-medium flex-shrink-0">平台</span>

      {PLATFORMS.map((p) => {
        const isActive = currentPlatform === p.value
        const count = p.value ? counts?.[p.value] ?? 0 : undefined
        const href = buildUrl(basePath, {
          ...searchParams,
          platform: p.value || undefined,
          page: "1", // 切换筛选 → 回到第 1 页
        })

        return (
          <Link
            key={p.value}
            href={href}
            scroll={false}
            className={cn(
              "flex-shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap",
              isActive
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50",
            )}
          >
            {p.icon && <span>{p.icon}</span>}
            {p.label}
            {count !== undefined && (
              <span className="text-[10px] opacity-60">{count}</span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
