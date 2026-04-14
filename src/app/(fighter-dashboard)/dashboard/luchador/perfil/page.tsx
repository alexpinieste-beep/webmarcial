import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FighterProfileForm from './FighterProfileForm'

export default async function FighterPerfilPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: fighter } = await supabase
    .from('fighters')
    .select('*, gyms(id, name, slug)')
    .eq('owner_id', user.id)
    .single()

  if (!fighter) redirect('/registro-luchador')

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Mi Perfil</h1>
        <p className="mt-1 text-sm text-[#71717a]">
          Actualiza tu información pública como luchador.
          {!fighter.is_verified && (
            <span className="ml-2 text-amber-400">
              Pendiente de verificación por el equipo de WebMarcial.
            </span>
          )}
        </p>
      </div>

      <FighterProfileForm fighter={fighter} />
    </div>
  )
}
