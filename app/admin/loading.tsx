export default function AdminLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 animate-pulse">
        <div className="h-8 w-40 rounded bg-gray-200" />
        <div className="mt-1 h-5 w-56 rounded bg-gray-100" />
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="animate-pulse rounded-lg border border-gray-200 p-4">
          <div className="h-5 w-24 rounded bg-gray-200" />
        </div>
        <div className="animate-pulse rounded-lg border border-gray-200 p-4">
          <div className="h-5 w-24 rounded bg-gray-200" />
        </div>
      </div>
    </main>
  )
}
