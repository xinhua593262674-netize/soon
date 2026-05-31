export const meta = {
  name: 'code-review',
  description: '对假装社区的代码变更进行多维度审查',
  phases: [
    { title: '分析变更', detail: '扫描改动文件，分析变更范围' },
    { title: '多维度审查', detail: '安全性、性能、可维护性三路并行审查' },
    { title: '综合报告', detail: '汇总审查结果，生成改进建议' },
  ],
}

// 代码审查维度定义
const DIMENSIONS = [
  {
    key: 'security',
    prompt: `你是一个安全审查专家。请审查以下代码变更的安全性：
      - 是否存在 XSS、CSRF、SQL 注入风险？
      - 敏感数据是否妥善处理？
      - 认证和授权逻辑是否安全？
      - 依赖项是否有已知漏洞？
      请以结构化方式列出发现的问题和严重程度。`,
  },
  {
    key: 'performance',
    prompt: `你是一个性能优化专家。请审查以下代码变更的性能：
      - 是否存在不必要的重渲染？
      - 数据库查询是否有 N+1 问题？
      - API 调用是否可以批处理或缓存？
      - 是否有内存泄漏风险？
      请以结构化方式列出发现的问题和改进建议。`,
  },
  {
    key: 'maintainability',
    prompt: `你是一个代码质量专家。请审查以下代码变更的可维护性：
      - 代码是否遵循项目约定？
      - 是否有足够的错误处理？
      - 类型定义是否完整？
      - 是否有可复用/简化的机会？
      请以结构化方式列出发现的问题和改进建议。`,
  },
]

phase('分析变更')

log(`🔍 开始对假装社区代码进行全面审查...`)

const results = await pipeline(
  DIMENSIONS,
  (d) =>
    agent(d.prompt, {
      label: `review:${d.key}`,
      phase: '多维度审查',
      schema: {
        type: 'object',
        properties: {
          issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                severity: { type: 'string', enum: ['critical', 'major', 'minor', 'suggestion'] },
                file: { type: 'string' },
                line: { type: 'number' },
                title: { type: 'string' },
                description: { type: 'string' },
                recommendation: { type: 'string' },
              },
              required: ['severity', 'title', 'description', 'recommendation'],
            },
          },
          summary: { type: 'string' },
        },
        required: ['issues', 'summary'],
      },
    }),
  (review) => {
    // 对 medium 严重度以上的问题进行交叉验证
    const toVerify = review.issues.filter(
      (i) => i.severity === 'critical' || i.severity === 'major'
    )
    if (toVerify.length === 0) return { ...review, verified: [] }

    return parallel(
      toVerify.map(
        (issue) => () =>
          agent(
            `请验证以下审查发现是否属实。如果不属实，请说明原因：\n${JSON.stringify(issue, null, 2)}`,
            {
              label: `verify:${issue.title.slice(0, 30)}`,
              phase: '多维度审查',
              schema: {
                type: 'object',
                properties: {
                  isReal: { type: 'boolean' },
                  comment: { type: 'string' },
                },
                required: ['isReal', 'comment'],
              },
            }
          ).then((v) => ({ ...issue, verified: v }))
      )
    ).then((verified) => ({ ...review, verified: verified.filter(Boolean) }))
  }
)

phase('综合报告')

log('📊 审查结果汇总：')

for (const r of results) {
  const criticalCount = r.issues.filter((i) => i.severity === 'critical').length
  const majorCount = r.issues.filter((i) => i.severity === 'major').length
  const minorCount = r.issues.filter((i) => i.severity === 'minor').length

  log(
    `  ${r.issues.length} 个问题 (🔴${criticalCount} 🟠${majorCount} 🟡${minorCount}) - ${r.summary}`
  )
}

const allIssues = results.flatMap((r) => r.issues)
const criticalIssues = allIssues.filter((i) => i.severity === 'critical')
const majorIssues = allIssues.filter((i) => i.severity === 'major')

log(`\n🚨 ${criticalIssues.length} 个严重问题需要立即修复`)
log(`⚠️  ${majorIssues.length} 个重要问题建议修复`)
log(`📝 审查完成 - 请根据优先级处理上述问题`)

return {
  totalIssues: allIssues.length,
  criticalCount: criticalIssues.length,
  majorCount: majorIssues.length,
  issues: allIssues,
}
