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

export async function verifyGym(gymId: string, verified: boolean) {
  const supabase = await assertAdmin()
  await supabase.from('gyms').update({ is_verified: verified }).eq('id', gymId)
  revalidatePath('/admin/gimnasios')
  revalidatePath('/admin')
}

export async function featureGym(gymId: string, featured: boolean) {
  const supabase = await assertAdmin()
  await supabase.from('gyms').update({ is_featured: featured }).eq('id', gymId)
  revalidatePath('/admin/gimnasios')
}

export async function setGymPlan(
  gymId: string,
  tier: 'free' | 'basic' | 'pro'
) {
  const supabase = await assertAdmin()
  await supabase
    .from('gyms')
    .update({ subscription_tier: tier, updated_at: new Date().toISOString() })
    .eq('id', gymId)
  revalidatePath('/admin/gimnasios')
}
