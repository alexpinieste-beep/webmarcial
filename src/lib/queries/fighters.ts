import { createClient } from '@/lib/supabase/server'
import type {
  Fighter,
  FighterSportProfile,
  FighterTitle,
  Ranking,
} from '@/types/database'

export async function getTopFighters(params?: {
  sport?: string
  level?: 'amateur' | 'professional'
  limit?: number
}): Promise<Fighter[]> {
  const supabase = await createClient()
  let query = supabase
    .from('fighters')
    .select('*, gyms(id, name, slug, zone_id, zones(*))')
    .eq('is_verified', true)
    .order('name', { ascending: true })
    .limit(params?.limit ?? 12)

  if (params?.level) {
    query = query.eq('level', params.level)
  }

  if (params?.sport) {
    const { data: sport } = await supabase
      .from('sports')
      .select('id')
      .eq('slug', params.sport)
      .single()

    if (sport) {
      const { data: fighterIds } = await supabase
        .from('fighter_sport_profiles')
        .select('fighter_id')
        .eq('sport_id', sport.id)

      if (fighterIds && fighterIds.length > 0) {
        const ids = fighterIds.map((r) => r.fighter_id)
        query = query.in('id', ids)
      } else {
        return []
      }
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('getTopFighters error:', error)
    return []
  }

  return data ?? []
}

export async function getAllFighters(params?: {
  level?: 'amateur' | 'professional'
  sport?: string
  limit?: number
}): Promise<Fighter[]> {
  const supabase = await createClient()
  let query = supabase
    .from('fighters')
    .select('*, gyms(id, name, slug, zones(id, name, slug))')
    .eq('is_verified', true)
    .order('name', { ascending: true })
    .limit(params?.limit ?? 100)

  if (params?.level) {
    query = query.eq('level', params.level)
  }

  if (params?.sport) {
    const { data: sport } = await supabase
      .from('sports')
      .select('id')
      .eq('slug', params.sport)
      .single()

    if (sport) {
      const { data: fighterIds } = await supabase
        .from('fighter_sport_profiles')
        .select('fighter_id')
        .eq('sport_id', sport.id)

      if (fighterIds && fighterIds.length > 0) {
        query = query.in('id', fighterIds.map((r) => r.fighter_id))
      } else {
        return []
      }
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('getAllFighters error:', error)
    return []
  }

  return data ?? []
}

export async function getFighterBySlug(slug: string): Promise<
  | (Fighter & {
      sport_profiles: FighterSportProfile[]
      titles: FighterTitle[]
      rankings: Ranking[]
    })
  | null
> {
  const supabase = await createClient()

  const { data: fighter, error } = await supabase
    .from('fighters')
    .select('*, gyms(*, zones(*))')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('getFighterBySlug error:', error)
    }
    return null
  }

  const [
    { data: sportProfiles },
    { data: fighterTitles },
    { data: rankings },
  ] = await Promise.all([
    supabase
      .from('fighter_sport_profiles')
      .select('*, sports(*), weight_classes(*)')
      .eq('fighter_id', fighter.id),
    supabase
      .from('fighter_titles')
      .select('*, titles(*, sports(*), weight_classes(*), zones(*))')
      .eq('fighter_id', fighter.id)
      .is('lost_at', null),
    supabase
      .from('rankings')
      .select('*, weight_classes(*), zones(*)')
      .eq('fighter_id', fighter.id)
      .order('position', { ascending: true }),
  ])

  return {
    ...fighter,
    sport_profiles: sportProfiles ?? [],
    titles: fighterTitles ?? [],
    rankings: rankings ?? [],
  }
}

export async function getFightersByGym(gymId: string): Promise<Fighter[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('fighters')
    .select('*')
    .eq('gym_id', gymId)
    .order('name', { ascending: true })

  if (error) {
    console.error('getFightersByGym error:', error)
    return []
  }

  return data ?? []
}

export async function getMyFighterProfile(userId: string): Promise<Fighter | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('fighters')
    .select('*, gyms(id, name, slug, zones(*))')
    .eq('owner_id', userId)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('getMyFighterProfile error:', error)
    }
    return null
  }

  return data
}
