/**
 * 场景导航卡片 — 首页「按场景浏览」区域的入口卡片
 *
 * emoji + 名称 + 内容计数，点击跳转到 /scenarios/[slug]。
 */

import Link from "next/link"
import { cn } from "@/lib/utils"

interface ScenarioCardProps {
  icon: string
  name: string
  slug: string
  contentCount: number
  isActive?: boolean
}

export function ScenarioCard({
  icon,
  name,
  slug,
  contentCount,
  isActive,
}: ScenarioCardProps) {
  return (
    <Link
      href={`/scenarios/${slug}`}
      className={cn(
        "flex-shrink-0 w-[100px] rounded-xl border bg-white p-3 text-center transition hover:border-primary-300 hover:shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-primary-200",
        isActive
          ? "border-primary-500 bg-primary-50 ring-1 ring-primary-200"
          : "border-gray-200",
      )}
    >
      <span className="text-3xl mb-1.5 block">{icon}</span>
      <span className="text-sm font-medium text-gray-700 leading-tight">{name}</span>
      <span className="text-[11px] text-gray-400 mt-0.5 block">
        {contentCount} 条内容
      </span>
    </Link>
  )
}
