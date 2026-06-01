# UI 设计 - 来源切换、内容详情页、评论

## 设计目标

新增 3 个 UI 组件：平台筛选 chip、内容详情页、评论区。同时将平台筛选融入现有组合筛选栏，形成三层筛选体系（时间 / 平台 / 场景）。

## 设计原则

- **三层筛选视觉统一**：时间 chip → 平台 chip → 场景 chip，垂直排列，样式一致
- **详情页信息密度适中**：标题 → 摘要 → 元数据 → 标签 → 评论，自然阅读流
- **评论轻量化**：头像 + 作者 + 正文 + 点赞，不展示深层嵌套回复
- **移动端内容优先**：详情页去掉侧栏，单列纵向布局

---

## 1. 平台筛选 Chip

### 1.1 组件规格

```
平台  [● 全部] [○ 📺 B站] [○ ▶️ YouTube] [○ 📦 GitHub]
       └─ 选中 ─┘  └─ 默认态 ──────────────────────┘
```

| 属性 | 值 |
|------|---|
| 标签前缀 | `text-xs text-gray-400 font-medium flex-shrink-0` → `平台` |
| Chip 默认 | `flex-shrink-0 inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 cursor-pointer whitespace-nowrap` |
| Chip 选中 | `bg-gray-900 text-white border-gray-900` |
| 前缀 icon | emoji（📺 ▶️ 📦），放在文字前 |
| 容器 | `flex items-center gap-2 overflow-x-auto scrollbar-hide` |

### 1.2 三层筛选栏整合

现有筛选栏变成三行：

```
时间  [● 全部] [○ 今天] [○ 最近7天] [○ 最近30天] [○ 最近3个月]  📅
平台  [● 全部] [○ 📺 B站 15] [○ ▶️ YouTube 15] [○ 📦 GitHub 42]
场景  [○ 全部 50] [○ 🤖 AI Coding 12] [○ 📊 AI做PPT 8] ...
```

| 行 | 内容 | 计数 |
|----|------|------|
| 时间 | 全部 / 今天 / 7天 / 30天 / 3个月 | — |
| 平台 | 全部 / 📺 B站 / ▶️ YouTube / 📦 GitHub | 各平台内容数 |
| 场景 | 全部 / 🤖 AI Coding / 📊 AI做PPT ... | 各场景内容数 |

- 三行之间用 `space-y-3` 隔开
- 同一 `border-b border-gray-100 pb-3` 容器包裹
- 每行标签前缀对齐（`w-8` 或统一不设宽度）

---

## 2. 内容详情页 — `/contents/[id]`

### 2.1 页面布局

```
┌──────────────────────────────────────────────┐
│ ← 返回                         🏘️ 假装社区    │
├──────────────────────────────────────────────┤
│                                              │
│ 📦 仓库                        2026-05-31    │  ← 平台类型 + 日期
│                                              │
│ huggingface/transformers: 🤗 Transformers    │  ← 标题
│ State-of-the-art ML for text, vision...      │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 转载自 GitHub · huggingface · ⭐ 145k    │ │  ← 来源信息卡
│ │ 🔗 查看原文 (github.com)                 │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ 📝 AI 摘要                                  │  ← 摘要区
│                                              │
│ Transformers 是 Hugging Face 的核心库，      │
│ 提供了数千个预训练模型，支持 PyTorch、       │
│ TensorFlow 和 JAX。它让NLP、CV、语音等领域   │
│ 的SOTA模型变得触手可及...                    │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ 🏷️ 标签                                     │  ← 标签区
│ [🤖 AI Coding]  #transformers #NLP #ML       │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ 📊 元数据                                    │  ← 元数据区
│ 星标: 145,234    复刻: 18,567               │
│ 语言: Python     开源协议: Apache-2.0        │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ 💬 评论 (12)                                 │  ← 评论区
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 😎 user123        2天前          👍 45   │ │
│ │ This is amazing! The new transformer... │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ 🧑 devguy          1天前          👍 12   │ │
│ │ Finally, been waiting for this feature!  │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ ← 上一篇    下一篇 →                         │  ← 底部导航
│                                              │
└──────────────────────────────────────────────┘
```

### 2.2 区块规格

#### 标题区

| 属性 | 值 |
|------|---|
| 平台标识 | `inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500` |
| 日期 | `text-xs text-gray-400` |
| 标题 | `text-xl font-bold text-gray-900 mt-2` |

#### 来源信息卡

| 属性 | 值 |
|------|---|
| 容器 | `rounded-xl border border-gray-200 bg-gray-50 p-4` |
| 来源行 | `text-sm text-gray-600`，平台 icon + 来源名 |
| 统计行 | `text-xs text-gray-400 mt-1` |
| 原文链接 | `mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors` |

#### 摘要区

| 属性 | 值 |
|------|---|
| 标题 | `text-sm font-semibold text-gray-700 mb-2` → `📝 AI 摘要` |
| 正文 | `text-sm text-gray-600 leading-relaxed whitespace-pre-line` |

#### 标签区

| 属性 | 值 |
|------|---|
| 场景标签 | 复用 `ScenarioTag`（蓝色圆角矩形） |
| 普通标签 | `rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500` |

#### 元数据区

| 属性 | 值 |
|------|---|
| 容器 | `grid grid-cols-2 gap-3 text-sm` |
| 标签 | `text-xs text-gray-400` |
| 值 | `text-sm text-gray-700 font-medium` |

#### 评论区

| 属性 | 值 |
|------|---|
| 区块标题 | `text-sm font-semibold text-gray-700 mb-3` → `💬 评论 (N)` |
| 评论卡片 | `rounded-lg border border-gray-100 bg-white p-3` |
| 头像 | `w-8 h-8 rounded-full bg-gray-200 flex-shrink-0` |
| 作者名 | `text-sm font-medium text-gray-800` |
| 时间 | `text-[11px] text-gray-400` |
| 点赞 | `text-[11px] text-gray-400` → `👍 N` |
| 正文 | `text-sm text-gray-600 mt-1 leading-relaxed` |
| 空评论 | `text-sm text-gray-400 text-center py-8` → `暂无评论` |

#### 底部导航

| 属性 | 值 |
|------|---|
| 容器 | `flex justify-between pt-6 border-t border-gray-100` |
| 链接 | `text-sm text-gray-500 hover:text-gray-900 transition-colors` |
| 禁用 | `text-gray-300 cursor-not-allowed`（无上一篇/下一篇时） |

---

## 3. 评论区

### 3.1 组件规格

```
💬 评论 (12)

┌──────────────────────────────────┐
│ 😎 user123      2天前    👍 45  │
│ This is amazing! The new...     │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ 🧑 devguy        1天前    👍 12  │
│ Finally! Been waiting for this.  │
└──────────────────────────────────┘
```

### 3.2 详细样式

```tsx
<div className="space-y-3">
  <h3 className="text-sm font-semibold text-gray-700">
    💬 评论 ({comments.length})
  </h3>

  {comments.map((c) => (
    <div key={c.id} className="rounded-lg border border-gray-100 bg-white p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* 头像 — 无头像时用首字符 */}
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
            {c.authorName[0]}
          </div>
          <div>
            <span className="text-sm font-medium text-gray-800">
              {c.authorName}
            </span>
            <span className="ml-2 text-[11px] text-gray-400">
              {formatTimeAgo(c.createdAt)}
            </span>
          </div>
        </div>
        {/* 点赞 */}
        <span className="text-[11px] text-gray-400 flex items-center gap-1">
          👍 {c.likeCount}
        </span>
      </div>
      {/* 评论正文 */}
      <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
        {c.body}
      </p>
    </div>
  ))}
</div>
```

### 3.3 空评论状态

```
💬 评论 (0)
┌──────────────────────────────────┐
│          💬                      │
│        暂无评论                   │
│   采集到评论后会出现在这里         │
└──────────────────────────────────┘
```

---

## 4. 状态设计

### 4.1 详情页加载态

```
┌──────────────────────────────────┐
│ ← 返回                          │
│                                  │
│ [████]                           │  ← 平台标识骨架
│                                  │
│ ████████████████████             │  ← 标题骨架
│ ██████████████                   │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ ██████████████               │ │
│ │ ████████████                 │ │
│ └──────────────────────────────┘ │
│                                  │
│ 📝 AI 摘要                       │
│ ████████████████████████████████ │
│ ██████████████████               │
│                                  │
│ 💬 评论 (--)                     │
│ ████████████████████████         │
│ ████████████████████████         │
└──────────────────────────────────┘
```

### 4.2 详情页错误态

```
⚠️ 加载失败
内容暂时无法加载，请稍后重试

[重新加载]
```

### 4.3 筛选无结果

复用 `FilterEmptyState` 组件，参数化文案：
- 按平台筛选无结果: `该平台暂无内容`

---

## 5. 响应式适配

| 区域 | 375px (Mobile) | 768px+ (Desktop) |
|------|---------------|-------------------|
| 筛选栏 | 每行独立横滚，可见 2-3 chip | 三行全部可见 |
| 详情页 | 全宽单列，`px-4` | `max-w-3xl` 居中 |
| 元数据 | 2 列 grid | 2 列 grid |
| 评论 | 全宽 | 全宽 |
| 底部导航 | 单行 `← 上一篇 下一篇 →` | 同样 |

---

## 6. Tailwind 代码参考

### 6.1 平台筛选 Chip

```tsx
const PLATFORMS = [
  { value: "", label: "全部", icon: "" },
  { value: "bilibili", label: "B站", icon: "📺" },
  { value: "youtube", label: "YouTube", icon: "▶️" },
  { value: "github", label: "GitHub", icon: "📦" },
]

{PLATFORMS.map((p) => (
  <Link
    key={p.value}
    href={buildUrl(basePath, { ...params, platform: p.value || undefined, page: "1" })}
    scroll={false}
    className={cn(
      "flex-shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap",
      currentPlatform === p.value
        ? "bg-gray-900 text-white border-gray-900"
        : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
    )}
  >
    {p.icon && <span>{p.icon}</span>}
    {p.label}
    {p.value && <span className="text-[10px] opacity-60">{countMap[p.value]}</span>}
  </Link>
))}
```

### 6.2 组合筛选栏（三层）

```tsx
<div className="space-y-3 mb-6 border-b border-gray-100 pb-3">
  {/* 时间 */}
  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
    <span className="text-xs text-gray-400 font-medium flex-shrink-0">时间</span>
    {PERIODS.map(...)}
  </div>

  {/* 平台 */}
  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
    <span className="text-xs text-gray-400 font-medium flex-shrink-0">平台</span>
    {PLATFORMS.map(...)}
  </div>

  {/* 场景 */}
  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
    <span className="text-xs text-gray-400 font-medium flex-shrink-0">场景</span>
    <Link href={allUrl} ...>全部 {totalCount}</Link>
    {scenarios.map(s => <ScenarioChip ... />)}
  </div>
</div>
```

---

## 7. 设计交付清单

| 交付项 | 说明 |
|--------|------|
| 平台筛选 chip | 三层筛选栏中的第二行 |
| 内容详情页 | `/contents/[id]` 完整布局 |
| 评论区组件 | 评论列表 + 空状态 |
| 组合筛选栏更新 | 三行（时间/平台/场景）统一容器 |
| 所有状态 | 加载/空/错误/筛选无结果 |
