import { loadStripe } from '@stripe/stripe-js'

export function getStripeJSClient() {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)
}