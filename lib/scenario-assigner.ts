/**
 * 假装社区 — 场景自动推荐
 *
 * 基于关键词匹配为内容推荐应用场景。
 * P1: 后续可替换为 LLM 调用来做语义级别的场景推荐。
 *
 * 使用方式:
 *   const recommendations = recommendScenarios(title + summary, scenarios)
 *   // [{ scenarioId, scenarioSlug, scenarioName, confidence }, ...]
 */

export interface ScenarioRecommendation {
  scenarioId: string
  scenarioSlug: string
  scenarioName: string
  confidence: number // 0-100
}

interface ScenarioInput {
  id: string
  slug: string
  name: string
  description: string | null
}

/**
 * 对文本进行分词和降噪
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z一-鿿0-9\s]/g, " ") // 保留中英文和数字
    .split(/\s+/)
    .filter((t) => t.length > 1)
}

/**
 * 基于关键词匹配的场景推荐。
 *
 * 评分策略:
 * - 场景名称完全匹配: +40
 * - slug 关键词命中: +25/keyword
 * - 描述关键词命中: +10/keyword
 * - 上限 95 (非 LLM 方案永远不给 100)
 * - 置信度 >= 30 才返回
 * - 最多返回 3 个
 */
export function recommendScenarios(
  text: string,
  scenarios: ScenarioInput[],
): ScenarioRecommendation[] {
  const lower = text.toLowerCase()
  const tokens = new Set(tokenize(text))

  const scores: ScenarioRecommendation[] = []

  for (const sc of scenarios) {
    let score = 0

    // 场景名称匹配 (精确)
    if (lower.includes(sc.name.toLowerCase())) {
      score += 40
    }

    // Slug 关键词匹配
    const slugParts = sc.slug.replace("ai-", "").split("-")
    for (const part of slugParts) {
      if (part.length > 2 && tokens.has(part)) {
        score += 25
      }
      if (part.length > 1 && lower.includes(part)) {
        score += 15
      }
    }

    // 描述关键词匹配
    if (sc.description) {
      const descTokens = tokenize(sc.description)
      for (const dt of descTokens) {
        if (dt.length > 2 && tokens.has(dt)) {
          score += 10
        }
      }
    }

    // Cap at 95
    const confidence = Math.min(95, score)
    if (confidence >= 30) {
      scores.push({
        scenarioId: sc.id,
        scenarioSlug: sc.slug,
        scenarioName: sc.name,
        confidence,
      })
    }
  }

  // 按置信度降序，取前 3 个
  return scores.sort((a, b) => b.confidence - a.confidence).slice(0, 3)
}

/**
 * 高置信度阈值：>= 60 自动关联，< 60 标记待确认
 */
export const AUTO_ASSIGN_THRESHOLD = 60
