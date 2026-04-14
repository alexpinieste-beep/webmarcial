export default function GymLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-8 rounded-2xl bg-zinc-900 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
          <div className="flex-1 space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-24 rounded-full bg-zinc-800" />
              <div className="h-6 w-20 rounded-full bg-zinc-800" />
            </div>
            <div className="h-10 w-72 rounded bg-zinc-800" />
            <div className="h-4 w-48 rounded bg-zinc-800" />
            <div className="h-4 w-40 rounded bg-zinc-800" />
          </div>
          <div className="h-48 w-full rounded-xl bg-zinc-800 lg:w-72" />
        </div>
      </div>

      {/* Description */}
      <div className="mb-8 rounded-xl bg-zinc-900 p-7">
        <div className="mb-3 h-6 w-40 rounded bg-zinc-800" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-zinc-800" />
          <div className="h-4 w-5/6 rounded bg-zinc-800" />
          <div className="h-4 w-4/6 rounded bg-zinc-800" />
        </div>
      </div>

      {/* Fighters */}
      <div className="mb-8 space-y-4">
        <div className="h-7 w-48 rounded bg-zinc-800" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-zinc-900" />
          ))}
        </div>
      </div>
    </div>
  )
}
