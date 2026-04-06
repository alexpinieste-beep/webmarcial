import { createClient } from '@/lib/supabase/server'
import type { Event, Fight } from '@/types/database'

const today = () => new Date().toISOString()

export async function getFeaturedEvents(limit = 6): Promise<Event[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*, sports(*), zones(*)')
    .eq('status', 'published')
    .gte('event_date', today())
    .order('event_date', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('getFeaturedEvents error:', error)
    return []
  }

  return data ?? []
}

export async function getUpcomingEvents(params?: {
  sport?: string
  zone?: string
  limit?: number
}): Promise<Event[]> {
  const supabase = await createClient()
  let query = supabase
    .from('events')
    .select('*, sports(*), zones(*)')
    .eq('status', 'published')
    .gte('event_date', today())
    .order('event_date', { ascending: true })
    .limit(params?.limit ?? 20)

  if (params?.sport) {
    const { data: sport } = await supabase
      .from('sports')
      .select('id')
      .eq('slug', params.sport)
      .single()
    if (sport) {
      query = query.eq('sport_id', sport.id)
    }
  }

  if (params?.zone) {
    const { data: zone } = await supabase
      .from('zones')
      .select('id')
      .eq('slug', params.zone)
      .single()
    if (zone) {
      query = query.eq('zone_id', zone.id)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('getUpcomingEvents error:', error)
    return []
  }

  return data ?? []
}

export async function getEventBySlug(slug: string): Promise<
  | (Event & {
      fights: Fight[]
    })
  | null
> {
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('*, sports(*), zones(*)')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('getEventBySlug error:', error)
    }
    return null
  }

  const { data: fights, error: fightsError } = await supabase
    .from('fights')
    .select(
      '*, fighter_a:fighters!fighter_a_id(*), fighter_b:fighters!fighter_b_id(*), weight_classes(*)'
    )
    .eq('event_id', event.id)
    .order('sort_order', { ascending: true })

  if (fightsError) {
    console.error('getEventBySlug fights error:', fightsError)
  }

  return {
    ...event,
    fights: fights ?? [],
  }
}

export async function getEventsByZone(
  zoneSlug: string,
  limit = 12
): Promise<Event[]> {
  const supabase = await createClient()

  const { data: zone } = await supabase
    .from('zones')
    .select('id')
    .eq('slug', zoneSlug)
    .single()

  if (!zone) return []

  const { data, error } = await supabase
    .from('events')
    .select('*, sports(*), zones(*)')
    .eq('zone_id', zone.id)
    .in('status', ['published', 'completed'])
    .order('event_date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getEventsByZone error:', error)
    return []
  }

  return data ?? []
}

export async function getPastEvents(params?: {
  sport?: string
  zone?: string
  limit?: number
}): Promise<Event[]> {
  const supabase = await createClient()
  let query = supabase
    .from('events')
    .select('*, sports(*), zones(*)')
    .eq('status', 'completed')
    .lt('event_date', today())
    .order('event_date', { ascending: false })
    .limit(params?.limit ?? 20)

  if (params?.sport) {
    const { data: sport } = await supabase
      .from('sports')
      .select('id')
      .eq('slug', params.sport)
      .single()
    if (sport) {
      query = query.eq('sport_id', sport.id)
    }
  }

  if (params?.zone) {
    const { data: zone } = await supabase
      .from('zones')
      .select('id')
      .eq('slug', params.zone)
      .single()
    if (zone) {
      query = query.eq('zone_id', zone.id)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('getPastEvents error:', error)
    return []
  }

  return data ?? []
}

/** @deprecated Use getUpcomingEvents with sport slug instead */
export async function getEventsBySport(
  sportId: string,
  limit = 4
): Promise<Event[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*, sports(*), zones(*)')
    .eq('sport_id', sportId)
    .eq('status', 'published')
    .gte('event_date', today())
    .order('event_date', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('getEventsBySport error:', error)
    return []
  }

  return data ?? []
}

export async function getUpcomingEventSlugs(limit = 20): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('slug')
    .eq('status', 'published')
    .gte('event_date', today())
    .order('event_date', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('getUpcomingEventSlugs error:', error)
    return []
  }

  return (data ?? []).map((e) => e.slug)
}

export async function getEventFights(eventId: string): Promise<Fight[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('fights')
    .select(
      '*, fighter_a:fighters!fighter_a_id(*), fighter_b:fighters!fighter_b_id(*), weight_classes(*)'
    )
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('getEventFights error:', error)
    return []
  }

  return data ?? []
}
