'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const gymProfileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z
    .string()
    .max(500, 'La descripción no puede superar los 500 caracteres')
    .optional()
    .or(z.literal('')),
  zone_id: z.string().uuid('Zona no válida').optional().or(z.literal('')),
  address: z
    .string()
    .max(300, 'La dirección es demasiado larga')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(30, 'El teléfono es demasiado largo')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Email no válido')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url('URL no válida')
    .optional()
    .or(z.literal('')),
  instagram: z
    .string()
    .max(60, 'Instagram demasiado largo')
    .regex(
      /^[a-zA-Z0-9._]*$/,
      'Solo letras, números, puntos y guiones bajos'
    )
    .optional()
    .or(z.literal('')),
  facebook: z
    .string()
    .max(200, 'Facebook demasiado largo')
    .optional()
    .or(z.literal('')),
  sport_ids: z.array(z.string().uuid()).optional(),
})

export type UpdateGymProfileResult = { error?: string; success?: boolean }

export async function updateGymProfile(
  _prevState: UpdateGymProfileResult,
  formData: FormData
): Promise<UpdateGymProfileResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Extract sport_ids (multiple checkboxes with the same name)
  const sport_ids = formData.getAll('sport_ids').map(String).filter(Boolean)

  const rawData = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || '',
    zone_id: (formData.get('zone_id') as string) || '',
    address: (formData.get('address') as string) || '',
    phone: (formData.get('phone') as string) || '',
    email: (formData.get('email') as string) || '',
    website: (formData.get('website') as string) || '',
    instagram: (formData.get('instagram') as string) || '',
    facebook: (formData.get('facebook') as string) || '',
    sport_ids,
  }

  const parsed = gymProfileSchema.safeParse(rawData)

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return { error: firstIssue?.message ?? 'Datos no válidos' }
  }

  const {
    name,
    description,
    zone_id,
    address,
    phone,
    email,
    website,
    instagram,
    facebook,
  } = parsed.data

  // Get current gym to know the slug for revalidation
  const { data: currentGym, error: fetchError } = await supabase
    .from('gyms')
    .select('id, slug')
    .eq('owner_id', user.id)
    .single()

  if (fetchError || !currentGym) {
    return { error: 'No se encontró tu gimnasio' }
  }

  const { error: updateError } = await supabase
    .from('gyms')
    .update({
      name,
      description: description || null,
      zone_id: zone_id || null,
      address: address || null,
      phone: phone || null,
      email: email || null,
      website: website || null,
      instagram: instagram || null,
      facebook: facebook || null,
      sport_ids: sport_ids.length > 0 ? sport_ids : null,
      updated_at: new Date().toISOString(),
    })
    .eq('owner_id', user.id)

  if (updateError) {
    console.error('updateGymProfile error:', updateError)
    return { error: 'Error al guardar los cambios. Inténtalo de nuevo.' }
  }

  revalidatePath('/dashboard/perfil')
  revalidatePath(`/gimnasios/${currentGym.slug}`)

  return { success: true }
}
