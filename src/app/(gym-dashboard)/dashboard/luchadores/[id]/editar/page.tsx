import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAllSports } from '@/lib/queries/sports'
import { BasicDataForm } from './BasicDataForm'
import { DeleteFighterSection } from './DeleteFighterSection'
import { SportProfilesSection } from './SportProfilesSection'
import type { FighterSportProfile, WeightClass } from '@/types/database'

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getOwnerGymId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: gym } = await supabase
    .from('gyms')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  return gym?.id ?? null
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function EditarLuchadorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const gymId = await getOwnerGymId()
  if (!gymId) redirect('/login')

  const supabase = await createClient()

  // Load fighter
  const { data: fighter, error: fighterError } = await supabase
    .from('fighters')
    .select('*')
    .eq('id', id)
    .single()

  if (fighterError || !fighter) notFound()

  // Verify ownership
  if (fighter.gym_id !== gymId) notFound()

  // Load sport profiles with joins
  const { data: rawProfiles } = await supabase
    .from('fighter_sport_profiles')
    .select('*, sports(*), weight_classes(*)')
    .eq('fighter_id', fighter.id)
    .order('created_at', { ascending: true })

  const profiles: FighterSportProfile[] = rawProfiles ?? []

  // Load all sports and weight classes in parallel
  const [sports, { data: rawWeightClasses }] = await Promise.all([
    getAllSports(),
    supabase.from('weight_classes').select('*').order('min_weight_kg', { ascending: true }),
  ])

  const allWeightClasses: WeightClass[] = rawWeightClasses ?? []

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/luchadores"
          className="rounded-md p-1.5 text-[#a1a1aa] transition-colors hover:bg-[#27272a] hover:text-white"
          aria-label="Volver a luchadores"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-white">{fighter.name}</h1>
          <p className="text-sm text-[#a1a1aa]">Editar luchador</p>
        </div>
      </div>

      {/* Verification status / public profile link */}
      {fighter.is_verified ? (
        <div className="flex items-center gap-3 rounded-lg border border-green-900/50 bg-green-900/20 px-4 py-3">
          <span className="inline-flex items-center rounded-full bg-green-900/40 px-2.5 py-0.5 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-500/30">
            Verificado
          </span>
          <Link
            href={`/luchadores/${fighter.slug}`}
            target="_blank"
            className="text-sm text-green-300 underline hover:text-green-200"
          >
            Ver perfil público ↗
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-yellow-900/50 bg-yellow-900/20 px-4 py-3">
          <p className="text-sm text-yellow-300">
            Tu luchador está pendiente de verificación por el equipo de WebMarcial.
          </p>
        </div>
      )}

      {/* Basic data section */}
      <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6">
        <h2 className="mb-5 text-base font-semibold text-white">Datos básicos</h2>
        <BasicDataForm fighter={fighter} />
      </div>

      {/* Sport profiles section */}
      <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6">
        <h2 className="mb-5 text-base font-semibold text-white">Perfiles por deporte</h2>
        <SportProfilesSection
          fighterId={fighter.id}
          profiles={profiles}
          sports={sports}
          allWeightClasses={allWeightClasses}
        />
      </div>

      {/* Danger zone */}
      <DeleteFighterSection fighterId={fighter.id} fighterName={fighter.name} />
    </div>
  )
}
