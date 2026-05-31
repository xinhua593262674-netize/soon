/**
 * 场景标签 — 内容卡片上的场景标识
 *
 * 蓝色圆角矩形 + emoji，视觉上区别于灰色圆形的普通标签。
 * 点击跳转到 /scenarios/[slug]。
 */

import Link from "next/link"

interface ScenarioTagProps {
  icon: string
  name: string
  slug: string
}

export function ScenarioTag({ icon, name, slug }: ScenarioTagProps) {
  return (
    <Link
      href={`/scenarios/${slug}`}
      className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700 transition-colors hover:bg-primary-100"
    >
      {icon} {name}
    </Link>
  )
}
