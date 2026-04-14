export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <section className="bg-[#0a0a0a] py-28 sm:py-36">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-4 h-4 w-48 rounded bg-zinc-800" />
          <div className="mx-auto h-12 w-3/4 rounded bg-zinc-800 sm:h-16" />
          <div className="mx-auto mt-4 h-12 w-1/2 rounded bg-zinc-800 sm:h-16" />
          <div className="mx-auto mt-6 h-6 w-2/3 rounded bg-zinc-800" />
          <div className="mt-10 flex justify-center gap-4">
            <div className="h-12 w-36 rounded-lg bg-zinc-800" />
            <div className="h-12 w-36 rounded-lg bg-zinc-800" />
          </div>
        </div>
      </section>

      {/* Sports grid skeleton */}
      <section className="bg-[#0a0a0a] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 h-8 w-48 rounded bg-zinc-800" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-zinc-900" />
            ))}
          </div>
        </div>
      </section>

      {/* Events skeleton */}
      <section className="bg-[#111] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 h-8 w-48 rounded bg-zinc-800" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-zinc-900" />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
