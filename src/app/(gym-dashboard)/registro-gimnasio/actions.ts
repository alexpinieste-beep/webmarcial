'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import slugify from 'slugify'

const GymSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  address: z.string().max(200).optional(),
  zone_slug: z.string().optional(),
  phone: z.string().max(20).optional(),
})

export type CreateGymState = { error?: string } | null

export async function createGym(
  _prevState: CreateGymState,
  formData: FormData
): Promise<CreateGymState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Verificar que no tiene ya un gimnasio
  const { data: existing } = await supabase
    .from('gyms')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (existing) redirect('/dashboard')

  const parsed = GymSchema.safeParse({
    name: formData.get('name'),
    address: formData.get('address') || undefined,
    zone_slug: formData.get('zone_id') || undefined,
    phone: formData.get('phone') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const { name, address, zone_slug, phone } = parsed.data

  // Resolver slug de zona a UUID
  let zone_id: string | null = null
  if (zone_slug) {
    const { data: zone } = await supabase
      .from('zones')
      .select('id')
      .eq('slug', zone_slug)
      .single()
    zone_id = zone?.id ?? null
  }

  // Generar slug único
  let slug = slugify(name, { lower: true, strict: true })
  const { data: existing_slug } = await supabase
    .from('gyms')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing_slug) slug = `${slug}-${Date.now()}`

  // Crear el gimnasio con plan Basic automáticamente (sin tarjeta)
  const { error } = await supabase.from('gyms').insert({
    owner_id: user.id,
    name,
    slug,
    address: address ?? null,
    zone_id: zone_id,
    phone: phone ?? null,
    subscription_tier: 'basic', // Basic gratuito por defecto
    is_verified: false,
  })

  if (error) return { error: 'Error al crear el gimnasio. Inténtalo de nuevo.' }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
