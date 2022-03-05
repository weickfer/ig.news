import { stripeClient } from './../../services/stripe';
import { Readable } from 'stream'
import { NextApiRequest, NextApiResponse } from 'next'
import { Stripe } from 'stripe'
import { saveSubscription } from './_lib/manageSubscription';

async function streamToBuffer(readable: Readable) {
  const chunks = []

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    )
  }

  return Buffer.concat(chunks)
}

export const config = {
  api: {
    bodyParser: false
  }
}

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

async function getEvent(request: NextApiRequest) {
  const buffer = await streamToBuffer(request)
  const signature = request.headers['stripe-signature']

  const event = stripeClient.webhooks.constructEvent(
    buffer,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  )

  return event
}

async function WebhookRoute(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'POST') {
    return response
      .setHeader('Allow', 'POST')
      .status(405).end('Method not allowed')
  }

  try {
    const { type, data } = await getEvent(request)

    if (relevantEvents.has(type)) {
      switch (type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = data.object as Stripe.Subscription

          await saveSubscription(
            subscription.id,
            subscription.customer.toString(),
          )

          break;
        case 'checkout.session.completed':
          const checkout = data.object as Stripe.Checkout.Session

          await saveSubscription(
            checkout.subscription.toString(),
            checkout.customer.toString(),
            true
          )
          break;
        default:
          throw new Error('Unhandled event.')
      }
    }

    return response.json({ ok: true })
  } catch (error) {
    if (!((error as Error).message === 'Unhandled event.')) {
      response.statusCode = 400
    }

    return response.json({
      error: `Webhook failed: ${error.message}`
    })
  }
}

export default WebhookRoute