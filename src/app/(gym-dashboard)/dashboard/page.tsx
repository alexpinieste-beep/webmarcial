import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  MessageSquare,
  CreditCard,
  CircleCheck,
  Building2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getFightersByGym } from '@/lib/queries/fighters'
import { StatCard } from '@/components/dashboard/StatCard'

function calcProfileCompleteness(gym: {
  description: string | null
  address: string | null
  phone: string | null
  instagram: string | null
  zone_id: string | null
  email: string | null
}): number {
  const fields = [
    gym.description,
    gym.address,
    gym.phone,
    gym.instagram,
    gym.zone_id,
    gym.email,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: gym } = await supabase
    .from('gyms')
    .select('*, zones(*)')
    .eq('owner_id', user.id)
    .single()

  if (!gym) {
    redirect('/registro-gimnasio')
  }

  // Parallel data fetching
  const [fighters, leadsResult, newLeadsResult] = await Promise.all([
    getFightersByGym(gym.id),
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('gym_id', gym.id),
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('gym_id', gym.id)
      .eq('status', 'new')
      .gte(
        'created_at',
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      ),
  ])

  const totalLeads = leadsResult.count ?? 0
  const newLeads = newLeadsResult.count ?? 0
  const completeness = calcProfileCompleteness(gym)
  const profileComplete = completeness === 100

  const planLabel =
    gym.subscription_tier === 'free'
      ? 'Gratuito'
      : gym.subscription_tier === 'basic'
      ? 'Basic'
      : 'Pro'

  const planSubtitle = gym.subscription_expires_at
    ? `Expira el ${new Date(gym.subscription_expires_at).toLocaleDateString('es-ES')}`
    : gym.subscription_tier === 'free'
    ? 'Sin fecha de expiración'
    : 'Activo'

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Bienvenido, {gym.name}
          </h1>
          <p className="mt-1 text-sm text-[#71717a]">
            Gestiona tu gimnasio y perfil en WebMarcial.
          </p>
        </div>
        {gym.is_verified ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#14532d]/40 px-3 py-1 text-xs font-medium text-[#4ade80]">
            <ShieldCheck size={14} />
            Verificado
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#422006]/40 px-3 py-1 text-xs font-medium text-[#fb923c]">
            Pendiente de verificación
          </span>
        )}
      </div>

      {/* Verification banner */}
      {!gym.is_verified && (
        <div className="rounded-lg border border-[#854d0e] bg-[#422006]/30 px-5 py-4">
          <p className="text-sm font-medium text-[#fbbf24]">
            Perfil pendiente de verificación
          </p>
          <p className="mt-1 text-sm text-[#a16207]">
            Tu perfil está pendiente de verificación por el equipo de WebMarcial.
            Te notificaremos por email cuando sea revisado.
          </p>
        </div>
      )}

      {/* Stats grid */}
      <div>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#52525b]">
          Resumen
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Luchadores registrados"
            value={fighters.length}
            subtitle={
              fighters.length === 1 ? '1 luchador' : `${fighters.length} en tu gimnasio`
            }
            icon={<Users size={18} />}
          />
          <StatCard
            title="Leads recibidos"
            value={totalLeads}
            subtitle={`${newLeads} nuevos este mes`}
            icon={<MessageSquare size={18} />}
          />
          <StatCard
            title="Plan actual"
            value={planLabel}
            subtitle={planSubtitle}
            icon={<CreditCard size={18} />}
            accent={gym.subscription_tier === 'pro'}
          />
          <StatCard
            title="Perfil completado"
            value={`${completeness}%`}
            subtitle={
              profileComplete
                ? 'Perfil completo'
                : `Faltan ${6 - Math.round((completeness / 100) * 6)} campos`
            }
            icon={<CircleCheck size={18} />}
            accent={profileComplete}
          />
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#52525b]">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {!profileComplete && (
            <Link
              href="/dashboard/perfil"
              className="group flex items-center justify-between rounded-lg border border-[#27272a] bg-[#18181b] px-4 py-3 text-sm font-medium text-white transition-colors hover:border-[#dc2626]/50 hover:bg-[#1c1212]"
            >
              <span className="flex items-center gap-2">
                <Building2 size={16} className="text-[#dc2626]" />
                Completar perfil
              </span>
              <ArrowRight
                size={14}
                className="text-[#52525b] transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          )}

          <Link
            href="/dashboard/luchadores/nuevo"
            className="group flex items-center justify-between rounded-lg border border-[#27272a] bg-[#18181b] px-4 py-3 text-sm font-medium text-white transition-colors hover:border-[#3f3f46] hover:bg-[#1c1c1c]"
          >
            <span className="flex items-center gap-2">
              <Users size={16} className="text-[#71717a]" />
              Añadir luchador
            </span>
            <ArrowRight
              size={14}
              className="text-[#52525b] transition-transform group-hover:translate-x-0.5"
            />
          </Link>

          <Link
            href="/dashboard/leads"
            className="group flex items-center justify-between rounded-lg border border-[#27272a] bg-[#18181b] px-4 py-3 text-sm font-medium text-white transition-colors hover:border-[#3f3f46] hover:bg-[#1c1c1c]"
          >
            <span className="flex items-center gap-2">
              <MessageSquare size={16} className="text-[#71717a]" />
              Ver leads
              {newLeads > 0 && (
                <span className="rounded-full bg-[#dc2626] px-1.5 py-0.5 text-xs text-white">
                  {newLeads}
                </span>
              )}
            </span>
            <ArrowRight
              size={14}
              className="text-[#52525b] transition-transform group-hover:translate-x-0.5"
            />
          </Link>

          {gym.subscription_tier === 'free' && (
            <Link
              href="/dashboard/suscripcion"
              className="group flex items-center justify-between rounded-lg border border-[#dc2626]/30 bg-[#1c1212] px-4 py-3 text-sm font-medium text-white transition-colors hover:border-[#dc2626]/60 hover:bg-[#1c1212]"
            >
              <span className="flex items-center gap-2">
                <Zap size={16} className="text-[#dc2626]" />
                Mejorar plan
              </span>
              <ArrowRight
                size={14}
                className="text-[#52525b] transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
