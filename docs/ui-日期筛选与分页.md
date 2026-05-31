# UI 设计 - 日期筛选与分页

## 设计目标

为内容列表新增日期筛选和分页两个能力。日期筛选与已有场景筛选共存于顶部筛选栏；分页器位于列表底部。设计需无缝嵌入现有页面，不破坏已有视觉层级。

## 设计原则

- **筛选栏统一**：日期 + 场景筛选放在同一个横向区域，视觉层级一致
- **即时反馈**：筛选切换通过 URL searchParams 驱动，无额外加载 spinner（SSR 天然支持）
- **分页克制**：分页器仅在需要时出现，不增加页面噪音
- **触控友好**：所有筛选 chip 支持横向滑动，分页按钮有足够点按区域

---

## 1. 日期筛选 Chip 组

### 1.1 组件规格

```
时间  [● 全部] [○ 今天] [○ 最近7天] [○ 最近30天] [○ 最近3个月]  📅
      └─ 选中态 ─┘  └─ 默认态 ─────────────────────┘  └ 自定义入口
```

| 属性 | 值 |
|------|---|
| 标签前缀 | `text-xs text-gray-400 font-medium flex-shrink-0` → `时间` |
| Chip 默认 | `flex-shrink-0 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 cursor-pointer whitespace-nowrap` |
| Chip 选中 | `bg-gray-900 text-white border-gray-900` |
| 容器 | `flex items-center gap-2 overflow-x-auto scrollbar-hide` |
| 自定义入口 | 日历图标 `📅`，与 chip 同尺寸，点击弹出日期选择器 |

### 1.2 与场景筛选 Chip 的视觉区分

```
时间  [● 全部] [○ 最近7天] [○ 最近30天]      ← 纯文字 chip，选中为深色填充
场景  [○ 全部 23] [● 🤖 AI Coding 8] [○ 📊 PPT 3]  ← 带 emoji + 计数
```

| 维度 | 日期 Chip | 场景 Chip |
|------|----------|----------|
| 内容 | 纯文字标签 | emoji + 名称 + 计数 |
| 选中态 | `bg-gray-900 text-white` | `bg-gray-900 text-white`（一致） |
| 默认态 | `border-gray-200 text-gray-500` | `border-gray-200 text-gray-500`（一致） |
| 禁用态 | 无（时间段始终可选） | `text-gray-300 cursor-not-allowed`（计数为 0） |

### 1.3 交互行为

- 点击任一快捷选项 → 立即切换，URL 更新，列表刷新
- 点击 `📅` 图标 → 展开自定义日期面板（见 §4）
- 切换时间段后 → 分页回到第 1 页
- 切换时间段后 → 场景筛选的计数同步更新

---

## 2. 分页器

### 2.1 组件规格

```
                          共 156 条内容
          ← 上一页   1  2  3  4  5  ...  8   下一页 →
                          ↑
                       当前页
```

| 属性 | 值 |
|------|---|
| 容器 | `flex flex-col items-center gap-2 pt-6 pb-4` |
| 总条数 | `text-xs text-gray-400`，位于页码上方 |
| 按钮行 | `flex items-center gap-1` |
| 上/下页按钮 | `inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50` |
| 上/下页禁用 | `border-gray-100 text-gray-300 cursor-not-allowed` |
| 页码默认 | `inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs text-gray-500 transition-colors hover:bg-gray-100` |
| 页码当前 | `bg-gray-900 text-white hover:bg-gray-800` |
| 省略号 | `inline-flex items-center justify-center w-8 h-8 text-xs text-gray-300` |
| 分隔线（可选） | 分页器上方 `border-t border-gray-100` |

### 2.2 页码展示逻辑

```
总页数 ≤ 7:
  ← 上一页  1  2  3  4  5  6  7  下一页 →

总页数 > 7, 当前页在前 4 页:
  ← 上一页  1  2  3  4  5  ...  12  下一页 →

总页数 > 7, 当前页在中间:
  ← 上一页  1  ...  4  5  6  ...  12  下一页 →

总页数 > 7, 当前页在后 4 页:
  ← 上一页  1  ...  8  9  10  11  12  下一页 →
```

### 2.3 边界情况

| 场景 | 处理 |
|------|------|
| 总页数 = 1 | 不显示分页器 |
| 总页数 = 0 | 不显示分页器，显示空状态 |
| 当前页 = 1 | "上一页" 置灰不可点击 |
| 当前页 = 最后页 | "下一页" 置灰不可点击 |
| 点击页码 | 页面跳转，自动滚动到列表顶部 |

### 2.4 响应式

| 断点 | 行为 |
|------|------|
| 375px (Mobile) | 页码按钮缩小为 `w-7 h-7 text-[11px]`，显示较少页码（当前 ± 1） |
| 640px+ (sm) | 正常尺寸 `w-8 h-8 text-xs`，当前 ± 2 |

---

## 3. 各页面布局整合

### 3.1 首页

```
┌──────────────────────────────────────────────┐
│ 🏘️ 假装社区                                   │
│ AI 资讯 & 教程 · 个人内容聚合器                 │
├──────────────────────────────────────────────┤
│                                              │
│ 📍 按场景浏览                                  │  ← 场景横滑卡片（已有）
│ [🤖 AI Coding] [📊 AI做PPT] [🎬 AI做视频] ... │
│                                              │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                              │
│ 时间  [● 全部] [○ 今天] [○ 最近7天] ...   📅  │  ← ★ 日期筛选（新增）
│                                              │
├──────────────────────────────────────────────┤
│ AI 资讯                             23 条内容 │  ← 板块（每板块最新 20 条）
│ [卡片] [卡片] [卡片] ...                      │
├──────────────────────────────────────────────┤
│ AI 教程                             15 条内容 │
│ [卡片] [卡片] [卡片] ...                      │
└──────────────────────────────────────────────┘
```
> 首页**无分页器**。

### 3.2 板块页

```
┌──────────────────────────────────────────────┐
│ ← 返回首页                       🏘️ 假装社区  │
├──────────────────────────────────────────────┤
│                                              │
│ AI 资讯                             156 条内容 │  ← 板块标题
│ 最新 AI 行业资讯与动态                         │
│                                              │
│ 时间  [● 全部] [○ 今天] [○ 最近7天] ...   📅  │  ← ★ 日期筛选
│ 场景  [● 全部 156] [○ 🤖 AI Coding 42] ...  →│  ← 场景筛选（已有）
│                                              │
├──────────────────────────────────────────────┤
│ [卡片] [卡片] [卡片] ...                      │
│ [卡片] [卡片] [卡片] ...                      │
├──────────────────────────────────────────────┤
│                                              │
│          共 156 条内容                         │  ← ★ 分页器
│   ← 上一页   1  2  3  ...  8   下一页 →        │
│                                              │
└──────────────────────────────────────────────┘
```

### 3.3 场景详情页

```
┌──────────────────────────────────────────────┐
│ ← 返回首页                       🏘️ 假装社区  │
├──────────────────────────────────────────────┤
│                                              │
│               🤖                             │
│            AI Coding                         │
│    AI 辅助编程、代码生成、IDE 插件              │
│    42 条内容 · 最近更新：2小时前               │
│                                              │
│ 板块  [● 全部] [○ AI 资讯] [○ AI 教程]       │  ← 板块子筛选（已有）
│ 时间  [● 全部] [○ 今天] [○ 最近7天] ...   📅  │  ← ★ 日期筛选
│                              排序: [最新] [最热]│
│                                              │
├──────────────────────────────────────────────┤
│ [卡片] [卡片] [卡片] ...                      │
├──────────────────────────────────────────────┤
│                                              │
│          共 42 条内容                          │  ← ★ 分页器
│   ← 上一页   1  2  3  下一页 →                │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 4. 自定义日期范围选择器（P1）

### 4.1 触发方式

点击日期筛选 chip 行末尾的 `📅` 图标。

### 4.2 弹出面板

```
┌─────────────────────────────────┐
│ 自定义时间范围                    │
│                                 │
│ 起始日期                         │
│ ┌─────────────────────────────┐ │
│ │ 2026-05-01          📅      │ │  ← 日期输入框
│ └─────────────────────────────┘ │
│                                 │
│ 结束日期                         │
│ ┌─────────────────────────────┐ │
│ │ 2026-05-31          📅      │ │
│ └─────────────────────────────┘ │
│                                 │
│ [清除筛选]              [应用]   │
└─────────────────────────────────┘
```

| 属性 | 值 |
|------|---|
| 弹出容器 | `absolute right-0 top-full mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-lg z-20 w-[280px]` |
| 触发按钮 | `flex-shrink-0 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors` |
| 输入框 | `w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300` |
| 应用按钮 | `rounded-lg bg-gray-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-800` |
| 清除按钮 | `text-xs text-gray-400 hover:text-gray-600` |

### 4.3 交互

- 选择自定义范围后 → 日期 chip 行自动显示「自定义」chip 替换原有选中
- `自定义` chip 显示日期简写：如 `○ 05/01 - 05/31`，点击可重新打开面板
- 点击「清除筛选」→ 回到「全部」，关闭面板

---

## 5. 状态设计

### 5.1 加载状态

日期/分页切换 → SSR 页面跳转 → 由 `loading.tsx` 展示骨架屏（无需新设计）。

### 5.2 空状态

```
筛选后无结果:
  ┌─────────────────────────────────┐
  │            📭                   │
  │    该时间范围内暂无内容           │
  │   尝试扩大时间范围或清除筛选条件    │
  │          [清除筛选]              │
  └─────────────────────────────────┘
```

| 属性 | 值 |
|------|---|
| 容器 | `rounded-lg border-2 border-dashed border-gray-200 py-16 text-center` |
| 图标 | `text-4xl` |
| 文案 | `text-sm text-gray-400` |
| CTA | `mt-3 rounded-lg border border-gray-200 px-4 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors` |

### 5.3 边界情况

| 场景 | 处理 |
|------|------|
| 某段时间内无场景内容 | 场景 chip 计数为 0，置灰 |
| 日期范围起始 > 结束 | 应用按钮置灰 + 输入框红色边框 |
| 分页页码超出范围 | 自动回退到第 1 页 |
| 筛选后结果 < 20 条 | 正常展示，无分页器 |

---

## 6. 响应式适配

### 6.1 筛选栏

```
Mobile (375px):
  时间  [全部] [7天] [30天] →          ← 横向滚动，一次可见约 3 个 chip
  场景  [全部 23] [🤖 AI Coding 8] →   ← 横向滚动

Desktop (768px+):
  时间  [全部] [今天] [最近7天] [最近30天] [最近3个月]  📅   ← 全部可见
  场景  [全部 23] [🤖 AI Coding 8] [📊 PPT 3] [🎬 视频 5] ... →  ← 空间更大
```

### 6.2 分页器

```
Mobile:
  共 156 条
  ← 1 2 3 ... 8 →             ← 更紧凑

Desktop:
          共 156 条内容
  ← 上一页  1  2  3  4  5  ...  8  下一页 →
```

---

## 7. Tailwind 组件代码参考

### 7.1 日期筛选 Chip 组

```tsx
// 日期筛选 chip 行 — 用于首页/板块页/场景页
const PERIODS = [
  { value: "all", label: "全部" },
  { value: "today", label: "今天" },
  { value: "7d", label: "最近7天" },
  { value: "30d", label: "最近30天" },
  { value: "90d", label: "最近3个月" },
] as const

function DateFilter({
  currentPeriod,
  baseUrl,
}: {
  currentPeriod: string
  baseUrl: string
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      <span className="text-xs text-gray-400 font-medium flex-shrink-0">时间</span>

      {PERIODS.map((p) => {
        const isActive = currentPeriod === p.value
        const href = `${baseUrl}?period=${p.value}`

        return (
          <a
            key={p.value}
            href={href}
            className={cn(
              "flex-shrink-0 rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap",
              isActive
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50",
            )}
          >
            {p.label}
          </a>
        )
      })}

      {/* 自定义日期入口 (P1) */}
      <button
        type="button"
        onClick={() => setShowCustomDate(true)}
        className={cn(
          "flex-shrink-0 rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap",
          currentPeriod === "custom"
            ? "bg-gray-900 text-white border-gray-900"
            : "border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300",
        )}
      >
        📅
      </button>
    </div>
  )
}
```

### 7.2 分页器

```tsx
// 底部分页器 — 用于板块页/场景页
function Pagination({
  currentPage,
  totalPages,
  totalCount,
  baseUrl,
}: {
  currentPage: number
  totalPages: number
  totalCount: number
  baseUrl: string
}) {
  if (totalPages <= 1) return null // 不显示

  const pages = generatePageNumbers(currentPage, totalPages)

  return (
    <div className="flex flex-col items-center gap-2 pt-6 pb-4 border-t border-gray-100">
      <p className="text-xs text-gray-400">共 {totalCount} 条内容</p>

      <div className="flex items-center gap-1">
        {/* 上一页 */}
        {currentPage > 1 ? (
          <a
            href={`${baseUrl}?page=${currentPage - 1}`}
            className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            ← 上一页
          </a>
        ) : (
          <span className="inline-flex items-center rounded-lg border border-gray-100 px-3 py-1.5 text-xs text-gray-300 cursor-not-allowed">
            ← 上一页
          </span>
        )}

        {/* 页码 */}
        {pages.map((p, i) =>
          p === null ? (
            <span
              key={`ellipsis-${i}`}
              className="inline-flex items-center justify-center w-8 h-8 text-xs text-gray-300"
            >
              ...
            </span>
          ) : (
            <a
              key={p}
              href={`${baseUrl}?page=${p}`}
              className={cn(
                "inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs transition-colors",
                p === currentPage
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "text-gray-500 hover:bg-gray-100",
              )}
            >
              {p}
            </a>
          ),
        )}

        {/* 下一页 */}
        {currentPage < totalPages ? (
          <a
            href={`${baseUrl}?page=${currentPage + 1}`}
            className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            下一页 →
          </a>
        ) : (
          <span className="inline-flex items-center rounded-lg border border-gray-100 px-3 py-1.5 text-xs text-gray-300 cursor-not-allowed">
            下一页 →
          </span>
        )}
      </div>
    </div>
  )
}

// 页码生成逻辑
function generatePageNumbers(
  current: number,
  total: number,
): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | null)[] = [1]

  if (current <= 4) {
    // 前 4 页: 1 2 3 4 5 ... N
    for (let i = 2; i <= Math.min(5, total - 1); i++) pages.push(i)
    if (total > 6) pages.push(null, total)
  } else if (current >= total - 3) {
    // 后 4 页: 1 ... N-4 N-3 N-2 N-1 N
    pages.push(null)
    for (let i = Math.max(total - 4, 2); i <= total; i++) pages.push(i)
  } else {
    // 中间: 1 ... C-1 C C+1 ... N
    pages.push(null)
    for (let i = current - 1; i <= current + 1; i++) pages.push(i)
    pages.push(null, total)
  }

  return pages
}
```

### 7.3 组合筛选栏

```tsx
// 板块页 — 日期 + 场景筛选栏
function BoardFilterBar({
  period,
  scenario,
  scenarios,
  baseUrl,
}: {
  period: string
  scenario: string | null
  scenarios: { slug: string; icon: string; name: string; count: number }[]
  baseUrl: string
}) {
  return (
    <div className="space-y-3 mb-6">
      {/* 日期筛选 */}
      <DateFilter currentPeriod={period} baseUrl={baseUrl} />

      {/* 场景筛选 */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <span className="text-xs text-gray-400 font-medium flex-shrink-0">场景</span>
        <a
          href={`${baseUrl}?period=${period}`}
          className={cn(
            "flex-shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap",
            !scenario
              ? "bg-gray-900 text-white border-gray-900"
              : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50",
          )}
        >
          全部
        </a>
        {scenarios.map((s) => (
          <a
            key={s.slug}
            href={`${baseUrl}?period=${period}&scenario=${s.slug}`}
            className={cn(
              "flex-shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap",
              s.count === 0 && "text-gray-300 border-gray-100 cursor-not-allowed",
              scenario === s.slug
                ? "bg-gray-900 text-white border-gray-900"
                : s.count > 0
                  ? "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  : "",
            )}
            aria-disabled={s.count === 0}
          >
            {s.icon} {s.name}
            <span className="text-[10px] opacity-60">{s.count}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
```

### 7.4 筛选后空状态

```tsx
// 筛选无结果时的空状态
function FilterEmptyState({
  onClear,
}: {
  onClear: () => void
}) {
  return (
    <div className="rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
      <p className="text-4xl">📭</p>
      <p className="mt-3 text-sm text-gray-400">该时间范围内暂无内容</p>
      <p className="mt-1 text-xs text-gray-300">尝试扩大时间范围或清除筛选条件</p>
      <button
        onClick={onClear}
        className="mt-3 inline-flex items-center rounded-lg border border-gray-200 px-4 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-50"
      >
        清除筛选
      </button>
    </div>
  )
}
```

---

## 8. 设计交付清单

| 交付项 | 说明 | 状态 |
|--------|------|------|
| `docs/ui-日期筛选与分页.md` | 本文档 | ✅ |
| 日期筛选 Chip 组 | 5 个预设 + 自定义入口 | 待开发 |
| 分页器组件 | 页码 + 省略号 + 上下页 | 待开发 |
| 组合筛选栏 | 日期 + 场景 chip 共存 | 待开发 |
| 自定义日期面板 | 起止日期选择器 Popover | 待开发（P1） |
| 筛选空状态 | 无结果友好提示 + 清除 CTA | 待开发 |

---

## 9. 与已有 UI 的关系

| 已有组件 | 本设计对其影响 |
|---------|-------------|
| 首页 Header + 场景导航 | 下方新增日期 chip 行 |
| 板块页内容列表 | 上方新增组合筛选栏、下方新增分页器 |
| 场景详情页 | 板块子筛选下方新增日期 chip 行、下方新增分页器 |
| 内容卡片 | 无变化 |
| 空状态 | 新增「筛选无结果」变体 |
| 管理后台 | 无变化 |
