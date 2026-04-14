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

export async function setEventStatus(
  eventId: string,
  status: 'draft' | 'published' | 'completed' | 'cancelled'
) {
  const supabase = await assertAdmin()
  await supabase
    .from('events')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', eventId)
  revalidatePath('/admin/eventos')
  revalidatePath('/eventos', 'layout')
}
