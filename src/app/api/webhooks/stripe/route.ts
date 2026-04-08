import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

// Service-role client — no hay usuario autenticado en webhooks
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  const supabase = getServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const gymId = session.metadata?.gym_id
        const tier = session.metadata?.tier as 'basic' | 'pro' | undefined

        if (!gymId || !tier) break

        const subscriptionId = session.subscription as string
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const periodEnd = subscription.items.data[0]?.current_period_end ?? 0
        const expiresAt = new Date(periodEnd * 1000).toISOString()

        await supabase.from('gyms').update({
          subscription_tier: tier,
          subscription_expires_at: expiresAt,
          stripe_subscription_id: subscriptionId,
        }).eq('id', gymId)

        await supabase.from('subscription_events').insert({
          gym_id: gymId,
          stripe_event_id: event.id,
          event_type: event.type,
          payload: event.data.object,
          processed_at: new Date().toISOString(),
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        // Obtener gym_id desde la suscripción
        const { data: gym } = await supabase
          .from('gyms')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (!gym) break

        const periodEnd = subscription.items.data[0]?.current_period_end ?? 0
        const expiresAt = new Date(periodEnd * 1000).toISOString()
        const isCanceled = subscription.status === 'canceled'

        await supabase.from('gyms').update(
          isCanceled
            ? { subscription_tier: 'free', subscription_expires_at: null, stripe_subscription_id: null }
            : { subscription_expires_at: expiresAt }
        ).eq('id', gym.id)

        await supabase.from('subscription_events').insert({
          gym_id: gym.id,
          stripe_event_id: event.id,
          event_type: event.type,
          payload: event.data.object,
          processed_at: new Date().toISOString(),
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const { data: gym } = await supabase
          .from('gyms')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (!gym) break

        await supabase.from('gyms').update({
          subscription_tier: 'free',
          subscription_expires_at: null,
          stripe_subscription_id: null,
        }).eq('id', gym.id)

        await supabase.from('subscription_events').insert({
          gym_id: gym.id,
          stripe_event_id: event.id,
          event_type: event.type,
          payload: event.data.object,
          processed_at: new Date().toISOString(),
        })
        break
      }
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
