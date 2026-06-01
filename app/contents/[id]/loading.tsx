export default function ContentDetailLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 animate-pulse">
      <div className="h-4 w-20 bg-gray-200 rounded mb-6" />
      <div className="flex items-center gap-3 mb-2">
        <div className="h-5 w-12 bg-gray-200 rounded" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
      <div className="h-7 w-3/4 bg-gray-300 rounded mb-6" />
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-6 space-y-2">
        <div className="h-5 w-48 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
      <hr className="border-gray-100 mb-6" />
      <div className="h-4 w-16 bg-gray-200 rounded mb-2" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
      </div>
    </main>
  )
}
