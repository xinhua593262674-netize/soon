/**
 * 管理后台 — 手动采集 & 内容审核
 *
 * 纯个人使用，无需登录。
 * 功能:
 *   1. 手动粘贴链接 → 自动提取摘要+评分 → 入库
 *   2. 审核队列: 查看待审核内容 → 一键发布/丢弃
 */

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const pendingContents = await db.content.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      source: true,
      board: true,
      evaluations: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  })

  const recentPublished = await db.content.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 20,
    include: { source: true, board: true },
  })

  const sources = await db.source.findMany({
    include: { board: true },
    orderBy: { createdAt: "desc" },
  })

  const boards = await db.board.findMany({ orderBy: { order: "asc" } })

  const scenarios = await db.scenario.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      _count: { select: { contents: true } },
    },
  })

  // 获取待审核内容的场景关联
  const pendingContentScenarios = await db.contentScenario.findMany({
    where: { content: { status: "PENDING" } },
    include: { scenario: true },
  })

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">⚙️ 管理后台</h1>
        <p className="mt-1 text-sm text-gray-500">手动采集 & 内容审核</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 左侧: 手动采集 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-800">📎 手动采集</h2>
          <ManualCollectForm boards={boards} />
        </section>

        {/* 右侧: 数据概览 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-800">📊 数据概览</h2>
          <div className="rounded-lg border border-gray-200 p-4">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">关注源</dt>
                <dd className="text-xl font-semibold">{sources.length}</dd>
              </div>
              <div>
                <dt className="text-gray-500">内容总量</dt>
                <dd className="text-xl font-semibold">{recentPublished.length}</dd>
              </div>
              <div>
                <dt className="text-gray-500">待审核</dt>
                <dd className="text-xl font-semibold text-amber-600">
                  {pendingContents.length}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">板块数</dt>
                <dd className="text-xl font-semibold">{boards.length}</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>

      {/* 审核队列 */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          🔍 待审核 ({pendingContents.length})
        </h2>
        {pendingContents.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
            暂无待审核内容
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {pendingContents.map((content) => {
              const latestEval = content.evaluations[0]
              return (
                <li
                  key={content.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {content.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {content.source.name} · {content.board.name} ·{" "}
                      {latestEval ? `评分 ${latestEval.finalScore}` : "未评测"}
                    </p>
                    {/* 已关联场景 */}
                    {pendingContentScenarios
                      .filter((cs) => cs.contentId === content.id)
                      .length > 0 && (
                      <p className="mt-1 text-[11px] text-gray-400">
                        场景:{" "}
                        {pendingContentScenarios
                          .filter((cs) => cs.contentId === content.id)
                          .map((cs) => `${cs.scenario.icon} ${cs.scenario.name}`)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <form
                      action={async () => {
                        "use server"
                        await db.content.update({
                          where: { id: content.id },
                          data: { status: "PUBLISHED" },
                        })
                      }}
                    >
                      <button className="rounded bg-green-500 px-3 py-1 text-xs font-medium text-white hover:bg-green-600">
                        发布
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server"
                        await db.content.update({
                          where: { id: content.id },
                          data: { status: "REJECTED" },
                        })
                      }}
                    >
                      <button className="rounded bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-300">
                        丢弃
                      </button>
                    </form>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* 关注源管理 */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          📡 关注源 ({sources.length})
        </h2>
        {sources.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
            暂无关注源，请在下方添加种子博主
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {sources.map((src) => (
              <li key={src.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-sm">{platformIcon(src.platform)}</span>
                <span className="text-sm font-medium text-gray-900">{src.name}</span>
                <span className="text-xs text-gray-400">{src.board.name}</span>
                {src.isSeed && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-700">
                    种子
                  </span>
                )}
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs text-gray-300 hover:text-gray-500"
                >
                  打开 →
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* 添加种子博主 */}
        <AddSourceForm boards={boards} />
      </section>

      {/* ─── 场景管理 ─── */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          🏷️ 场景管理 ({scenarios.length})
        </h2>

        {/* 场景列表 */}
        <div className="space-y-3 mb-6">
          {scenarios.map((sc) => (
            <div
              key={sc.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{sc.icon}</span>
                <div>
                  <span className="text-sm font-medium text-gray-900">{sc.name}</span>
                  <span className="ml-2 text-xs text-gray-400">{sc._count.contents} 条</span>
                  {sc.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{sc.description}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <form
                  action={async () => {
                    "use server"
                    await db.scenario.update({
                      where: { id: sc.id },
                      data: { isActive: !sc.isActive },
                    })
                  }}
                >
                  <button className="text-xs text-amber-500 hover:text-amber-700 transition-colors">
                    {sc.isActive ? "禁用" : "启用"}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        {/* 新增场景 */}
        <AddScenarioForm />
      </section>

      {/* ─── 场景标注 ─── */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          🏷️ 场景标注
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          为已发布内容标注应用场景。选择内容 → 勾选场景 → 保存。
        </p>
        <ScenarioAssignForm
          scenarios={scenarios.map((s) => ({
            id: s.id,
            icon: s.icon,
            name: s.name,
          }))}
        />
      </section>
    </main>
  )
}

// ============================================================
// 手动采集表单 (Client Component)
// ============================================================
function ManualCollectForm({
  boards,
}: {
  boards: { id: string; name: string; slug: string }[]
}) {
  return (
    <form
      className="rounded-lg border border-gray-200 p-4"
      action={async (formData: FormData) => {
        "use server"
        const url = formData.get("url") as string
        const boardId = formData.get("boardId") as string
        if (!url || !boardId) return

        // 简单版: 创建一个 PENDING 内容，等待评测
        await db.content.create({
          data: {
            title: url.slice(0, 100),
            url,
            summary: "手动采集 — 待评测",
            contentType: "ARTICLE",
            publishedAt: new Date(),
            status: "PENDING",
            sourceId: (await db.source.findFirst({ where: { boardId } }))?.id ?? "",
            boardId,
          },
        })
      }}
    >
      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            粘贴链接
          </label>
          <input
            type="url"
            name="url"
            placeholder="https://github.com/... 或 https://www.youtube.com/..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            目标板块
          </label>
          <select
            name="boardId"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            required
          >
            <option value="">选择板块...</option>
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        className="mt-3 w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
      >
        采集入库
      </button>
    </form>
  )
}

// ============================================================
// 添加种子博主表单
// ============================================================
function AddSourceForm({
  boards,
}: {
  boards: { id: string; name: string }[]
}) {
  return (
    <form
      className="mt-4 rounded-lg border border-dashed border-gray-200 p-4"
      action={async (formData: FormData) => {
        "use server"
        const name = formData.get("name") as string
        const platform = formData.get("platform") as string
        const url = formData.get("url") as string
        const boardId = formData.get("boardId") as string
        if (!name || !platform || !url || !boardId) return

        await db.source.upsert({
          where: { platform_url: { platform: platform as any, url } },
          update: { name, isSeed: true },
          create: {
            name,
            platform: platform as any,
            url,
            boardId,
            isSeed: true,
          },
        })
      }}
    >
      <p className="mb-3 text-xs font-medium text-gray-500">添加种子博主/UP主</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          name="name"
          placeholder="博主名称"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          required
        />
        <select
          name="platform"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          required
        >
          <option value="">平台</option>
          <option value="YOUTUBE">YouTube</option>
          <option value="BILIBILI">B站</option>
          <option value="GITHUB">GitHub</option>
        </select>
        <input
          type="url"
          name="url"
          placeholder="主页 / 频道 URL"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2 focus:border-primary-500 focus:outline-none"
          required
        />
        <select
          name="boardId"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          required
        >
          <option value="">归属板块</option>
          {boards.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          添加种子博主
        </button>
      </div>
    </form>
  )
}

// ============================================================
// 新增场景表单
// ============================================================
function AddScenarioForm() {
  return (
    <form
      className="mt-4 rounded-lg border border-dashed border-gray-200 p-4"
      action={async (formData: FormData) => {
        "use server"
        const name = formData.get("name") as string
        const slug = formData.get("slug") as string
        const icon = (formData.get("icon") as string) || "📌"
        const description = formData.get("description") as string
        const order = Number(formData.get("order")) || 99
        if (!name || !slug) return

        await db.scenario.upsert({
          where: { slug },
          update: { name, icon, description, order },
          create: { name, slug, icon, description, order },
        })
      }}
    >
      <p className="mb-3 text-xs font-medium text-gray-500">新增应用场景</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          type="text"
          name="icon"
          placeholder="Emoji (如 🤖)"
          maxLength={4}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        />
        <input
          type="text"
          name="name"
          placeholder="场景名称"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          required
        />
        <input
          type="text"
          name="slug"
          placeholder="slug (如 ai-coding)"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          required
        />
        <input
          type="text"
          name="description"
          placeholder="描述（可选）"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2 focus:border-primary-500 focus:outline-none"
        />
        <input
          type="number"
          name="order"
          placeholder="排序"
          defaultValue={99}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
      >
        新增场景
      </button>
    </form>
  )
}

// ============================================================
// 场景标注表单 (Client Component)
// ============================================================
function ScenarioAssignForm({
  scenarios,
}: {
  scenarios: { id: string; icon: string; name: string }[]
}) {
  return (
    <form
      className="rounded-lg border border-gray-200 p-4"
      action={async (formData: FormData) => {
        "use server"
        const contentId = formData.get("contentId") as string
        const scenarioIds = formData.getAll("scenarioIds") as string[]
        if (!contentId) return

        // 先删后建
        await db.contentScenario.deleteMany({ where: { contentId } })
        if (scenarioIds.length > 0) {
          await db.contentScenario.createMany({
            data: scenarioIds.map((sid) => ({
              contentId,
              scenarioId: sid,
              isManual: true,
            })),
          })
        }
        revalidatePath("/admin")
      }}
    >
      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            内容 ID
          </label>
          <input
            type="text"
            name="contentId"
            placeholder="输入内容的 CUID"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            应用场景（多选）
          </label>
          <div className="flex flex-wrap gap-2">
            {scenarios.map((s) => (
              <label
                key={s.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs cursor-pointer hover:border-gray-300 transition-colors has-[:checked]:border-primary-400 has-[:checked]:bg-primary-50"
              >
                <input
                  type="checkbox"
                  name="scenarioIds"
                  value={s.id}
                  className="accent-primary-600"
                />
                {s.icon} {s.name}
              </label>
            ))}
          </div>
        </div>
      </div>
      <button
        type="submit"
        className="mt-3 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
      >
        保存场景标注
      </button>
    </form>
  )
}

// ============================================================
// 辅助函数
// ============================================================
function platformIcon(platform: string): string {
  const map: Record<string, string> = {
    YOUTUBE: "▶️",
    BILIBILI: "📺",
    GITHUB: "📦",
  }
  return map[platform] ?? "🔗"
}
