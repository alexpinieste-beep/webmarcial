import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getAllSports } from '@/lib/queries/sports'
import { getAllZones } from '@/lib/queries/zones'
import { GymProfileForm } from './GymProfileForm'

export const metadata: Metadata = {
  title: 'Mi Perfil',
}

export default async function GymPerfilPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [gymResult, sports, zones] = await Promise.all([
    supabase
      .from('gyms')
      .select('*, zones(*)')
      .eq('owner_id', user.id)
      .single(),
    getAllSports(),
    getAllZones(),
  ])

  if (!gymResult.data) {
    redirect('/registro-gimnasio')
  }

  const gym = gymResult.data

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
        <p className="mt-1 text-sm text-[#71717a]">
          Actualiza la información pública de tu gimnasio en WebMarcial.
        </p>
      </div>

      <GymProfileForm gym={gym} zones={zones} sports={sports} />
    </div>
  )
}
