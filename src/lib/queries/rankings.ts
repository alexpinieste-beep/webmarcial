import { createClient } from '@/lib/supabase/server'
import type { Ranking, WeightClass } from '@/types/database'

export async function getRankings(params: {
  sport: string
  zone?: string
  weightClass?: string
  gender?: 'male' | 'female' | 'open'
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
    .select('*, fighters(id, name, slug, avatar_url, nationality, is_verified), weight_classes(*), zones(*)')
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

  if (params.gender) {
    // filter via weight_classes join — need a sub-query approach
    // We join weight_classes and filter in-memory since PostgREST nested filter on joins is limited
    const { data, error } = await query

    if (error) {
      console.error('getRankings error:', error)
      return []
    }

    return (data ?? []).filter(
      (r) => r.weight_classes?.gender === params.gender
    ) as Ranking[]
  }

  const { data, error } = await query

  if (error) {
    console.error('getRankings error:', error)
    return []
  }

  return data ?? []
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
