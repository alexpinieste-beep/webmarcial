import { createClient } from '@/lib/supabase/server'
import type { Sport } from '@/types/database'

export async function getAllSports(): Promise<Sport[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sports')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('getAllSports error:', error)
    return []
  }

  return data ?? []
}

export async function getSportBySlug(slug: string): Promise<Sport | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sports')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('getSportBySlug error:', error)
    }
    return null
  }

  return data
}
