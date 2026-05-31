/**
 * 评测引擎 — Crawler 适配副本
 *
 * 与 lib/evaluator.ts 保持同步，供爬虫独立运行时使用。
 */

import { type TopicKeywords, computeKeywordRelevance } from "./topics-adapter"

export interface EvalInput {
  title: string
  summary: string
  tags: string[]
  platform: string
  publishedAt: Date
  sourceIsSeed: boolean
  sourceFollowerCount: number
  likeCount: number
  commentCount: number
  starCount?: number
  viewCount?: number
  hasThumbnail: boolean
  hasSourceUrl: boolean
  metadataComplete: boolean
}

export interface EvalResult {
  relevance: number
  quality: number
  freshness: number
  engagement: number
  completeness: number
  finalScore: number
  decision: "AUTO_PUBLISH" | "MANUAL_REVIEW" | "AUTO_REJECT"
  reason: string
}

const WEIGHTS = { relevance: 0.3, quality: 0.25, freshness: 0.2, engagement: 0.15, completeness: 0.1 }
const THRESHOLDS = { autoPublish: 3.5, manualReview: 2.5 }

export function evaluate(input: EvalInput, topic: TopicKeywords): EvalResult {
  const text = `${input.title} ${input.summary} ${input.tags.join(" ")}`

  const relevance = computeKeywordRelevance(text, topic)

  let quality = 2.0
  if (input.sourceIsSeed) quality += 1.5
  if (input.summary.length > 100) quality += 0.5
  if (input.summary.length > 300) quality += 0.5
  quality = Math.min(5, quality)

  const hoursAgo = (Date.now() - input.publishedAt.getTime()) / (1000 * 60 * 60)
  let freshness: number
  if (hoursAgo <= 6) freshness = 5
  else if (hoursAgo <= 24) freshness = 4
  else if (hoursAgo <= 72) freshness = 3
  else if (hoursAgo <= 168) freshness = 2
  else freshness = 1

  let engagement = 0
  const totalEngagement = input.likeCount + input.commentCount * 2 + (input.starCount ?? 0) * 3
  const views = input.viewCount ?? 0
  const isCode = input.platform === "GITHUB"
  if (isCode) {
    if (totalEngagement >= 1000) engagement = 5
    else if (totalEngagement >= 500) engagement = 4
    else if (totalEngagement >= 100) engagement = 3
    else if (totalEngagement >= 10) engagement = 2
    else engagement = 1
  } else {
    const signal = totalEngagement * 0.7 + Math.log10(views + 1) * 0.3
    if (signal >= 10000) engagement = 5
    else if (signal >= 1000) engagement = 4
    else if (signal >= 100) engagement = 3
    else if (signal >= 10) engagement = 2
    else engagement = 1
  }

  let completeness = 1
  if (input.summary.length > 0) completeness += 1
  if (input.hasThumbnail) completeness += 1
  if (input.hasSourceUrl) completeness += 1
  if (input.metadataComplete) completeness += 1

  const finalScore =
    relevance * WEIGHTS.relevance +
    quality * WEIGHTS.quality +
    freshness * WEIGHTS.freshness +
    engagement * WEIGHTS.engagement +
    completeness * WEIGHTS.completeness

  let decision: EvalResult["decision"]
  let reason: string
  if (relevance === 0) {
    decision = "AUTO_REJECT"
    reason = `相关性为 0`
  } else if (finalScore >= THRESHOLDS.autoPublish) {
    decision = "AUTO_PUBLISH"
    reason = `评分 ${finalScore.toFixed(1)} ≥ ${THRESHOLDS.autoPublish}`
  } else if (finalScore >= THRESHOLDS.manualReview) {
    decision = "MANUAL_REVIEW"
    reason = `评分 ${finalScore.toFixed(1)}，进入审核`
  } else {
    decision = "AUTO_REJECT"
    reason = `评分 ${finalScore.toFixed(1)} < ${THRESHOLDS.manualReview}`
  }

  return {
    relevance: Math.round(relevance * 100) / 100,
    quality: Math.round(quality * 100) / 100,
    freshness: Math.round(freshness * 100) / 100,
    engagement: Math.round(engagement * 100) / 100,
    completeness: Math.round(completeness * 100) / 100,
    finalScore: Math.round(finalScore * 10) / 10,
    decision,
    reason,
  }
}
