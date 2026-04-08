import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { sendLeadNotification } from '@/lib/emails/send-lead-notification'

const LeadSchema = z.object({
  gym_id: z.string().uuid(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  message: z.string().max(500).optional(),
})

export async function POST(request: Request) {
  // 1. Parse and validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = LeadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { gym_id, name, email, phone, message } = parsed.data

  // Service-role client — bypasses RLS, safe for public API routes
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 2. Verify gym exists, is verified, and has leads enabled (non-free plan)
  const { data: gym, error: gymError } = await supabase
    .from('gyms')
    .select('id, name, email, is_verified, subscription_tier')
    .eq('id', gym_id)
    .single()

  if (gymError || !gym) {
    return NextResponse.json({ error: 'Gimnasio no encontrado' }, { status: 404 })
  }

  if (!gym.is_verified) {
    return NextResponse.json({ error: 'Gimnasio no verificado' }, { status: 403 })
  }

  if (gym.subscription_tier === 'free') {
    return NextResponse.json(
      { error: 'Este gimnasio no tiene leads habilitados' },
      { status: 403 }
    )
  }

  // 3. Rate limit: max 3 leads from the same email to the same gym in 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count, error: countError } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('gym_id', gym_id)
    .eq('email', email)
    .gte('created_at', since)

  if (countError) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }

  if ((count ?? 0) >= 3) {
    return NextResponse.json(
      { error: 'Has enviado demasiados mensajes a este gimnasio. Inténtalo más tarde.' },
      { status: 429 }
    )
  }

  // 4. Insert lead
  const { error: insertError } = await supabase.from('leads').insert({
    gym_id,
    name,
    email,
    phone: phone ?? null,
    message: message ?? null,
    status: 'new',
  })

  if (insertError) {
    return NextResponse.json({ error: 'Error al guardar el mensaje' }, { status: 500 })
  }

  // 5. Send email notification (fire-and-forget — do not await so it never blocks the response)
  if (gym.email) {
    sendLeadNotification({
      gymEmail: gym.email,
      gymName: gym.name,
      lead: { name, email, phone: phone ?? null, message: message ?? null },
    }).catch((err) => console.error('sendLeadNotification unhandled:', err))
  }

  // 6. Success
  return NextResponse.json({ success: true }, { status: 201 })
}
