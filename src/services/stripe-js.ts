import { loadStripe } from '@stripe/stripe-js'

export function getStripeJS() {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)
}