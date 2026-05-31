/**
 * 假装社区 — 日期筛选常量与辅助函数
 *
 * 所有页面的日期筛选 chip 都使用此处的常量。
 * buildUrl 确保筛选参数正确组合，不丢失已有参数。
 */

export const PERIODS = [
  { value: "all", label: "全部" },
  { value: "today", label: "今天" },
  { value: "7d", label: "最近7天" },
  { value: "30d", label: "最近30天" },
  { value: "90d", label: "最近3个月" },
] as const

export type Period = (typeof PERIODS)[number]["value"]

/**
 * 将 period 值转换为 Prisma where 子句的日期范围。
 */
export function periodToDateRange(
  period: string,
  from?: string,
  to?: string,
): { gte?: Date; lte?: Date } {
  const now = new Date()
  switch (period) {
    case "today": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      return { gte: start }
    }
    case "7d":
      return { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
    case "30d":
      return { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
    case "90d":
      return { gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) }
    case "custom":
      return {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      }
    default: // "all"
      return {}
  }
}

/**
 * 构建带 searchParams 的 URL。
 *
 * 规则:
 * - undefined / "" / "all" 的值不写入 URL（保持 URL 简洁）
 * - page=1 不写入（默认值）
 * - 非 page 参数变化时 page 重置为 1
 *
 * @param base    基础路径，如 "/"、"/boards/ai-news"、"/scenarios/ai-coding"
 * @param params  searchParams 键值对
 * @param resetPage  当非 page 参数变化时，是否将 page 重置为 1（默认 true）
 */
export function buildUrl(
  base: string,
  params: Record<string, string | undefined>,
  resetPage = true,
): string {
  const usp = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || value === "all") continue
    // page=1 是默认值，不写
    if (key === "page" && value === "1") continue
    usp.set(key, value)
  }

  const qs = usp.toString()
  return qs ? `${base}?${qs}` : base
}
