export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-10 animate-pulse">
        <div className="h-9 w-48 rounded bg-gray-200" />
        <div className="mt-2 h-5 w-64 rounded bg-gray-100" />
      </header>
      {[1, 2].map((section) => (
        <section key={section} className="mb-12">
          <div className="mb-4 flex items-baseline justify-between border-b border-gray-200 pb-3">
            <div className="h-6 w-24 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-100" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((card) => (
              <div
                key={card}
                className="animate-pulse rounded-xl border border-gray-200 bg-white p-5"
              >
                <div className="h-5 w-3/4 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-full rounded bg-gray-100" />
                <div className="mt-2 h-4 w-2/3 rounded bg-gray-100" />
                <div className="mt-3 flex gap-3">
                  <div className="h-3 w-16 rounded bg-gray-100" />
                  <div className="h-3 w-12 rounded bg-gray-100" />
                  <div className="h-3 w-20 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
