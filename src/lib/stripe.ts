import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
})

// Price IDs de los planes (se rellenarán con los reales desde el dashboard de Stripe)
export const STRIPE_PRICES = {
  basic: process.env.STRIPE_PRICE_BASIC ?? '',
  pro: process.env.STRIPE_PRICE_PRO ?? '',
} as const

export type SubscriptionTier = 'free' | 'basic' | 'pro'
