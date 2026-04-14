export default function RankingsLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-[#09090b]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="h-9 w-64 rounded bg-zinc-800" />
          <div className="mt-2 h-4 w-96 rounded bg-zinc-800" />
        </div>

        {/* Sport tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-24 rounded-full bg-zinc-800" />
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 h-20 rounded-lg bg-zinc-900" />

        {/* Table rows */}
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-zinc-900" />
          ))}
        </div>
      </div>
    </div>
  )
}
