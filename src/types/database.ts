export type Sport = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
}

export type Zone = {
  id: string
  name: string
  slug: string
  code: string
  capital: string
  created_at: string
}

export type WeightClass = {
  id: string
  sport_id: string
  name: string
  slug: string
  min_weight_kg: number | null
  max_weight_kg: number | null
  gender: 'male' | 'female' | 'open'
  created_at: string
}

export type Profile = {
  id: string
  role: 'admin' | 'gym_owner' | 'public'
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Gym = {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  zone_id: string | null
  phone: string | null
  email: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  sport_ids: string[] | null
  subscription_tier: 'free' | 'basic' | 'pro'
  subscription_expires_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  is_verified: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  // joined
  zones?: Zone | null
  sports?: Sport[]
}

export type Fighter = {
  id: string
  owner_id: string | null
  gym_id: string | null
  name: string
  slug: string
  bio: string | null
  avatar_url: string | null
  nationality: string
  level: 'amateur' | 'professional'
  is_verified: boolean
  created_at: string
  updated_at: string
  // joined
  gyms?: Gym | null
}

export type FighterSportProfile = {
  id: string
  fighter_id: string
  sport_id: string
  weight_class_id: string
  wins: number
  losses: number
  draws: number
  no_contests: number
  created_at: string
  // joined
  sports?: Sport
  weight_classes?: WeightClass
}

export type Title = {
  id: string
  name: string
  sport_id: string
  weight_class_id: string
  zone_id: string | null
  organization: string
  is_active: boolean
  created_at: string
  // joined
  sports?: Sport
  weight_classes?: WeightClass
  zones?: Zone | null
}

export type FighterTitle = {
  id: string
  fighter_id: string
  title_id: string
  won_at: string
  lost_at: string | null
  created_at: string
  // joined
  titles?: Title
}

export type Ranking = {
  id: string
  fighter_id: string
  sport_id: string
  weight_class_id: string
  zone_id: string | null
  position: number
  points: number
  season: number
  created_at: string
  updated_at: string
  // joined
  fighters?: Fighter
  sports?: Sport
  weight_classes?: WeightClass
  zones?: Zone | null
}

export type Event = {
  id: string
  title: string
  slug: string
  sport_id: string
  zone_id: string | null
  venue: string | null
  address: string | null
  event_date: string
  description: string | null
  poster_url: string | null
  status: 'draft' | 'published' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  // joined
  sports?: Sport
  zones?: Zone | null
}

export type Fight = {
  id: string
  event_id: string
  fighter_a_id: string
  fighter_b_id: string
  weight_class_id: string
  result: 'pending' | 'fighter_a_win' | 'fighter_b_win' | 'draw' | 'no_contest'
  method: string | null
  round: number | null
  time: string | null
  sort_order: number
  created_at: string
  // joined
  fighter_a?: Fighter
  fighter_b?: Fighter
  weight_classes?: WeightClass
}

export type Lead = {
  id: string
  gym_id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  status: 'new' | 'contacted' | 'converted' | 'closed'
  created_at: string
}
