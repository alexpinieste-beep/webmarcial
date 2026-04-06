import { createClient } from '@/lib/supabase/server'
import type { Zone } from '@/types/database'

export async function getAllZones(): Promise<Zone[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('getAllZones error:', error)
    return []
  }

  return data ?? []
}

export async function getZoneBySlug(slug: string): Promise<Zone | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('getZoneBySlug error:', error)
    }
    return null
  }

  return data
}
