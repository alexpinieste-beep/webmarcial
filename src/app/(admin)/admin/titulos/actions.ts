'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || profile.role !== 'admin') throw new Error('Sin permisos')
  return supabase
}

export type TitleFormState = { error?: string; success?: string } | null

export async function createTitle(
  _prevState: TitleFormState,
  formData: FormData
): Promise<TitleFormState> {
  const name = (formData.get('name') as string)?.trim()
  const organization = (formData.get('organization') as string)?.trim()
  const sport_id = formData.get('sport_id') as string
  const weight_class_id = formData.get('weight_class_id') as string
  const zone_id = (formData.get('zone_id') as string) || null

  if (!name || !organization || !sport_id || !weight_class_id) {
    return { error: 'Rellena todos los campos obligatorios.' }
  }

  const supabase = await assertAdmin()
  const { error } = await supabase.from('titles').insert({
    name,
    organization,
    sport_id,
    weight_class_id,
    zone_id,
    is_active: true,
  })

  if (error) return { error: 'No se pudo crear el título.' }

  revalidatePath('/admin/titulos')
  return { success: 'Título creado correctamente.' }
}

export async function toggleTitleActive(titleId: string, isActive: boolean) {
  const supabase = await assertAdmin()
  await supabase.from('titles').update({ is_active: isActive }).eq('id', titleId)
  revalidatePath('/admin/titulos')
}

// Assign a champion: vacates previous holder and assigns new one
export async function assignChampion(titleId: string, fighterId: string) {
  const supabase = await assertAdmin()

  // Vacate existing holder
  await supabase
    .from('fighter_titles')
    .update({ lost_at: new Date().toISOString() })
    .eq('title_id', titleId)
    .is('lost_at', null)

  // Assign new champion
  await supabase.from('fighter_titles').insert({
    fighter_id: fighterId,
    title_id: titleId,
    won_at: new Date().toISOString(),
  })

  revalidatePath('/admin/titulos')
}

export async function vacateTitle(titleId: string) {
  const supabase = await assertAdmin()
  await supabase
    .from('fighter_titles')
    .update({ lost_at: new Date().toISOString() })
    .eq('title_id', titleId)
    .is('lost_at', null)
  revalidatePath('/admin/titulos')
}
