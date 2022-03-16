import { NextApiRequest } from "next"
import { Readable } from "stream"
import { stripe } from "../../../services/stripe"

async function streamToBuffer(readable: Readable) {
  const chunks = []

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    )
  }

  return Buffer.concat(chunks)
}

export async function validateStripeRequest(request: NextApiRequest) {
  const buffer = await streamToBuffer(request)
  const signature = request.headers['stripe-signature']

  const event = stripe.webhooks.constructEvent(
    buffer,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  )

  return event
}