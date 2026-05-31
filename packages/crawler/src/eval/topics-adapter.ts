/**
 * 话题关键词体系 — Crawler 适配副本
 *
 * 与 lib/topics.ts 保持同步，供爬虫独立运行时使用。
 */

export interface TopicKeywords {
  boardName: string
  boardSlug: string
  boardDescription: string
  primary: string[]
  secondary: string[]
  tertiary: string[]
}

export function computeKeywordRelevance(text: string, topic: TopicKeywords): number {
  const lower = text.toLowerCase()
  let score = 0
  for (const kw of topic.primary) {
    if (lower.includes(kw.toLowerCase())) score += 2.5
  }
  for (const kw of topic.secondary) {
    if (lower.includes(kw.toLowerCase())) score += 1.5
  }
  for (const kw of topic.tertiary) {
    if (lower.includes(kw.toLowerCase())) score += 0.5
  }
  return Math.min(5, score)
}
