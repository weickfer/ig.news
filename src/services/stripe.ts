import Stripe from 'stripe'
import { version } from '../../package.json'

export const stripeClient = new Stripe(process.env.STRIPE_PRIVATE_KEY, {
  apiVersion: '2020-08-27', // dd/mm/aaaa yyyy/mm/dd
  appInfo: {
    name: 'ig.news',
    version,
  }
})