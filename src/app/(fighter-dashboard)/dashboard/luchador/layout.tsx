import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, BarChart2, Trophy, LogOut, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav, type NavItem } from '@/components/dashboard/DashboardNav'
import { MobileSidebarToggle } from '@/components/dashboard/MobileSidebarToggle'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function FighterDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: fighter } = await supabase
    .from('fighters')
    .select('id, name, slug, level, is_verified')
    .eq('owner_id', user.id)
    .single()

  if (!fighter) {
    redirect('/registro-luchador')
  }

  const navItems: NavItem[] = [
    {
      href: '/dashboard/luchador/perfil',
      label: 'Mi Perfil',
      icon: <User size={18} />,
    },
    {
      href: '/dashboard/luchador/estadisticas',
      label: 'Estadísticas',
      icon: <BarChart2 size={18} />,
    },
    {
      href: '/dashboard/luchador/titulos',
      label: 'Títulos',
      icon: <Trophy size={18} />,
    },
  ]

  const levelLabel = fighter.level === 'professional' ? 'Profesional' : 'Amateur'
  const levelStyle =
    fighter.level === 'professional'
      ? 'bg-[#3b1a1a] text-[#fca5a5]'
      : 'bg-[#1a2a1a] text-[#86efac]'

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-[#27272a] bg-[#111111] lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-[#27272a] px-6">
          <a href="/" className="flex items-center gap-1 text-lg font-bold tracking-tight">
            <span className="text-[#dc2626]">Web</span>
            <span className="text-white">Marcial</span>
          </a>
        </div>

        {/* Fighter info */}
        <div className="border-b border-[#27272a] px-5 py-4">
          <p className="truncate text-sm font-semibold text-white" title={fighter.name}>
            {fighter.name}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className={`inline-block rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${levelStyle}`}
            >
              {levelLabel}
            </span>
            {fighter.is_verified && (
              <span className="text-xs text-[#52525b]">✓ Verificado</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-[#52525b]">
            Panel del luchador
          </p>
          <DashboardNav items={navItems} />
        </div>

        {/* Footer */}
        <div className="space-y-3 border-t border-[#27272a] px-5 py-4">
          <Link
            href={`/luchadores/${fighter.slug}`}
            className="flex items-center gap-2 text-xs text-[#71717a] transition-colors hover:text-white"
          >
            <ExternalLink size={14} />
            Ver perfil público
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 text-xs text-[#71717a] transition-colors hover:text-[#dc2626]"
            >
              <LogOut size={14} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Right side */}
      <div className="flex flex-1 flex-col min-w-0">
        <MobileSidebarToggle
          gymName={fighter.name}
          gymSlug={`/luchadores/${fighter.slug}`}
          planBadge={levelLabel}
          navItems={navItems}
          signOutAction={signOut}
        />
        <main className="flex-1 p-5 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
