export default function FighterLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-8 rounded-2xl bg-zinc-900 p-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="mx-auto h-36 w-36 shrink-0 rounded-full bg-zinc-800 sm:mx-0" />
          {/* Info */}
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="flex justify-center gap-2 sm:justify-start">
              <div className="h-5 w-24 rounded-full bg-zinc-800" />
            </div>
            <div className="h-9 w-64 rounded bg-zinc-800" />
            <div className="h-4 w-20 rounded bg-zinc-800" />
            <div className="h-4 w-40 rounded bg-zinc-800" />
            <div className="h-16 w-full rounded bg-zinc-800" />
          </div>
        </div>
      </div>

      {/* Record */}
      <div className="mb-8">
        <div className="mb-4 h-7 w-36 rounded bg-zinc-800" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-zinc-900" />
          ))}
        </div>
      </div>

      {/* Sport profiles */}
      <div className="mb-8">
        <div className="mb-4 h-7 w-48 rounded bg-zinc-800" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-zinc-900" />
          ))}
        </div>
      </div>
    </div>
  )
}
