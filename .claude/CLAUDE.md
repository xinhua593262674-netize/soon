# 假装社区 — 项目说明书 (Policy Layer)

> 一个基于 Next.js 15 的全栈 Web 社区应用。本文档是 AI 编码助手 (Claude Code) 的项目认知基础。
>
> **OMC 执行框架 V2.5** — 本文档是 Policy 层（人可读）。运行时强制执行由 Hook 脚本保证。
> - 调度层: [.claude/orchestrator.md](.claude/orchestrator.md) — Single/Serial/Wave 调度规则
> - 执行层: [.claude/adhd-agent.md](.claude/adhd-agent.md) — Agent 五条铁律
> - 任务包: [.claude/packet.schema.json](.claude/packet.schema.json) — Packet 结构化 Schema
> - 事件流: [.claude/events/events.jsonl](.claude/events/events.jsonl) — 执行事件记录
> - 任务图: [.claude/events/task-graph.json](.claude/events/task-graph.json) — 当前状态投影

## 项目概览

| 属性 | 值 |
|------|---|
| 项目名称 | 假装社区 (JiaZhuang Community) |
| 项目类型 | 全栈 Web 应用 |
| 包管理器 | pnpm (优先) / npm |
| Node 版本 | >= 20.x |
| 数据库 | PostgreSQL (开发环境可选 SQLite) |

## 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 框架 | Next.js 15 (App Router) | 全栈 Web 框架 |
| 语言 | TypeScript 5.x (strict) | 类型安全 |
| 样式 | Tailwind CSS 4.x | 原子化样式 |
| ORM | Prisma | 数据库访问 |
| 认证 | NextAuth.js v5 (Auth.js) | 用户认证 |
| 校验 | Zod | Schema 校验 |
| 测试 | Vitest + Playwright | 单元/E2E 测试 |
| 包管理 | pnpm | 依赖管理 |

## 目录结构

```
假装社区/
├── .claude/                      # AI Coding 执行框架
│   ├── settings.json             # 项目级 Claude Code 配置
│   ├── CLAUDE.md                 # 项目说明书 (本文件)
│   ├── hooks/                    # 生命周期钩子脚本
│   │   ├── pre-bash.sh           # Bash 命令执行前检查
│   │   ├── pre-edit.sh           # 文件编辑前检查
│   │   ├── post-edit.sh          # 文件编辑后自动格式化
│   │   └── on-stop.sh            # 会话结束清理
│   └── workflows/                # 自定义工作流
│       └── code-review.js        # 多维度代码审查流程
│
├── app/                          # Next.js App Router 页面
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页
│   ├── globals.css               # 全局样式
│   └── api/                      # API 路由 (REST/GraphQL)
│       └── .gitkeep
│
├── components/                   # React 组件
│   ├── ui/                       # 基础 UI 组件 (Button, Card, Modal...)
│   │   └── .gitkeep
│   ├── layout/                   # 布局组件 (Header, Footer, Sidebar...)
│   │   └── .gitkeep
│   └── features/                 # 业务功能组件
│       └── .gitkeep
│
├── lib/                          # 工具库 & 服务层
│   ├── db.ts                     # Prisma 客户端单例
│   ├── auth.ts                   # NextAuth 配置
│   ├── utils.ts                  # 通用工具函数
│   └── validations.ts            # Zod Schema 定义
│
├── prisma/                       # 数据库
│   └── schema.prisma             # 数据模型定义
│
├── public/                       # 静态资源
│   └── .gitkeep
│
├── types/                        # TypeScript 类型定义
│   └── index.ts
│
├── tests/                        # 测试文件
│   └── .gitkeep
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── .eslintrc.json
├── .prettierrc
├── .env.local.example
└── .gitignore
```

## 编码约定

### 文件命名

- **组件文件**: `PascalCase.tsx`（如 `UserProfile.tsx`、`PostCard.tsx`）
- **工具函数**: `camelCase.ts`（如 `formatDate.ts`、`parseMarkdown.ts`）
- **API 路由**: App Router 约定 `route.ts`
- **类型定义**: `types.ts` 或 `index.ts`

### 代码风格

- 使用 `const`，禁止 `var`
- 优先使用箭头函数（组件除外，组件用 `function` 声明）
- 每个文件最多一个 export default
- 使用路径别名：`@/` 映射到项目根目录
- 组件 Props 使用 interface 定义，命名为 `{ComponentName}Props`

### TypeScript

- 开启 strict 模式
- 避免 `any`，优先使用 `unknown`
- 所有公开函数必须有返回类型注解
- Prisma 类型从 `@prisma/client` 导入，不手写

### React 组件

```tsx
// ✅ 好的模式
interface PostCardProps {
  post: Post
  onLike?: (id: string) => void
}

export function PostCard({ post, onLike }: PostCardProps) {
  return (
    <article className="rounded-lg border p-4">
      <h2 className="text-xl font-bold">{post.title}</h2>
    </article>
  )
}
```

### 服务端/客户端边界

- `app/` 下的组件默认是 Server Component
- 需要交互的组件添加 `"use client"` 指令
- 将数据获取逻辑放在 Server Component 中
- 将交互逻辑隔离在 Client Component 中

## 常用命令

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm build            # 生产构建
pnpm start            # 启动生产服务

# 数据库
pnpm prisma:generate  # 生成 Prisma Client
pnpm prisma:migrate   # 执行数据库迁移
pnpm prisma:studio    # 打开 Prisma Studio

# 代码质量
pnpm lint             # ESLint 检查
pnpm format           # Prettier 格式化
pnpm typecheck        # TypeScript 类型检查

# 测试
pnpm test             # 运行单元测试
pnpm test:e2e         # 运行 E2E 测试
```

## 架构决策

1. **数据获取在服务端**：优先使用 Server Components 直接查询数据库，减少 API 层的胶水代码
2. **乐观更新**：修改操作使用 `useOptimistic` 或 React Server Actions 实现乐观更新
3. **认证**：使用 NextAuth.js middleware 保护路由，Session 在服务端获取
4. **错误处理**：使用 Error Boundary (`error.tsx`) 和 Not Found (`not-found.tsx`) 处理异常情况
5. **加载状态**：使用 Loading UI (`loading.tsx`) 和 Suspense 处理加载状态

## 开发约定

- 每次新增页面时创建对应的 `loading.tsx` 和 `error.tsx`
- API 返回值统一用 Zod Schema 校验
- 数据库迁移文件（`prisma/migrations/`）纳入版本控制
- `.env.local` 不提交，变量定义在 `.env.local.example` 中
