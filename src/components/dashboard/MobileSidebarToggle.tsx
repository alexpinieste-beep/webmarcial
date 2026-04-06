'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ExternalLink, LogOut } from 'lucide-react'
import { DashboardNav, type NavItem } from './DashboardNav'

type Props = {
  gymName: string
  gymSlug: string
  planBadge: string
  navItems: NavItem[]
  signOutAction: () => Promise<void>
}

export function MobileSidebarToggle({
  gymName,
  gymSlug,
  planBadge,
  navItems,
  signOutAction,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile header */}
      <header className="flex h-16 items-center justify-between border-b border-[#27272a] px-4 lg:hidden">
        <a href="/" className="flex items-center gap-1 text-lg font-bold tracking-tight">
          <span className="text-[#dc2626]">Web</span>
          <span className="text-white">Marcial</span>
        </a>
        <button
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-[#a1a1aa] hover:bg-[#1c1c1c] hover:text-white"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile drawer backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#27272a] bg-[#111111] transition-transform duration-200 lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex h-16 items-center justify-between border-b border-[#27272a] px-4">
          <a href="/" className="flex items-center gap-1 text-lg font-bold tracking-tight">
            <span className="text-[#dc2626]">Web</span>
            <span className="text-white">Marcial</span>
          </a>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-2 text-[#a1a1aa] hover:bg-[#1c1c1c] hover:text-white"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Gym info */}
        <div className="border-b border-[#27272a] px-4 py-4">
          <p className="truncate text-sm font-semibold text-white">{gymName}</p>
          <span className="mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide bg-[#27272a] text-[#a1a1aa]">
            {planBadge}
          </span>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-4" onClick={() => setOpen(false)}>
          <DashboardNav items={navItems} />
        </div>

        {/* Footer */}
        <div className="border-t border-[#27272a] px-4 py-4 space-y-2">
          <Link
            href={`/gimnasios/${gymSlug}`}
            className="flex items-center gap-2 text-xs text-[#71717a] hover:text-white transition-colors"
            onClick={() => setOpen(false)}
          >
            <ExternalLink size={14} />
            Ver perfil público
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 text-xs text-[#71717a] hover:text-[#dc2626] transition-colors"
            >
              <LogOut size={14} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
