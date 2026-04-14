/**
 * Cliente Supabase para uso en generateStaticParams y otros contextos
 * donde cookies() no está disponible (build time).
 */
import { createClient } from '@supabase/supabase-js'

export function createStaticClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
