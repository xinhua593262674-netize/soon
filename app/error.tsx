"use client"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-20 text-center">
      <p className="text-5xl">⚠️</p>
      <h2 className="mt-4 text-xl font-semibold text-gray-900">
        加载失败了
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        {error.message || "请检查网络后重试"}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
      >
        重新加载
      </button>
    </main>
  )
}
