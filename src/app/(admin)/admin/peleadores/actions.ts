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

export async function verifyFighter(fighterId: string, verified: boolean) {
  const supabase = await assertAdmin()
  await supabase.from('fighters').update({ is_verified: verified }).eq('id', fighterId)
  revalidatePath('/admin/peleadores')
  revalidatePath('/admin')
}

export async function assignGym(fighterId: string, gymId: string | null) {
  const supabase = await assertAdmin()
  await supabase
    .from('fighters')
    .update({ gym_id: gymId, updated_at: new Date().toISOString() })
    .eq('id', fighterId)
  revalidatePath('/admin/peleadores')
}
