import type { MetadataRoute } from 'next'
import { createStaticClient } from '@/lib/supabase/static'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://webmarcial.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createStaticClient()

  const [
    { data: sports },
    { data: zones },
    { data: gyms },
    { data: fighters },
    { data: events },
  ] = await Promise.all([
    supabase.from('sports').select('slug').eq('is_active', true),
    supabase.from('zones').select('slug').eq('is_active', true),
    supabase.from('gyms').select('slug, updated_at').eq('is_verified', true),
    supabase.from('fighters').select('slug, updated_at').eq('is_verified', true).limit(500),
    supabase
      .from('events')
      .select('slug, updated_at')
      .in('status', ['upcoming', 'completed'])
      .limit(500),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/eventos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/gimnasios`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/luchadores`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/zonas`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/rankings`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ]

  const sportRoutes: MetadataRoute.Sitemap = (sports ?? []).map((s) => ({
    url: `${BASE_URL}/deportes/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const rankingRoutes: MetadataRoute.Sitemap = (sports ?? []).map((s) => ({
    url: `${BASE_URL}/rankings/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }))

  const zoneRoutes: MetadataRoute.Sitemap = (zones ?? []).map((z) => ({
    url: `${BASE_URL}/zonas/${z.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const gymRoutes: MetadataRoute.Sitemap = (gyms ?? []).map((g) => ({
    url: `${BASE_URL}/gimnasios/${g.slug}`,
    lastModified: g.updated_at ? new Date(g.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const fighterRoutes: MetadataRoute.Sitemap = (fighters ?? []).map((f) => ({
    url: `${BASE_URL}/luchadores/${f.slug}`,
    lastModified: f.updated_at ? new Date(f.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const eventRoutes: MetadataRoute.Sitemap = (events ?? []).map((e) => ({
    url: `${BASE_URL}/eventos/${e.slug}`,
    lastModified: e.updated_at ? new Date(e.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  return [
    ...staticRoutes,
    ...sportRoutes,
    ...rankingRoutes,
    ...zoneRoutes,
    ...gymRoutes,
    ...fighterRoutes,
    ...eventRoutes,
  ]
}
