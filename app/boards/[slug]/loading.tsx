/**
 * 板块详情页 — 加载状态
 */

export default function BoardLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 animate-pulse">
      {/* 返回链接骨架 */}
      <div className="h-4 w-20 bg-gray-200 rounded mb-6" />

      {/* 标题骨架 */}
      <div className="mb-6 pb-4 border-b border-gray-200 space-y-2">
        <div className="h-7 w-32 bg-gray-200 rounded" />
        <div className="h-5 w-48 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-100 rounded" />
      </div>

      {/* 筛选栏骨架 */}
      <div className="flex items-center gap-2 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-6 w-16 bg-gray-100 rounded-full" />
        ))}
      </div>
      <div className="flex items-center gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-6 w-20 bg-gray-100 rounded-full" />
        ))}
      </div>

      {/* 内容卡片骨架 */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 p-5 space-y-3">
            <div className="h-5 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-100 rounded" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-gray-100 rounded-full" />
              <div className="h-5 w-20 bg-gray-100 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
