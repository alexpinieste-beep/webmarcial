export default function ZoneLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12 rounded-2xl bg-zinc-900 px-8 py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="h-16 w-24 rounded bg-zinc-800" />
            <div className="h-12 w-64 rounded bg-zinc-800" />
            <div className="h-4 w-40 rounded bg-zinc-800" />
          </div>
          <div className="flex flex-col gap-3 lg:w-56">
            <div className="h-12 w-full rounded-lg bg-zinc-800" />
            <div className="h-12 w-full rounded-lg bg-zinc-800" />
          </div>
        </div>
      </div>

      {/* Events */}
      <div className="mb-12 space-y-4">
        <div className="h-7 w-44 rounded bg-zinc-800" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-zinc-900" />
          ))}
        </div>
      </div>

      {/* Gyms */}
      <div className="mb-12 space-y-4">
        <div className="h-7 w-32 rounded bg-zinc-800" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-zinc-900" />
          ))}
        </div>
      </div>
    </div>
  )
}
