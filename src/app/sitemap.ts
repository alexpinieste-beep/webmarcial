import type { MetadataRoute } from 'next'
import { getAllSports } from '@/lib/queries/sports'
import { getAllZones } from '@/lib/queries/zones'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://webmarcial.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sports, zones] = await Promise.all([getAllSports(), getAllZones()])

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/eventos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/gimnasios`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/zonas`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/rankings`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  const sportRoutes: MetadataRoute.Sitemap = sports.map((sport) => ({
    url: `${BASE_URL}/deportes/${sport.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const zoneRoutes: MetadataRoute.Sitemap = zones.map((zone) => ({
    url: `${BASE_URL}/zonas/${zone.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...sportRoutes, ...zoneRoutes]
}
