'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const deportes = [
  { label: 'Muay Thai', href: '/deportes/muay-thai' },
  { label: 'Kickboxing', href: '/deportes/kickboxing' },
  { label: 'K1', href: '/deportes/k1' },
  { label: 'MMA', href: '/deportes/mma' },
  { label: 'Boxeo', href: '/deportes/boxeo' },
  { label: 'Jiu-Jitsu', href: '/deportes/jiu-jitsu' },
]

const navLinks = [
  { label: 'Rankings', href: '/rankings' },
  { label: 'Eventos', href: '/eventos' },
  { label: 'Gimnasios', href: '/gimnasios' },
  { label: 'Zonas', href: '/zonas' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [deportesOpen, setDeportesOpen] = useState(false)
  const [mobileDeportesOpen, setMobileDeportesOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#262626] bg-[#0a0a0a]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight"
          onClick={() => setMobileOpen(false)}
        >
          <span className="text-[#dc2626]">Web</span>
          <span className="text-white">Marcial</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {/* Deportes dropdown */}
          <div className="relative">
            <button
              className={cn(
                'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-[#1a1a1a] hover:text-white',
                deportesOpen && 'bg-[#1a1a1a] text-white'
              )}
              onMouseEnter={() => setDeportesOpen(true)}
              onMouseLeave={() => setDeportesOpen(false)}
              onClick={() => setDeportesOpen((v) => !v)}
              aria-expanded={deportesOpen}
            >
              Deportes
              <ChevronDown
                size={14}
                className={cn(
                  'transition-transform duration-200',
                  deportesOpen && 'rotate-180'
                )}
              />
            </button>

            {deportesOpen && (
              <div
                className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-[#262626] bg-[#111111] py-1 shadow-xl shadow-black/50"
                onMouseEnter={() => setDeportesOpen(true)}
                onMouseLeave={() => setDeportesOpen(false)}
              >
                {deportes.map((deporte) => (
                  <Link
                    key={deporte.href}
                    href={deporte.href}
                    className="block px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-[#1a1a1a] hover:text-white"
                    onClick={() => setDeportesOpen(false)}
                  >
                    {deporte.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Regular nav links */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-[#1a1a1a] hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-md bg-[#dc2626] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c]"
          >
            Mi gimnasio
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex items-center justify-center rounded-md p-2 text-gray-400 transition-colors hover:bg-[#1a1a1a] hover:text-white lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[#262626] bg-[#0a0a0a] lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            {/* Deportes accordion */}
            <div>
              <button
                className="flex w-full items-center justify-between rounded-md px-3 py-3 text-sm font-medium text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
                onClick={() => setMobileDeportesOpen((v) => !v)}
              >
                Deportes
                <ChevronDown
                  size={14}
                  className={cn(
                    'transition-transform duration-200',
                    mobileDeportesOpen && 'rotate-180'
                  )}
                />
              </button>
              {mobileDeportesOpen && (
                <div className="ml-3 border-l border-[#262626] pl-3">
                  {deportes.map((deporte) => (
                    <Link
                      key={deporte.href}
                      href={deporte.href}
                      className="block rounded-md px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-[#1a1a1a] hover:text-white"
                      onClick={() => setMobileOpen(false)}
                    >
                      {deporte.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Regular links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md px-3 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-[#1a1a1a] hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile CTAs */}
            <div className="mt-4 flex flex-col gap-2 border-t border-[#262626] pt-4">
              <Link
                href="/login"
                className="block rounded-md px-3 py-2.5 text-center text-sm font-medium text-gray-300 ring-1 ring-[#262626] transition-colors hover:bg-[#1a1a1a] hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="block rounded-md bg-[#dc2626] px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c]"
                onClick={() => setMobileOpen(false)}
              >
                Mi gimnasio
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
