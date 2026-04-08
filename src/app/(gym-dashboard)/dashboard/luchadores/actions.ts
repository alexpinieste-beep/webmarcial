'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import slugify from 'slugify'

// ─── Schemas ───────────────────────────────────────────────────────────────

const fighterSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  nationality: z.string().length(2, 'Código ISO de 2 letras').default('ES'),
  bio: z.string().max(500, 'La bio no puede superar 500 caracteres').optional().nullable(),
})

const sportProfileSchema = z.object({
  sport_id: z.string().uuid('Deporte no válido'),
  weight_class_id: z.string().uuid('Categoría de peso no válida'),
  wins: z.coerce.number().int().min(0, 'No puede ser negativo'),
  losses: z.coerce.number().int().min(0, 'No puede ser negativo'),
  draws: z.coerce.number().int().min(0, 'No puede ser negativo'),
  no_contests: z.coerce.number().int().min(0, 'No puede ser negativo'),
})

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Returns the gym that belongs to the currently authenticated user, or null. */
async function getOwnerGym() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: gym } = await supabase
    .from('gyms')
    .select('id, subscription_tier')
    .eq('owner_id', user.id)
    .single()

  return gym ?? null
}

/** Generates a unique slug for a fighter name. */
async function generateUniqueSlug(name: string): Promise<string> {
  const supabase = await createClient()
  const base = slugify(name, { lower: true, strict: true })

  // Check if base slug exists
  const { data: existing } = await supabase
    .from('fighters')
    .select('slug')
    .eq('slug', base)
    .maybeSingle()

  if (!existing) return base

  // Try suffixes until we find a free one
  let i = 2
  while (true) {
    const candidate = `${base}-${i}`
    const { data: taken } = await supabase
      .from('fighters')
      .select('slug')
      .eq('slug', candidate)
      .maybeSingle()
    if (!taken) return candidate
    i++
  }
}

/** Verifies that a fighter belongs to the authenticated user's gym. */
async function verifyFighterOwnership(fighterId: string): Promise<{ ok: true; gymId: string } | { ok: false; error: string }> {
  const gym = await getOwnerGym()
  if (!gym) return { ok: false, error: 'No autorizado' }

  const supabase = await createClient()
  const { data: fighter } = await supabase
    .from('fighters')
    .select('id, gym_id')
    .eq('id', fighterId)
    .single()

  if (!fighter) return { ok: false, error: 'Luchador no encontrado' }
  if (fighter.gym_id !== gym.id) return { ok: false, error: 'No tienes permiso sobre este luchador' }

  return { ok: true, gymId: gym.id }
}

// ─── Actions ───────────────────────────────────────────────────────────────

export async function createFighter(
  formData: FormData
): Promise<{ error?: string; slug?: string; id?: string }> {
  const gym = await getOwnerGym()
  if (!gym) return { error: 'No autorizado' }

  const raw = {
    name: formData.get('name') as string,
    nationality: (formData.get('nationality') as string) || 'ES',
    bio: (formData.get('bio') as string) || null,
  }

  const parsed = fighterSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos'
    return { error: firstError }
  }

  const { name, nationality, bio } = parsed.data
  const slug = await generateUniqueSlug(name)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('fighters')
    .insert({
      gym_id: gym.id,
      name,
      slug,
      nationality,
      bio: bio ?? null,
      is_verified: false,
    })
    .select('id, slug')
    .single()

  if (error) {
    console.error('createFighter error:', error)
    return { error: 'Error al crear el luchador. Inténtalo de nuevo.' }
  }

  revalidatePath('/dashboard/luchadores')
  return { slug: data.slug, id: data.id }
}

export async function updateFighter(
  fighterId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const ownership = await verifyFighterOwnership(fighterId)
  if (!ownership.ok) return { error: ownership.error }

  const raw = {
    name: formData.get('name') as string,
    nationality: (formData.get('nationality') as string) || 'ES',
    bio: (formData.get('bio') as string) || null,
  }

  const parsed = fighterSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos'
    return { error: firstError }
  }

  const { name, nationality, bio } = parsed.data

  const supabase = await createClient()
  const { error } = await supabase
    .from('fighters')
    .update({ name, nationality, bio: bio ?? null, updated_at: new Date().toISOString() })
    .eq('id', fighterId)

  if (error) {
    console.error('updateFighter error:', error)
    return { error: 'Error al actualizar el luchador.' }
  }

  revalidatePath('/dashboard/luchadores')
  revalidatePath(`/dashboard/luchadores/${fighterId}/editar`)
  return {}
}

export async function deleteFighter(fighterId: string): Promise<{ error?: string }> {
  const ownership = await verifyFighterOwnership(fighterId)
  if (!ownership.ok) return { error: ownership.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from('fighters')
    .delete()
    .eq('id', fighterId)

  if (error) {
    console.error('deleteFighter error:', error)
    return { error: 'Error al eliminar el luchador.' }
  }

  revalidatePath('/dashboard/luchadores')
  return {}
}

export async function upsertSportProfile(
  fighterId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const ownership = await verifyFighterOwnership(fighterId)
  if (!ownership.ok) return { error: ownership.error }

  const raw = {
    sport_id: formData.get('sport_id') as string,
    weight_class_id: formData.get('weight_class_id') as string,
    wins: formData.get('wins'),
    losses: formData.get('losses'),
    draws: formData.get('draws'),
    no_contests: formData.get('no_contests'),
  }

  const parsed = sportProfileSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos'
    return { error: firstError }
  }

  const supabase = await createClient()

  // Check if a profile for this fighter+sport+weight_class already exists
  const { data: existing } = await supabase
    .from('fighter_sport_profiles')
    .select('id')
    .eq('fighter_id', fighterId)
    .eq('sport_id', parsed.data.sport_id)
    .eq('weight_class_id', parsed.data.weight_class_id)
    .maybeSingle()

  let error
  if (existing) {
    ;({ error } = await supabase
      .from('fighter_sport_profiles')
      .update({
        wins: parsed.data.wins,
        losses: parsed.data.losses,
        draws: parsed.data.draws,
        no_contests: parsed.data.no_contests,
      })
      .eq('id', existing.id))
  } else {
    ;({ error } = await supabase
      .from('fighter_sport_profiles')
      .insert({
        fighter_id: fighterId,
        sport_id: parsed.data.sport_id,
        weight_class_id: parsed.data.weight_class_id,
        wins: parsed.data.wins,
        losses: parsed.data.losses,
        draws: parsed.data.draws,
        no_contests: parsed.data.no_contests,
      }))
  }

  if (error) {
    console.error('upsertSportProfile error:', error)
    return { error: 'Error al guardar el perfil deportivo.' }
  }

  revalidatePath(`/dashboard/luchadores/${fighterId}/editar`)
  return {}
}

export async function deleteSportProfile(profileId: string): Promise<{ error?: string }> {
  // Verify ownership via the profile → fighter → gym chain
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('fighter_sport_profiles')
    .select('fighter_id')
    .eq('id', profileId)
    .single()

  if (!profile) return { error: 'Perfil no encontrado' }

  const ownership = await verifyFighterOwnership(profile.fighter_id)
  if (!ownership.ok) return { error: ownership.error }

  const { error } = await supabase
    .from('fighter_sport_profiles')
    .delete()
    .eq('id', profileId)

  if (error) {
    console.error('deleteSportProfile error:', error)
    return { error: 'Error al eliminar el perfil deportivo.' }
  }

  revalidatePath(`/dashboard/luchadores/${profile.fighter_id}/editar`)
  return {}
}
