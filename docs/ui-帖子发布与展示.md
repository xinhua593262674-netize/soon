# UI 设计 - 帖子发布与展示

**角色**：UI 设计师（ui）

## 设计目标

为“帖子发布与展示”功能提供简单、清晰、移动优先的界面方案，使用户能快速发帖、浏览内容、参与互动。

## 设计原则

- 保持页面清爽、留白充足
- 交互按钮明确、可触控
- 重要信息优先展示（标题、板块、作者、点赞、评论）
- 加载/空状态要有友好提示

## 页面结构

### 1. 首页（探索）

```
┌────────────────────────────────────┐
│ Header: 假装社区 | 登录 | 发帖       │
├────────────────────────────────────┤
│ 版块入口卡片（AI资讯 / AI教程）      │
├────────────────────────────────────┤
│ 1. 推荐帖子卡片                      │
│ 2. 推荐帖子卡片                      │
│ 3. 推荐帖子卡片                      │
└────────────────────────────────────┘
```

### 2. 帖子列表卡片

```
┌────────────────────────────────────┐
│ [板块标签] 帖子标题                  │
│ 帖子摘要内容，最长两行文字...        │
│ 作者 · 3小时前 · 12 评论 · 34 ❤️    │
└────────────────────────────────────┘
```

### 3. 发帖页面

```
┌────────────────────────────────────┐
│ 标题 input                          │
│ 板块选择 dropdown                   │
│ 标签输入 / 说明                     │
│ 正文 textarea                       │
│ 发布按钮                            │
└────────────────────────────────────┘
```

### 4. 帖子详情页

```
┌────────────────────────────────────┐
│ [板块] 帖子标题                      │
│ 作者  • 发布于 1 小时前              │
│ 正文内容                            │
│ ❤️ 12   💬 5                        │
│ ────────────────────────────────── │
│ 评论列表                            │
│ [输入评论] [发送]                   │
└────────────────────────────────────┘
```

## 关键组件

### 帖子卡片
- `className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
- 标题：`text-lg font-semibold text-gray-900`
- 摘要：`mt-2 text-sm text-gray-600 line-clamp-2`
- 标签：`inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500`

### 按钮
- 主按钮：`rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors duration-200`
- 次按钮：`rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50`

### 输入框
- `className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"

### 评论区
- 评论卡片：`rounded-2xl border border-gray-100 bg-gray-50 p-4`
- 作者行：`flex items-center gap-2 text-xs text-gray-500`
- 内容：`mt-2 text-sm text-gray-700`

## 响应式建议

- Mobile First：基础布局适配 375px 宽度。
- 小屏幕：`p-4`、`gap-4`，按钮 `w-full`。
- 640px 以上：列表卡片横向增加 `space-y-5`，页面主内容 `max-w-3xl mx-auto`。
- 1024px 以上：首页可增加侧边板块导航 / 热门标签栏。

## 状态设计

### 加载状态
- 帖子列表：卡片骨架 `animate-pulse`，灰色块占位标题与摘要。
- 帖子详情：头像/标题/正文占位条。

### 空状态
- 列表无帖子：`暂无帖子，试试发布你的第一篇内容` + `发帖` CTA。
- 评论为空：`还没有评论，快来抢沙发！`

### 错误状态
- 数据加载失败：`加载失败了，请刷新重试` + `重新加载` 按钮。
- 发布失败：`发布失败，请检查网络后重试`。

## 设计交付说明

1. 设计师输出 `docs/ui-帖子发布与展示.md`。
2. 交付应包括页面线框、关键组件、交互行为、响应式规则。
3. 开发者可直接复用 Tailwind 类名示例。
4. 若需要新的组件，补充 `docs/ui-components.md`。
