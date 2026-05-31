/**
 * 假装社区 — 内容评测引擎
 *
 * 对采集回来的每条内容进行五维评分，输出自动发布/待审核/丢弃决策。
 *
 * 评测维度与权重（来自 grill-me 共识）:
 *   相关性   (relevance)    30% — 关键词 NLP 匹配度
 *   质量分   (quality)      25% — AI 评价摘要质量 + 是否种子博主
 *   时效性   (freshness)    20% — 发布时间距今多久
 *   互动量   (engagement)   15% — 点赞/评论/收藏/Star 数
 *   完整度   (completeness) 10% — 标题+正文+来源+标签齐全度
 *
 * 自动决策阈值:
 *   ≥ 3.5 → AUTO_PUBLISH
 *   2.5-3.5 → MANUAL_REVIEW
 *   < 2.5 → AUTO_REJECT
 */

import { Platform } from "@prisma/client"
import { type TopicKeywords, computeKeywordRelevance } from "./topics"

// ============================================================
// 评测输入
// ============================================================
export interface EvalInput {
  title: string
  summary: string
  tags: string[]
  platform: Platform
  publishedAt: Date
  sourceIsSeed: boolean
  sourceFollowerCount: number
  // 互动数据
  likeCount: number
  commentCount: number
  starCount?: number // GitHub
  viewCount?: number // B站/YouTube
  // 采集完整性
  hasThumbnail: boolean
  hasSourceUrl: boolean
  metadataComplete: boolean
}

// ============================================================
// 评测输出
// ============================================================
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

// ============================================================
// 权重配置
// ============================================================
const WEIGHTS = {
  relevance: 0.3,
  quality: 0.25,
  freshness: 0.2,
  engagement: 0.15,
  completeness: 0.1,
}

const THRESHOLDS = {
  autoPublish: 3.5,
  manualReview: 2.5,
  // < 2.5 → auto reject
}

// ============================================================
// 评测主函数
// ============================================================
export function evaluate(input: EvalInput, topic: TopicKeywords): EvalResult {
  const text = `${input.title} ${input.summary} ${input.tags.join(" ")}`

  // 1. 相关性: 关键词匹配 (0-5)
  const relevance = computeKeywordRelevance(text, topic)

  // 2. 质量分: 种子博主加成 + 摘要质量启发式
  let quality = 2.0 // 基线
  if (input.sourceIsSeed) quality += 1.5
  if (input.summary.length > 100) quality += 0.5
  if (input.summary.length > 300) quality += 0.5
  quality = Math.min(5, quality)

  // 3. 时效性: 发布时间距今
  const hoursAgo = (Date.now() - input.publishedAt.getTime()) / (1000 * 60 * 60)
  let freshness: number
  if (hoursAgo <= 6) freshness = 5
  else if (hoursAgo <= 24) freshness = 4
  else if (hoursAgo <= 72) freshness = 3
  else if (hoursAgo <= 168) freshness = 2
  else freshness = 1

  // 4. 互动量: 归一化到 0-5
  let engagement = 0
  const totalEngagement = input.likeCount + input.commentCount * 2 + (input.starCount ?? 0) * 3
  const views = input.viewCount ?? 0

  if (platformIsCode(input.platform)) {
    // GitHub: star 为主
    if (totalEngagement >= 1000) engagement = 5
    else if (totalEngagement >= 500) engagement = 4
    else if (totalEngagement >= 100) engagement = 3
    else if (totalEngagement >= 10) engagement = 2
    else engagement = 1
  } else {
    // 视频/文章平台: 互动 + 播放量
    const signal = totalEngagement * 0.7 + Math.log10(views + 1) * 0.3
    if (signal >= 10000) engagement = 5
    else if (signal >= 1000) engagement = 4
    else if (signal >= 100) engagement = 3
    else if (signal >= 10) engagement = 2
    else engagement = 1
  }

  // 5. 完整度
  let completeness = 1 // 至少有标题
  if (input.summary.length > 0) completeness += 1
  if (input.hasThumbnail) completeness += 1
  if (input.hasSourceUrl) completeness += 1
  if (input.metadataComplete) completeness += 1

  // 加权计算
  const finalScore =
    relevance * WEIGHTS.relevance +
    quality * WEIGHTS.quality +
    freshness * WEIGHTS.freshness +
    engagement * WEIGHTS.engagement +
    completeness * WEIGHTS.completeness

  // 决策
  let decision: EvalResult["decision"]
  let reason: string

  if (relevance === 0) {
    // 完全不相关 → 直接拒绝，不管其他分数
    decision = "AUTO_REJECT"
    reason = `相关性为 0，内容不匹配板块"${topic.boardName}"`
  } else if (finalScore >= THRESHOLDS.autoPublish) {
    decision = "AUTO_PUBLISH"
    reason = `综合评分 ${finalScore.toFixed(1)}，达到自动发布线 (≥${THRESHOLDS.autoPublish})`
  } else if (finalScore >= THRESHOLDS.manualReview) {
    decision = "MANUAL_REVIEW"
    reason = `综合评分 ${finalScore.toFixed(1)}，进入人工审核队列`
  } else {
    decision = "AUTO_REJECT"
    reason = `综合评分 ${finalScore.toFixed(1)}，低于审核线 (<${THRESHOLDS.manualReview})`
  }

  return {
    relevance: round(relevance),
    quality: round(quality),
    freshness: round(freshness),
    engagement: round(engagement),
    completeness: round(completeness),
    finalScore: round(finalScore * 10) / 10, // 保留1位小数
    decision,
    reason,
  }
}

// ============================================================
// 辅助函数
// ============================================================
function platformIsCode(p: Platform): boolean {
  return p === "GITHUB"
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}
