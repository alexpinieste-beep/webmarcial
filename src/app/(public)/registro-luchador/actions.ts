'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type ActionState = { error?: string; success?: string } | null

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createFighterProfile(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = (formData.get('name') as string)?.trim()
  const nationality = (formData.get('nationality') as string) ?? 'ES'
  const level = (formData.get('level') as string) ?? 'amateur'
  const bio = (formData.get('bio') as string)?.trim() || null
  const gymId = (formData.get('gym_id') as string) || null

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
    return { error: 'Debes iniciar sesión para crear tu perfil.' }
  }

  // Check if user already has a fighter profile
  const { data: existing } = await supabase
    .from('fighters')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (existing) {
    return { error: 'Ya tienes un perfil de luchador creado.' }
  }

  // Generate unique slug
  let slug = toSlug(name)
  const { data: slugConflict } = await supabase
    .from('fighters')
    .select('id')
    .eq('slug', slug)
    .single()

  if (slugConflict) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const { error } = await supabase.from('fighters').insert({
    owner_id: user.id,
    name,
    slug,
    nationality,
    level,
    bio,
    gym_id: gymId || null,
    is_verified: false,
  })

  if (error) {
    console.error('[createFighterProfile error]', error.message)
    return { error: 'No se pudo crear el perfil. Inténtalo de nuevo.' }
  }

  revalidatePath('/luchadores')
  redirect('/dashboard/luchador/perfil')
}
