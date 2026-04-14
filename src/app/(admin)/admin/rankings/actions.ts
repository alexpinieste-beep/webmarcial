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

// Saves a new ordering: receives ordered array of ranking IDs
export async function saveRankingsOrder(orderedIds: string[]) {
  const supabase = await assertAdmin()

  // Update each row's position based on array index
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from('rankings')
        .update({ position: index + 1, updated_at: new Date().toISOString() })
        .eq('id', id)
    )
  )

  revalidatePath('/admin/rankings')
  revalidatePath('/rankings', 'layout')
}
