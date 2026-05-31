/**
 * 假装社区 — 话题关键词体系
 *
 * 用于内容采集时的相关性评分和标签自动生成。
 * 每个板块有三级关键词：primary(核心) / secondary(扩展) / tertiary(边界)
 *
 * 匹配规则:
 *   primary   命中 → 相关性 +2.5 分
 *   secondary 命中 → 相关性 +1.5 分
 *   tertiary  命中 → 相关性 +0.5 分
 */

export interface TopicKeywords {
  boardName: string
  boardSlug: string
  boardDescription: string
  primary: string[]
  secondary: string[]
  tertiary: string[]
}

export const TOPICS: TopicKeywords[] = [
  {
    boardName: "AI 资讯",
    boardSlug: "ai-news",
    boardDescription: "AI 行业动态、公司新闻、产品发布、政策法规、社区热点",
    primary: [
      "OpenAI", "ChatGPT", "GPT-5", "GPT-4", "GPT-4o", "o3", "o4-mini",
      "Claude", "Claude Code", "Anthropic", "Opus", "Sonnet", "Haiku",
      "Google", "Gemini", "DeepMind", "Gemma",
      "Meta", "Llama", "Meta AI",
      "Microsoft", "Copilot", "Bing AI",
      "xAI", "Grok", "Elon Musk",
      "DeepSeek", "Qwen", "通义千问", "百川", "智谱", "GLM",
      "Mistral", "Stability AI", "Midjourney", "Sora", "Runway",
      "新模型发布", "模型更新", "版本更新", "价格变动",
    ],
    secondary: [
      "AI 政策", "AI 法规", "AI 安全", "AI 版权",
      "融资", "收购", "IPO", "估值",
      "benchmark", "评测", "排行榜",
      "论文", "Paper", "arXiv",
      "开源模型", "open source",
      "算力", "GPU", "NVIDIA", "芯片",
      "具身智能", "机器人", "自动驾驶",
      "AI agent", "agent", "multi-agent",
    ],
    tertiary: [
      "Hacker News", "Twitter", "X 平台",
      "GitHub trending",
      "裁员", "人事变动", "CEO",
      "伦理", "偏见", "幻觉",
      "AI 应用", "AI 落地", "AI native",
    ],
  },
  {
    boardName: "AI 教程",
    boardSlug: "ai-tutorials",
    boardDescription: "AI 工具使用教程、Prompt 技巧、开发实践、Skill/Plugin 分享",
    primary: [
      "Claude Code", "Claude", "Anthropic",
      "Cursor", "Windsurf", "Copilot",
      "VSCode", "JetBrains", "AI IDE",
      "OpenAI", "ChatGPT", "GPT",
      "Codex", "Claude Codex",
      "Skill", "MCP", "Plugin", "插件",
      "Prompt", "提示词", "Prompt Engineering",
    ],
    secondary: [
      "Agent", "Multi-Agent", "Workflow",
      "TDD", "测试驱动", "AI 测试",
      "RAG", "Retrieval Augmented", "向量数据库",
      "Fine-tuning", "微调", "LoRA",
      "Embedding", "嵌入",
      "Function Calling", "Tool Use",
      "全栈开发", "AI 编程", "AI coding",
      "Next.js", "React", "Python", "TypeScript",
    ],
    tertiary: [
      "自动化脚本", "爬虫", "scraper",
      "数据分析", "可视化",
      "部署", "CI/CD", "Docker",
      "Supabase", "Vercel", "Railway",
      "LangChain", "LlamaIndex", "CrewAI",
      "Hugging Face", "Transformers",
      "Jupyter", "Colab",
      "API", "SDK", "integration",
    ],
  },
]

/**
 * 计算内容与板块的关键词匹配分数
 * @param text 待评测的文本（标题+摘要+标签）
 * @param topic 板块关键词配置
 * @returns 匹配分数 (0-5)
 */
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

  // 上限 5 分
  return Math.min(5, score)
}

/**
 * 从文本中提取命中的标签
 */
export function extractTags(text: string, topic: TopicKeywords): string[] {
  const lower = text.toLowerCase()
  const allKeywords = [...topic.primary, ...topic.secondary, ...topic.tertiary]
  return allKeywords.filter((kw) => lower.includes(kw.toLowerCase()))
}
