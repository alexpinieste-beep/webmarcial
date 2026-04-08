import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession, createBillingPortalSession } from './actions'
import type { SubscriptionTier } from '@/lib/stripe'

export const metadata: Metadata = {
  title: 'Plan de suscripción',
}

// ─── Plan features table data ───────────────────────────────────────────────

type Feature = {
  label: string
  free: string | boolean
  basic: string | boolean
  pro: string | boolean
}

const FEATURES: Feature[] = [
  {
    label: 'Perfil del gimnasio',
    free: true,
    basic: true,
    pro: true,
  },
  {
    label: 'Luchadores',
    free: 'Hasta 5',
    basic: 'Ilimitados',
    pro: 'Ilimitados',
  },
  {
    label: 'Formulario de leads',
    free: false,
    basic: '50/mes',
    pro: 'Ilimitados',
  },
  {
    label: 'Galería de imágenes',
    free: '3 fotos',
    basic: '10 fotos',
    pro: '50 fotos',
  },
  {
    label: 'Badge "Destacado"',
    free: false,
    basic: false,
    pro: true,
  },
  {
    label: 'Analytics',
    free: false,
    basic: true,
    pro: true,
  },
  {
    label: 'Posición prioritaria',
    free: false,
    basic: false,
    pro: true,
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function FeatureCell({ value }: { value: string | boolean }) {
  if (value === true) {
    return <span className="text-[#4ade80] font-semibold">✓</span>
  }
  if (value === false) {
    return <span className="text-[#52525b]">✗</span>
  }
  return <span className="text-[#a1a1aa] text-sm">{value}</span>
}

function PlanBadge({ tier }: { tier: SubscriptionTier }) {
  if (tier === 'pro') {
    return (
      <span className="inline-flex items-center rounded-full bg-[#dc2626]/20 px-2.5 py-0.5 text-xs font-semibold text-[#f87171]">
        Pro
      </span>
    )
  }
  if (tier === 'basic') {
    return (
      <span className="inline-flex items-center rounded-full bg-[#1d4ed8]/20 px-2.5 py-0.5 text-xs font-semibold text-[#93c5fd]">
        Basic
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-[#27272a] px-2.5 py-0.5 text-xs font-semibold text-[#a1a1aa]">
      Gratuito
    </span>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function SuscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; cancelled?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: gym } = await supabase
    .from('gyms')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!gym) {
    redirect('/registro-gimnasio')
  }

  const params = await searchParams
  const showSuccess = params.success === 'true'
  const showCancelled = params.cancelled === 'true'

  const tier = gym.subscription_tier as SubscriptionTier

  const planName =
    tier === 'free' ? 'Gratuito' : tier === 'basic' ? 'Basic' : 'Pro'

  const planFeatures: Record<SubscriptionTier, string[]> = {
    free: [
      'Perfil del gimnasio',
      'Hasta 5 luchadores',
      '3 fotos en galería',
    ],
    basic: [
      'Perfil del gimnasio',
      'Luchadores ilimitados',
      'Formulario de leads (50/mes)',
      '10 fotos en galería',
      'Analytics básico',
      '✦ Gratuito — sin tarjeta',
    ],
    pro: [
      'Perfil del gimnasio',
      'Luchadores ilimitados',
      'Leads ilimitados',
      '50 fotos en galería',
      'Badge "Destacado"',
      'Analytics avanzado',
      'Posición prioritaria en búsquedas',
    ],
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Plan de suscripción</h1>
        <p className="mt-1 text-sm text-[#71717a]">
          Gestiona tu plan y accede a más funcionalidades para tu gimnasio.
        </p>
      </div>

      {/* Success / cancelled banners */}
      {showSuccess && (
        <div className="rounded-lg border border-[#14532d] bg-[#14532d]/20 px-5 py-4">
          <p className="text-sm font-medium text-[#4ade80]">
            ¡Suscripción activada correctamente!
          </p>
          <p className="mt-1 text-sm text-[#86efac]">
            Tu nuevo plan ya está activo. Disfruta de todas las funcionalidades.
          </p>
        </div>
      )}
      {showCancelled && (
        <div className="rounded-lg border border-[#854d0e] bg-[#422006]/20 px-5 py-4">
          <p className="text-sm font-medium text-[#fbbf24]">
            Proceso cancelado
          </p>
          <p className="mt-1 text-sm text-[#a16207]">
            No se ha realizado ningún cargo. Puedes volver a intentarlo cuando quieras.
          </p>
        </div>
      )}

      {/* Current plan card */}
      <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">Plan actual</h2>
              <PlanBadge tier={tier} />
            </div>

            {gym.subscription_expires_at && (
              <p className="text-sm text-[#71717a]">
                Renovación:{' '}
                <span className="text-white">
                  {new Date(gym.subscription_expires_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </p>
            )}

            <ul className="space-y-1.5">
              {planFeatures[tier].map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-[#a1a1aa]"
                >
                  <span className="text-[#4ade80]">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-2 sm:items-end">
            {tier === 'basic' && (
              <form action={createCheckoutSession.bind(null, 'pro')}>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#dc2626] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] sm:w-auto"
                >
                  Mejorar a Pro — €79/mes
                </button>
              </form>
            )}

            {tier === 'basic' && (
              <>
                <form action={createCheckoutSession.bind(null, 'pro')}>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#dc2626] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] sm:w-auto"
                  >
                    Mejorar a Pro — €79/mes
                  </button>
                </form>
                <form action={createBillingPortalSession}>
                  <button
                    type="submit"
                    className="w-full rounded-lg border border-[#27272a] bg-[#18181b] px-5 py-2.5 text-sm font-medium text-[#a1a1aa] transition-colors hover:border-[#3f3f46] hover:text-white sm:w-auto"
                  >
                    Gestionar suscripción
                  </button>
                </form>
              </>
            )}

            {tier === 'pro' && (
              <form action={createBillingPortalSession}>
                <button
                  type="submit"
                  className="w-full rounded-lg border border-[#27272a] bg-[#18181b] px-5 py-2.5 text-sm font-medium text-[#a1a1aa] transition-colors hover:border-[#3f3f46] hover:text-white sm:w-auto"
                >
                  Gestionar suscripción
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Plans comparison table */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#52525b]">
          Comparativa de planes
        </h2>
        <div className="overflow-x-auto rounded-xl border border-[#27272a]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#27272a] bg-[#18181b]">
                <th className="px-5 py-4 font-semibold text-[#71717a]">
                  Funcionalidad
                </th>
                <th className="px-5 py-4 text-center font-semibold text-[#a1a1aa]">
                  Free
                </th>
                <th
                  className={`px-5 py-4 text-center font-semibold ${
                    tier === 'basic'
                      ? 'text-[#93c5fd]'
                      : 'text-[#a1a1aa]'
                  }`}
                >
                  Basic
                  <span className="ml-1 text-xs font-normal text-[#52525b]">
                    €29/mes
                  </span>
                </th>
                <th
                  className={`px-5 py-4 text-center font-semibold ${
                    tier === 'pro'
                      ? 'text-[#f87171]'
                      : 'text-[#a1a1aa]'
                  }`}
                >
                  Pro
                  <span className="ml-1 text-xs font-normal text-[#52525b]">
                    €79/mes
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature, index) => (
                <tr
                  key={feature.label}
                  className={`border-b border-[#27272a] last:border-0 ${
                    index % 2 === 0 ? 'bg-[#0f0f0f]' : 'bg-[#18181b]'
                  }`}
                >
                  <td className="px-5 py-3.5 text-[#d4d4d8]">
                    {feature.label}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <FeatureCell value={feature.free} />
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <FeatureCell value={feature.basic} />
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <FeatureCell value={feature.pro} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade CTA — solo para plan Basic */}
      {tier === 'basic' && (
        <div className="rounded-xl border border-[#dc2626]/30 bg-[#1c1212] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Hazte Pro</h3>
              <p className="mt-0.5 text-sm text-[#71717a]">Leads ilimitados, badge Destacado y posición prioritaria</p>
            </div>
            <span className="text-lg font-bold text-white">
              €79<span className="text-sm font-normal text-[#71717a]">/mes</span>
            </span>
          </div>
          <form action={createCheckoutSession.bind(null, 'pro')}>
            <button
              type="submit"
              className="w-full rounded-lg bg-[#dc2626] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c]"
            >
              Mejorar a Pro
            </button>
          </form>
        </div>
      )}

      {/* Stripe security note */}
      <p className="flex items-center gap-2 text-xs text-[#52525b]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Los pagos son gestionados de forma segura por Stripe
      </p>
    </div>
  )
}
