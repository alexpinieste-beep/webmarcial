'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_PRICES } from '@/lib/stripe'
import type { SubscriptionTier } from '@/lib/stripe'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function createCheckoutSession(tier: Exclude<SubscriptionTier, 'free'>) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: gym } = await supabase
    .from('gyms')
    .select('id, name, stripe_customer_id')
    .eq('owner_id', user.id)
    .single()

  if (!gym) redirect('/registro-gimnasio')

  // Crear o recuperar Stripe customer
  let stripeCustomerId = gym.stripe_customer_id as string | null

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: gym.name,
      metadata: { gym_id: gym.id },
    })
    stripeCustomerId = customer.id

    await supabase
      .from('gyms')
      .update({ stripe_customer_id: stripeCustomerId })
      .eq('id', gym.id)
  }

  const priceId = STRIPE_PRICES[tier]
  if (!priceId) {
    // Price IDs no configurados todavía — redirigir con error
    redirect('/dashboard/suscripcion?error=price_not_configured')
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/dashboard/suscripcion?success=true`,
    cancel_url: `${APP_URL}/dashboard/suscripcion?cancelled=true`,
    metadata: { gym_id: gym.id, tier },
    locale: 'es',
  })

  redirect(session.url!)
}

export async function createBillingPortalSession() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: gym } = await supabase
    .from('gyms')
    .select('stripe_customer_id')
    .eq('owner_id', user.id)
    .single()

  if (!gym?.stripe_customer_id) {
    redirect('/dashboard/suscripcion')
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: gym.stripe_customer_id as string,
    return_url: `${APP_URL}/dashboard/suscripcion`,
  })

  redirect(portalSession.url)
}
