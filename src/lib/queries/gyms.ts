import { createClient } from '@/lib/supabase/server'
import type { Gym } from '@/types/database'

export async function getFeaturedGyms(limit = 6): Promise<Gym[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gyms')
    .select('*, zones(*)')
    .or('is_featured.eq.true,subscription_tier.eq.pro')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getFeaturedGyms error:', error)
    return []
  }

  return data ?? []
}

export async function getGyms(params?: {
  zone?: string
  sport?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<Gym[]> {
  const supabase = await createClient()
  let query = supabase
    .from('gyms')
    .select('*, zones(*)')
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  if (params?.zone) {
    // filter by zone slug via join
    const { data: zone } = await supabase
      .from('zones')
      .select('id')
      .eq('slug', params.zone)
      .single()
    if (zone) {
      query = query.eq('zone_id', zone.id)
    }
  }

  if (params?.sport) {
    // filter by sport slug: find sport id first, then filter sport_ids array
    const { data: sport } = await supabase
      .from('sports')
      .select('id')
      .eq('slug', params.sport)
      .single()
    if (sport) {
      query = query.contains('sport_ids', [sport.id])
    }
  }

  if (params?.search) {
    query = query.ilike('name', `%${params.search}%`)
  }

  if (params?.limit) {
    query = query.limit(params.limit)
  }

  if (params?.offset) {
    query = query.range(
      params.offset,
      params.offset + (params.limit ?? 20) - 1
    )
  }

  const { data, error } = await query

  if (error) {
    console.error('getGyms error:', error)
    return []
  }

  return data ?? []
}

export async function getGymBySlug(slug: string): Promise<Gym | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gyms')
    .select('*, zones(*), gym_images(*)')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('getGymBySlug error:', error)
    }
    return null
  }

  // gym_images: keep only first 5
  if (data && (data as Record<string, unknown>).gym_images) {
    const withImages = data as Gym & { gym_images: unknown[] }
    withImages.gym_images = withImages.gym_images.slice(0, 5)
  }

  return data
}

export async function getGymsByZone(
  zoneSlug: string,
  limit = 12
): Promise<Gym[]> {
  const supabase = await createClient()

  const { data: zone } = await supabase
    .from('zones')
    .select('id')
    .eq('slug', zoneSlug)
    .single()

  if (!zone) return []

  const { data, error } = await supabase
    .from('gyms')
    .select('*, zones(*)')
    .eq('zone_id', zone.id)
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('getGymsByZone error:', error)
    return []
  }

  return data ?? []
}

export async function getGymCount(): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('gyms')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('getGymCount error:', error)
    return 0
  }

  return count ?? 0
}
