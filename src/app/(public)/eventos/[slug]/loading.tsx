export default function EventLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-8 rounded-2xl bg-zinc-900 p-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="h-64 w-full rounded-xl bg-zinc-800 lg:w-64 lg:shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="h-5 w-32 rounded bg-zinc-800" />
            <div className="h-10 w-3/4 rounded bg-zinc-800" />
            <div className="h-4 w-48 rounded bg-zinc-800" />
            <div className="h-4 w-56 rounded bg-zinc-800" />
            <div className="h-10 w-36 rounded-lg bg-zinc-800" />
          </div>
        </div>
      </div>

      {/* Fight card */}
      <div className="mb-8 space-y-3">
        <div className="h-7 w-40 rounded bg-zinc-800" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-zinc-900" />
        ))}
      </div>
    </div>
  )
}
