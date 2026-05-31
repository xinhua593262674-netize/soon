# UI 设计 - 应用场景维度

## 设计目标

为「应用场景」维度设计一套贯穿首页、内容卡片、场景详情、板块筛选、管理后台的完整 UI。场景作为与板块正交的导航维度，需要**视觉辨识度高于普通标签，但弱于板块分区**。

## 设计原则

- **轻量不喧宾夺主**：场景是辅助导航，不应抢占板块的主体地位
- **高辨识度**：场景标签需要与普通关键词标签有明显视觉区分
- **无缝嵌入**：所有场景相关 UI 都嵌入现有页面，不引入额外页面层级
- **触控友好**：横向滚动的卡片和 chip 都需支持移动端滑动

---

## 1. 首页 — 场景导航区

### 1.1 位置与布局

场景导航区位于 Header 与第一个板块之间，作为首页的第二级导航：

```
┌──────────────────────────────────────────┐
│ 🏘️ 假装社区                               │
│ AI 资讯 & 教程 · 个人内容聚合器             │
├──────────────────────────────────────────┤
│                                          │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐    │  ← 横向滚动
│ │🤖│ │📊│ │🎬│ │✍️│ │🎨│ │📈│ │ →  │    │
│ │AI │ │AI │ │AI │ │AI │ │AI │ │AI │    │
│ │Cod│ │做 │ │做 │ │写 │ │绘 │ │数 │    │
│ │ing│ │PPT│ │视频│ │作 │ │画 │ │据 │    │
│ │12 │ │ 8 │ │ 5 │ │15 │ │ 9 │ │ 3 │    │
│ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘    │
│ ← 左滑查看更多                           │
├──────────────────────────────────────────┤
│ AI 资讯                         23 条内容 │
│ ┌──────────────────────────────────────┐ │
│ │ ...内容卡片...                        │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

### 1.2 场景卡片规格

```
┌─────────────────────┐
│      🤖             │  ← emoji 36x36, 居中
│   AI Coding         │  ← text-sm font-medium
│   12 条内容          │  ← text-[11px] text-gray-400
└─────────────────────┘
```

| 属性 | 值 |
|------|---|
| 容器 | `flex-shrink-0 w-[100px] rounded-xl border border-gray-200 bg-white p-3 text-center transition hover:border-primary-300 hover:shadow-sm cursor-pointer` |
| 选中态 | `border-primary-500 bg-primary-50 ring-1 ring-primary-200` |
| Emoji | `text-3xl mb-1.5 block` |
| 名称 | `text-sm font-medium text-gray-700 leading-tight` |
| 计数 | `text-[11px] text-gray-400 mt-0.5` |
| 容器间距 | `gap-3` |
| 滚动区 | `overflow-x-auto scrollbar-hide pb-1`（隐藏滚动条但可滑动） |
| 区标题 | `text-xs font-medium text-gray-400 uppercase tracking-wider mb-3` |

### 1.3 响应式

| 断点 | 行为 |
|------|------|
| 375px (Mobile) | 卡片 `w-[88px]`，一次可见 3.5 个，`gap-2` |
| 640px (sm) | 卡片 `w-[100px]`，一次可见 5 个 |
| 768px (md) | 卡片 `w-[108px]`，展示全部 10 个（若空间足够则不滚动） |
| 1024px (lg) | `max-w-5xl` 居中，全部展示 |

### 1.4 空状态（无场景）

当尚未配置任何场景时，隐藏整个场景导航区，不展示空状态。

### 1.5 加载状态

场景列表 SSR 渲染，无加载态。内容计数在 `/scenarios/counts` API 返回前展示 `--`。

---

## 2. 内容卡片 — 场景标签

### 2.1 位置

场景标签插入在现有内容卡片的元数据行中，位于标签列表**之前**：

```
┌──────────────────────────────────────────┐
│ 📦 [仓库] GPT-5 正式发布...               │  ← 类型标签 + 标题
│ OpenAI 今日正式发布 GPT-5...               │  ← 摘要
│                                          │
│ openai · 2小时前 · 💬 45                  │  ← 元数据行
│ [🤖 AI Coding] [📊 AI 做 PPT]            │  ← ★ 场景标签（新增）
│ #OpenAI #GPT-5                    🔗 原文 │  ← 普通标签 + 原文链接
└──────────────────────────────────────────┘
```

### 2.2 场景标签规格

| 属性 | 值 |
|------|---|
| 容器 | `inline-flex items-center gap-1 rounded-md bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700 transition-colors hover:bg-primary-100` |
| 点击行为 | `<a href="/scenarios/{slug}">` 跳转场景详情页 |

### 2.3 与普通标签的对比

```
普通标签：  #OpenAI              ← rounded-full bg-gray-100 text-gray-500
场景标签：  🤖 AI Coding         ← rounded-md bg-primary-50 text-primary-700
```

**核心区分**：
- 场景标签：圆角矩形 + 蓝色系 + 带 emoji
- 普通标签：全圆角 + 灰色系 + `#` 前缀
- 场景标签排在普通标签前面

### 2.4 无场景的内容

若内容未关联任何场景，不展示场景标签行，元数据行直接接普通标签。**不展示空状态或占位符。**

---

## 3. 场景详情页

### 3.1 页面路由

`/scenarios/[slug]`（如 `/scenarios/ai-coding`）

### 3.2 整体布局

```
┌──────────────────────────────────────────┐
│ ← 返回首页                   🏘️ 假装社区  │  ← 顶部导航
├──────────────────────────────────────────┤
│                                          │
│   🤖                                     │
│   AI Coding                              │  ← 场景标题区
│   AI 辅助编程、代码生成、IDE 插件           │
│   12 条内容 · 最近更新：2小时前             │
│                                          │
│   板块筛选: [全部] [AI 资讯] [AI 教程]     │  ← 板块子筛选 (chip)
│   排序: [最新 ↑] [最热]                   │  ← 排序切换
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ ▶️ [视频] Claude Code 最佳实践       │ │  ← 内容卡片（复用现有样式）
│ │ ...场景标签 + 普通标签...             │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │ 📦 [仓库] cursor-tools               │ │
│ │ ...                                  │ │
│ └──────────────────────────────────────┘ │
│               ...                        │
└──────────────────────────────────────────┘
```

### 3.3 场景标题区规格

```
┌──────────────────────────────────────┐
│          🤖                          │  ← text-5xl, 居中
│       AI Coding                      │  ← text-2xl font-bold text-gray-900
│  AI 辅助编程、代码生成、IDE 插件      │  ← text-sm text-gray-500
│  12 条内容 · 最近更新：2小时前        │  ← text-xs text-gray-400
└──────────────────────────────────────┘
```

| 属性 | 值 |
|------|---|
| 区块容器 | `text-center py-8 border-b border-gray-100 mb-6` |
| Emoji | `text-5xl mb-3 block` |
| 标题 | `text-2xl font-bold text-gray-900` |
| 描述 | `text-sm text-gray-500 mt-1.5` |
| 统计行 | `text-xs text-gray-400 mt-2` |

### 3.4 板块子筛选

场景页顶部提供板块 chip 筛选，选中某板块后仅展示该板块+该场景的内容：

```
板块筛选:  [○ 全部] [○ AI 资讯] [● AI 教程]
```

| 属性 | 值 |
|------|---|
| 容器 | `flex items-center gap-2 text-sm text-gray-500 mb-4` |
| 标签文案 | `板块筛选:` |
| Chip 默认 | `rounded-full px-3 py-1 text-xs border border-gray-200 text-gray-500 hover:border-gray-300 cursor-pointer transition-colors` |
| Chip 选中 | `rounded-full px-3 py-1 text-xs bg-gray-900 text-white` |

### 3.5 排序切换

```
排序:  [● 最新] [○ 最热]
```

| 属性 | 值 |
|------|---|
| 容器 | `flex items-center gap-2 text-xs text-gray-400 ml-auto` |
| 选项 | `text-xs cursor-pointer transition-colors` |
| 选中 | `text-gray-900 font-medium underline underline-offset-4` |

### 3.6 空状态

某场景下暂无内容时：

```
         📭
  该场景下还没有内容
  采集到的相关内容会自动出现在这里
```

复用现有 `EmptyBoardState` 组件的样式（`border-2 border-dashed rounded-lg`）。

---

## 4. 板块页 — 场景筛选器

### 4.1 位置

位于板块页 Header 与内容列表之间：

```
┌──────────────────────────────────────────┐
│ AI 资讯                         23 条内容 │  ← 板块标题
│ 最新 AI 行业资讯与动态                     │
├──────────────────────────────────────────┤
│ 场景: [全部 23] [🤖 AI Coding 8] [📊 PPT 3] [🎬 视频 5] ... →  │  ← 场景筛选 chip
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │ ...内容卡片...                        │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

### 4.2 筛选 Chip 规格

| 属性 | 值 |
|------|---|
| 容器 | `flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4 border-b border-gray-100` |
| 标签文案 | `text-xs text-gray-400 font-medium mr-1 flex-shrink-0` → `场景:` |
| Chip 默认 | `flex-shrink-0 inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 cursor-pointer whitespace-nowrap` |
| Chip 选中 | `bg-gray-900 text-white border-gray-900` |
| Chip 计数 | `text-[10px] opacity-60`（如 `8`） |

### 4.3 交互

- 默认选中「全部」，展示板块下所有内容
- 点击某场景 chip → 筛选仅展示该场景内容
- 选中态为实心深色 chip
- 若某场景在该板块下计数为 0，仍展示但置灰
- 场景列表按内容数量降序排列

### 4.4 无场景可选时

若该板块下没有任何内容关联了场景，隐藏整个筛选器行。

---

## 5. 管理后台 — 场景标注

### 5.1 位置

嵌入现有管理后台的内容列表/审核队列中。

### 5.2 内容列表行内展示

```
┌──────────────────────────────────────────────────────────────┐
│ 📦 GPT-5 正式发布...                        评分: 4.2 ✅      │
│ openai · AI 资讯 · 2小时前                                   │
│ 场景: [🤖 AI Coding] [📊 AI 做 PPT]         [✏️ 编辑场景]    │
│ #OpenAI #GPT-5                                               │
│                                          [发布] [丢弃]        │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 场景编辑弹窗

点击「编辑场景」→ 弹出轻量面板/弹窗：

```
┌─────────────────────────────────┐
│ 编辑应用场景 — GPT-5 正式发布...  │
│                                 │
│ 选择场景（最多3个）:              │
│                                 │
│ [✓ 🤖 AI Coding]  置信度 92%    │  ← 绿色边框 = AI 推荐
│ [✓ 📊 AI 做 PPT]  置信度 78%    │
│ [  🎬 AI 做视频]               │  ← 普通 = 未选中
│ [  ✍️ AI 写作]                 │
│ [  🎨 AI 绘画]                 │
│ [  📈 AI 数据分析]              │
│ [  ⚡ AI 自动化]               │
│ [  🎙️ AI 语音]                │
│ [  🔍 AI 搜索]                 │
│ [  🧑‍🎨 AI 设计]                │
│                                 │
│ AI 推荐: AI Coding, AI 做 PPT   │  ← AI 推荐提示行
│                                 │
│              [取消]  [保存]      │
└─────────────────────────────────┘
```

### 5.4 场景选择项规格

| 属性 | 值 |
|------|---|
| 项容器 | `flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors` |
| 未选中 | `border-gray-200 hover:border-gray-300` |
| 已选中 | `border-primary-400 bg-primary-50` |
| 已选中 + AI推荐 | `border-green-400 bg-green-50`（绿色边框突显 AI 推荐） |
| 勾选标记 | 左侧 `✓` / `○` |
| Emoji + 名称 | `text-sm font-medium text-gray-700` |
| AI 置信度 | `text-[11px] text-gray-400 ml-auto`（仅在 AI 推荐时展示） |

### 5.5 AI 推荐提示行

```
AI 推荐: 🤖 AI Coding · 📊 AI 做 PPT
```

- `text-xs text-gray-400 mt-3`
- 仅当 AI 推荐与当前选择不同时展示
- 点击可快速应用全部 AI 推荐

### 5.6 低置信度标记

在内容列表行中，若某内容的场景关联置信度 < 60%：

```
⚠️ 待确认场景
```

- 行内展示黄色警告 icon + 文字：`inline-flex items-center gap-1 text-[11px] text-amber-500`
- hover 提示 tooltip：「AI 场景推荐置信度较低，建议人工确认」

---

## 6. 场景管理页（管理后台）

### 6.1 页面位置

管理后台新增 Tab：「🏷️ 场景管理」

### 6.2 布局

```
┌──────────────────────────────────────────┐
│ ⚙️ 管理后台                             │
├──────────────────┬───────────────────────┤
│ 📎 手动采集       │ 📊 数据概览           │
│ 🏷️ 场景管理       │ 场景数: 10           │
│ 📡 关注源         │ 未标注内容: 3        │
├──────────────────┴───────────────────────┤
│                                          │
│ 场景列表                        [+ 新增]  │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ 🤖 AI Coding           12 条内容     │ │
│ │ ai-coding                           │ │
│ │ AI 辅助编程、代码生成、IDE 插件       │ │
│ │ 排序: 1              [编辑] [禁用]   │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │ 📊 AI 做 PPT            8 条内容     │ │
│ │ ...                    [编辑] [禁用]  │ │
│ └──────────────────────────────────────┘ │
│                ...                       │
└──────────────────────────────────────────┘
```

### 6.3 场景管理卡片规格

| 属性 | 值 |
|------|---|
| 容器 | `rounded-xl border border-gray-200 bg-white p-4` |
| Emoji | `text-2xl inline mr-2` |
| 名称 | `text-base font-semibold text-gray-900` |
| 内容计数 | `text-xs text-gray-400 ml-2 inline` |
| Slug | `text-[11px] text-gray-400 font-mono` |
| 描述 | `text-sm text-gray-500 mt-1` |
| 操作按钮 | `text-xs mt-2 flex gap-2` |
| 编辑 | `text-gray-500 hover:text-gray-700` |
| 禁用 | `text-amber-500 hover:text-amber-700` |

### 6.4 新增/编辑场景弹窗

```
┌─────────────────────────────────┐
│ 新增场景                        │
│                                 │
│ Emoji                           │
│ [🤖            ] [随机🎲]       │
│                                 │
│ 名称                            │
│ [___________________________]   │
│                                 │
│ Slug (URL标识)                   │
│ [___________________________]   │
│                                 │
│ 描述                            │
│ [___________________________]   │
│                                 │
│ 排序权重                         │
│ [___]  数字越小越靠前            │
│                                 │
│              [取消]  [保存]      │
└─────────────────────────────────┘
```

---

## 7. 状态设计汇总

### 7.1 加载状态

| 场景 | 处理方式 |
|------|---------|
| 首页场景导航 | SSR 渲染，无加载态。计数在 API 返回前显示 `--` |
| 场景详情页 | 骨架屏：标题区 emoji + 文字 pulse，内容卡片列表 skeleton |
| 板块场景筛选 | chip 列表 SSR，选中切换由 URL searchParams 驱动，无额外加载态 |
| 管理后台场景列表 | 骨架卡片 `animate-pulse` |

### 7.2 空状态

| 场景 | 设计 |
|------|------|
| 首页场景导航（无场景） | 隐藏整个区域 |
| 场景详情页（无内容） | 📭 + "该场景下还没有内容" + "采集到的相关内容会自动出现在这里" |
| 板块页场景筛选（无场景） | 隐藏整个筛选器行 |
| 管理后台场景列表（无场景） | 📋 + "暂无场景" + CTA "新增第一个场景" |

### 7.3 错误状态

| 场景 | 设计 |
|------|------|
| 场景详情页加载失败 | `⚠️ 加载失败` + `场景信息暂时无法加载，请稍后重试` + `[重新加载]` 按钮 |
| 场景编辑保存失败 | Toast 提示：红色 `保存失败，请重试` |

---

## 8. 响应式适配总表

| 组件 | 375px (Mobile) | 768px (md) | 1024px+ (lg) |
|------|---------------|------------|--------------|
| 首页场景卡片 | `w-[88px]`，`gap-2`，可见 3.5 个 | `w-[100px]`，`gap-3`，可见 5 个 | 全部展示，无滚动 |
| 场景详情标题 | `text-xl`，`py-6` | `text-2xl`，`py-8` | `max-w-5xl` 居中 |
| 板块筛选 chip | 可见 2-3 个，横向滚动 | 可见 5-6 个 | 全部展示 |
| 场景标签（卡片内） | 最多展示 1 个 | 最多展示 2 个 | 最多展示 3 个 |
| 管理后台编辑弹窗 | 全屏 Bottom Sheet | 居中 Modal `max-w-md` | 居中 Modal `max-w-md` |

---

## 9. Tailwind 组件代码参考

### 9.1 场景卡片

```tsx
// 首页场景导航卡片
<a
  href={`/scenarios/${scenario.slug}`}
  className={cn(
    "flex-shrink-0 w-[100px] rounded-xl border border-gray-200 bg-white p-3 text-center",
    "transition hover:border-primary-300 hover:shadow-sm",
    "focus:outline-none focus:ring-2 focus:ring-primary-200",
    // 选中态
    isActive && "border-primary-500 bg-primary-50 ring-1 ring-primary-200"
  )}
>
  <span className="text-3xl mb-1.5 block">{scenario.icon}</span>
  <span className="text-sm font-medium text-gray-700 leading-tight">
    {scenario.name}
  </span>
  <span className="text-[11px] text-gray-400 mt-0.5 block">
    {scenario.contentCount ?? "--"} 条内容
  </span>
</a>
```

### 9.2 场景标签（内容卡片内）

```tsx
// 内容卡片元数据行中的场景标签
{content.scenarios.map((s) => (
  <a
    key={s.id}
    href={`/scenarios/${s.slug}`}
    className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700 transition-colors hover:bg-primary-100"
  >
    {s.icon} {s.name}
  </a>
))}
```

### 9.3 板块页场景筛选 Chip

```tsx
// 板块页场景筛选器
<div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4 border-b border-gray-100">
  <span className="text-xs text-gray-400 font-medium mr-1 flex-shrink-0">场景:</span>
  <button
    className={cn(
      "flex-shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap",
      isAllSelected
        ? "bg-gray-900 text-white border-gray-900"
        : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
    )}
  >
    全部 {totalCount}
  </button>
  {scenarios.map((s) => (
    <button
      key={s.id}
      disabled={s.count === 0}
      className={cn(
        "flex-shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors whitespace-nowrap",
        s.isSelected
          ? "bg-gray-900 text-white border-gray-900"
          : s.count === 0
            ? "border-gray-100 text-gray-300 cursor-not-allowed"
            : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
      )}
    >
      {s.icon} {s.name}
      <span className="text-[10px] opacity-60">{s.count}</span>
    </button>
  ))}
</div>
```

### 9.4 场景编辑弹窗（管理后台）

```tsx
// 管理后台 — 场景多选面板
<div className="space-y-2">
  {scenarios.map((s) => {
    const isSelected = selectedIds.includes(s.id)
    const isAiRecommended = aiRecommendedIds.includes(s.id)

    return (
      <button
        key={s.id}
        onClick={() => toggleScenario(s.id)}
        className={cn(
          "w-full flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors text-left",
          isSelected && isAiRecommended
            ? "border-green-400 bg-green-50"
            : isSelected
              ? "border-primary-400 bg-primary-50"
              : "border-gray-200 hover:border-gray-300"
        )}
      >
        <span className="text-sm">{isSelected ? "✓" : "○"}</span>
        <span className="text-sm font-medium text-gray-700">
          {s.icon} {s.name}
        </span>
        {isAiRecommended && (
          <span className="text-[11px] text-gray-400 ml-auto">
            置信度 {s.confidence}%
          </span>
        )}
      </button>
    )
  })}
</div>
```

---

## 10. 设计交付清单

| 交付项 | 说明 | 状态 |
|--------|------|------|
| `docs/ui-应用场景.md` | 本文档 | ✅ |
| 首页场景导航区 | 横向滚动卡片 | 待开发 |
| 内容卡片场景标签 | 蓝色系 + emoji | 待开发 |
| 场景详情页 | `/scenarios/[slug]` | 待开发 |
| 板块页场景筛选 | Chip 筛选器 | 待开发 |
| 管理后台场景标注 | 多选面板 + 弹窗 | 待开发 |
| 管理后台场景管理 | 列表 + 新增/编辑 | 待开发 |

**开发者注意：**
- 所有 Tailwind 类名可直接复制使用
- 场景标签的 `bg-primary-50` / `text-primary-700` 是区分场景和普通标签的核心视觉差异
- 横向滚动容器需要 `scrollbar-hide`（需在 globals.css 中添加对应 utility）
- 场景 emoji 渲染注意跨平台一致性（macOS / Windows / iOS / Android）
