import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并 Tailwind CSS 类名，自动处理冲突
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化日期为相对时间或绝对时间
 */
export function formatTime(date: Date | string): string {
  const now = new Date()
  const target = typeof date === "string" ? new Date(date) : date
  const diff = now.getTime() - target.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return "刚刚"
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return target.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * 截断文本并添加省略号
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + "..."
}

/**
 * 生成随机 ID (用于临时 key)
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}
