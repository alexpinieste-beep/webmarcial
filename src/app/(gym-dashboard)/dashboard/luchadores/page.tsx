import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getFightersByGym } from '@/lib/queries/fighters'
import type { Fighter, Gym } from '@/types/database'
import { DeleteFighterButton } from './DeleteFighterButton'

// ─── Helpers ───────────────────────────────────────────────────────────────

async function getOwnerGym(): Promise<Gym | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: gym } = await supabase
    .from('gyms')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  return gym ?? null
}

// ─── Avatar fallback ────────────────────────────────────────────────────────

function AvatarFallback({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#3f3f46] text-sm font-semibold text-white">
      {initials}
    </div>
  )
}

// ─── Fighter row ────────────────────────────────────────────────────────────

async function FighterRow({ fighter }: { fighter: Fighter }) {
  const supabase = await createClient()
  const { count } = await supabase
    .from('fighter_sport_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('fighter_id', fighter.id)

  const sportCount = count ?? 0

  return (
    <tr className="border-b border-[#27272a] transition-colors hover:bg-[#1c1c1c]">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {fighter.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fighter.avatar_url}
              alt={fighter.name}
              className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
            />
          ) : (
            <AvatarFallback name={fighter.name} />
          )}
          <div>
            <p className="font-medium text-white">{fighter.name}</p>
            <Link
              href={`/luchadores/${fighter.slug}`}
              className="text-xs text-[#a1a1aa] hover:text-[#dc2626]"
              target="_blank"
            >
              Ver perfil público ↗
            </Link>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-[#a1a1aa]">
        {fighter.nationality}
      </td>
      <td className="px-4 py-3 text-sm text-[#a1a1aa]">
        {sportCount} {sportCount === 1 ? 'deporte' : 'deportes'}
      </td>
      <td className="px-4 py-3">
        {fighter.is_verified ? (
          <span className="inline-flex items-center rounded-full bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-500/20">
            Verificado
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-yellow-900/30 px-2.5 py-0.5 text-xs font-medium text-yellow-400 ring-1 ring-inset ring-yellow-500/20">
            Pendiente
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/luchadores/${fighter.id}/editar`}
            className="rounded-md bg-[#27272a] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#3f3f46]"
          >
            Editar
          </Link>
          <DeleteFighterButton fighterId={fighter.id} fighterName={fighter.name} />
        </div>
      </td>
    </tr>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function LuchadoresPage() {
  const gym = await getOwnerGym()

  if (!gym) {
    redirect('/login')
  }

  const fighters = await getFightersByGym(gym.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mis Luchadores</h1>
          <p className="mt-1 text-sm text-[#a1a1aa]">
            Gestiona los luchadores de tu gimnasio
          </p>
        </div>
        <Link
          href="/dashboard/luchadores/nuevo"
          className="rounded-md bg-[#dc2626] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#b91c1c]"
        >
          Añadir luchador
        </Link>
      </div>

      {/* Empty state */}
      {fighters.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#27272a] bg-[#18181b] py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#27272a]">
            <svg className="h-7 w-7 text-[#71717a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="mb-1 text-lg font-semibold text-white">Sin luchadores todavía</h2>
          <p className="mb-6 text-sm text-[#a1a1aa]">Añade tu primer luchador para empezar a gestionar tu equipo.</p>
          <Link
            href="/dashboard/luchadores/nuevo"
            className="rounded-md bg-[#dc2626] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#b91c1c]"
          >
            Añadir tu primer luchador
          </Link>
        </div>
      ) : (
        /* Fighters table */
        <div className="overflow-hidden rounded-xl border border-[#27272a] bg-[#18181b]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#71717a]">
                  Luchador
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#71717a]">
                  Nac.
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#71717a]">
                  Deportes
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#71717a]">
                  Estado
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#71717a]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {fighters.map((fighter) => (
                <FighterRow key={fighter.id} fighter={fighter} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
