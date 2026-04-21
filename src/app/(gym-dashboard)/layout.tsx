import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquare,
  CreditCard,
  ExternalLink,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav, type NavItem } from '@/components/dashboard/DashboardNav'
import { MobileSidebarToggle } from '@/components/dashboard/MobileSidebarToggle'

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
}

const PLAN_BADGE_STYLES: Record<string, string> = {
  free: 'bg-[#27272a] text-[#a1a1aa]',
  basic: 'bg-[#1d3557] text-[#90c2ff]',
  pro: 'bg-[#3b1a1a] text-[#fca5a5]',
}

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function GymDashboardLayout({
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

  const [{ data: gym }, { data: profile }] = await Promise.all([
    supabase.from('gyms').select('*, zones(*)').eq('owner_id', user.id).single(),
    supabase.from('profiles').select('role').eq('id', user.id).single(),
  ])

  if (!gym) {
    if (profile?.role === 'admin') redirect('/admin')
    redirect('/registro-gimnasio')
  }

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      label: 'Resumen',
      icon: <LayoutDashboard size={18} />,
    },
    {
      href: '/dashboard/perfil',
      label: 'Mi Perfil',
      icon: <Building2 size={18} />,
    },
    {
      href: '/dashboard/luchadores',
      label: 'Luchadores',
      icon: <Users size={18} />,
    },
    {
      href: '/dashboard/leads',
      label: 'Leads',
      icon: <MessageSquare size={18} />,
    },
    {
      href: '/dashboard/suscripcion',
      label: 'Suscripción',
      icon: <CreditCard size={18} />,
    },
  ]

  const planLabel = PLAN_LABELS[gym.subscription_tier] ?? gym.subscription_tier
  const planBadgeStyle =
    PLAN_BADGE_STYLES[gym.subscription_tier] ?? PLAN_BADGE_STYLES.free

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-[#27272a] bg-[#111111] lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-[#27272a] px-6">
          <a
            href="/"
            className="flex items-center gap-1 text-lg font-bold tracking-tight"
          >
            <span className="text-[#dc2626]">Web</span>
            <span className="text-white">Marcial</span>
          </a>
        </div>

        {/* Gym info */}
        <div className="border-b border-[#27272a] px-5 py-4">
          <p className="truncate text-sm font-semibold text-white" title={gym.name}>
            {gym.name}
          </p>
          <span
            className={`mt-1.5 inline-block rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${planBadgeStyle}`}
          >
            {planLabel}
          </span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-[#52525b]">
            Panel del gimnasio
          </p>
          <DashboardNav items={navItems} />
        </div>

        {/* Sidebar footer */}
        <div className="border-t border-[#27272a] px-5 py-4 space-y-3">
          <Link
            href={`/gimnasios/${gym.slug}`}
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

      {/* Right side: mobile header + main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile header + drawer — renders nothing on lg+ */}
        <MobileSidebarToggle
          gymName={gym.name}
          gymSlug={gym.slug}
          planBadge={planLabel}
          navItems={navItems}
          signOutAction={signOut}
        />

        {/* Main content */}
        <main className="flex-1 p-5 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
