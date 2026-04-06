export default function GymDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-[#262626] bg-[#111111] lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-[#262626] px-6">
          <a href="/" className="flex items-center gap-1 text-lg font-bold tracking-tight">
            <span className="text-[#dc2626]">Web</span>
            <span className="text-white">Marcial</span>
          </a>
        </div>
        <nav className="flex-1 px-4 py-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Panel del gimnasio
          </p>
          {/* Sidebar nav items — próximamente */}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center border-b border-[#262626] px-6 lg:hidden">
          <a href="/" className="flex items-center gap-1 text-lg font-bold tracking-tight">
            <span className="text-[#dc2626]">Web</span>
            <span className="text-white">Marcial</span>
          </a>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
