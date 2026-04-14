import { redirect } from 'next/navigation'
import { BarChart2, Swords, Shield, Minus, HelpCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/dashboard/StatCard'

export default async function FighterEstadisticasPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: fighter } = await supabase
    .from('fighters')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!fighter) redirect('/registro-luchador')

  const { data: profiles } = await supabase
    .from('fighter_sport_profiles')
    .select('*, sports(name), weight_classes(name, max_weight_kg)')
    .eq('fighter_id', fighter.id)
    .order('created_at', { ascending: true })

  const sportProfiles = profiles ?? []

  const totalWins = sportProfiles.reduce((acc, p) => acc + p.wins, 0)
  const totalLosses = sportProfiles.reduce((acc, p) => acc + p.losses, 0)
  const totalDraws = sportProfiles.reduce((acc, p) => acc + p.draws, 0)
  const totalFights = totalWins + totalLosses + totalDraws

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white">Estadísticas</h1>
        <p className="mt-1 text-sm text-[#71717a]">
          Tu récord de combate por deporte y categoría.
        </p>
      </div>

      {/* Global totals */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          title="Combates"
          value={totalFights}
          icon={<Swords size={16} />}
        />
        <StatCard
          title="Victorias"
          value={totalWins}
          icon={<BarChart2 size={16} />}
          accent={totalWins > 0}
        />
        <StatCard
          title="Derrotas"
          value={totalLosses}
          icon={<Shield size={16} />}
        />
        <StatCard
          title="Empates / N/C"
          value={`${totalDraws} / ${sportProfiles.reduce((a, p) => a + p.no_contests, 0)}`}
          icon={<Minus size={16} />}
        />
      </div>

      {/* Per-sport breakdown */}
      {sportProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#27272a] bg-[#111111] py-16 text-center">
          <HelpCircle className="mb-3 text-[#52525b]" size={32} />
          <p className="text-sm font-medium text-[#71717a]">
            Aún no tienes perfiles de deporte registrados.
          </p>
          <p className="mt-1 text-xs text-[#52525b]">
            El administrador de tu gimnasio puede añadir tus disciplinas y récord.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#52525b]">
            Por disciplina
          </h2>
          {sportProfiles.map((profile) => {
            const fights = profile.wins + profile.losses + profile.draws
            const winRate = fights > 0 ? Math.round((profile.wins / fights) * 100) : 0

            return (
              <div
                key={profile.id}
                className="rounded-xl border border-[#27272a] bg-[#111111] p-5"
              >
                <div className="mb-4 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">
                      {profile.sports?.name ?? 'Deporte'}
                    </p>
                    <p className="text-xs text-[#71717a]">
                      {profile.weight_classes?.name ?? ''}
                      {profile.weight_classes?.max_weight_kg != null
                        ? ` (hasta ${profile.weight_classes.max_weight_kg} kg)`
                        : ''}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#1a0a0a] px-3 py-1 text-xs font-semibold text-[#dc2626]">
                    {winRate}% victorias
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center text-sm">
                  {(
                    [
                      { label: 'V', value: profile.wins, color: 'text-green-400' },
                      { label: 'D', value: profile.losses, color: 'text-red-400' },
                      { label: 'E', value: profile.draws, color: 'text-yellow-400' },
                      { label: 'N/C', value: profile.no_contests, color: 'text-[#71717a]' },
                    ] as const
                  ).map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="rounded-lg border border-[#27272a] bg-[#18181b] py-3"
                    >
                      <p className={`text-xl font-bold ${color}`}>{value}</p>
                      <p className="mt-0.5 text-xs text-[#52525b]">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
