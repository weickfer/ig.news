import { stripeClient } from './../../services/stripe';
import { Readable } from 'stream'
import { NextApiRequest, NextApiResponse } from 'next'
import { Stripe } from 'stripe'

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
  'checkout.session.completed'
])

async function WebhookRoute(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'POST') {
    return response
      .setHeader('Allow', 'POST')
      .status(405).end('Method not allowed')
  }

  const buffer = await streamToBuffer(request)
  const signature = request.headers['stripe-signature']
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event;

  try {
    event = stripeClient.webhooks.constructEvent(buffer, signature, secret)
  } catch (error) {
    return response.status(400).json({
      error: `Webhook failed: ${error.message}`
    })
  }

  if (relevantEvents.has(event.type)) {
    console.log(event)
  }

  return response.json({ ok: true })
}

export default WebhookRoute