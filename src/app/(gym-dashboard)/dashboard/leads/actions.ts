'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Lead } from '@/types/database'

export async function updateLeadStatus(
  leadId: string,
  status: Lead['status']
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Verificar ownership del lead
  const { data: gym } = await supabase
    .from('gyms')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!gym) return { error: 'Gimnasio no encontrado' }

  const { data: lead } = await supabase
    .from('leads')
    .select('gym_id')
    .eq('id', leadId)
    .single()

  if (!lead || lead.gym_id !== gym.id) return { error: 'Lead no encontrado' }

  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', leadId)

  if (error) return { error: 'Error al actualizar el estado' }

  revalidatePath('/dashboard/leads')
  return {}
}
