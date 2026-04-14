import { createClient } from '@/lib/supabase/server'
import type { Ranking, WeightClass } from '@/types/database'

export async function getRankings(params: {
  sport: string
  zone?: string
  weightClass?: string
  gender?: 'male' | 'female' | 'open'
  level?: 'amateur' | 'professional'
}): Promise<Ranking[]> {
  const supabase = await createClient()

  const { data: sport } = await supabase
    .from('sports')
    .select('id')
    .eq('slug', params.sport)
    .single()

  if (!sport) return []

  let query = supabase
    .from('rankings')
    .select('*, fighters(id, name, slug, avatar_url, nationality, is_verified, level), weight_classes(*), zones(*)')
    .eq('sport_id', sport.id)
    .order('position', { ascending: true })

  if (params.zone) {
    const { data: zone } = await supabase
      .from('zones')
      .select('id')
      .eq('slug', params.zone)
      .single()
    if (zone) {
      query = query.eq('zone_id', zone.id)
    }
  } else {
    query = query.is('zone_id', null)
  }

  if (params.weightClass) {
    const { data: wc } = await supabase
      .from('weight_classes')
      .select('id')
      .eq('slug', params.weightClass)
      .eq('sport_id', sport.id)
      .single()
    if (wc) {
      query = query.eq('weight_class_id', wc.id)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('getRankings error:', error)
    return []
  }

  let results = data ?? []

  // Filter by gender via joined weight_classes
  if (params.gender) {
    results = results.filter((r) => r.weight_classes?.gender === params.gender)
  }

  // Filter by fighter level via joined fighters
  if (params.level) {
    results = results.filter((r) => r.fighters?.level === params.level)
  }

  return results as Ranking[]
}

export async function getWeightClassesBySport(
  sportSlug: string
): Promise<WeightClass[]> {
  const supabase = await createClient()

  const { data: sport } = await supabase
    .from('sports')
    .select('id')
    .eq('slug', sportSlug)
    .single()

  if (!sport) return []

  const { data, error } = await supabase
    .from('weight_classes')
    .select('*')
    .eq('sport_id', sport.id)
    .order('min_weight_kg', { ascending: true })

  if (error) {
    console.error('getWeightClassesBySport error:', error)
    return []
  }

  return data ?? []
}
