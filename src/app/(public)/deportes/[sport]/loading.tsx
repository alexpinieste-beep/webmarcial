export default function SportLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-10 rounded-2xl bg-zinc-900 p-8">
        <div className="h-4 w-24 rounded bg-zinc-800 mb-3" />
        <div className="h-12 w-72 rounded bg-zinc-800" />
        <div className="mt-3 h-4 w-96 rounded bg-zinc-800" />
        <div className="mt-6 flex gap-3">
          <div className="h-10 w-32 rounded-lg bg-zinc-800" />
          <div className="h-10 w-32 rounded-lg bg-zinc-800" />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-zinc-900" />
        ))}
      </div>

      {/* Events + Rankings */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="h-7 w-40 rounded bg-zinc-800" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-zinc-900" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-7 w-40 rounded bg-zinc-800" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-zinc-900" />
          ))}
        </div>
      </div>
    </div>
  )
}
