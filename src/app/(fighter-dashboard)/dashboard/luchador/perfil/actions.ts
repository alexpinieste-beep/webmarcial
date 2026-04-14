'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ActionState = { error?: string; success?: string } | null

export async function updateFighterProfile(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = (formData.get('name') as string)?.trim()
  const nationality = formData.get('nationality') as string
  const level = formData.get('level') as string
  const bio = (formData.get('bio') as string)?.trim() || null

  if (!name || name.length < 2) {
    return { error: 'El nombre debe tener al menos 2 caracteres.' }
  }

  if (!['amateur', 'professional'].includes(level)) {
    return { error: 'Nivel de competición no válido.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado.' }
  }

  const { error } = await supabase
    .from('fighters')
    .update({ name, nationality, level, bio, updated_at: new Date().toISOString() })
    .eq('owner_id', user.id)

  if (error) {
    console.error('[updateFighterProfile error]', error.message)
    return { error: 'No se pudo guardar el perfil. Inténtalo de nuevo.' }
  }

  revalidatePath('/dashboard/luchador/perfil')
  revalidatePath('/luchadores')

  return { success: 'Perfil actualizado correctamente.' }
}
