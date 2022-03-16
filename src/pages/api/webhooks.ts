import { NextApiRequest, NextApiResponse } from 'next';
import { Stripe } from 'stripe';
import { UnhandledEventError } from './_lib/errors/UnhandledEventError';
import { saveSubscription } from './_lib/manageSubscription';
import { validateStripeRequest } from './_lib/validateStripeRequest';

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

async function WebhookRoute(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'POST') {
    return response
      .setHeader('Allow', 'POST')
      .status(405).end('Method not allowed')
  }

  try {
    const { type, data } = await validateStripeRequest(request)

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
          throw new UnhandledEventError()
      }
    }

    return response.json({ ok: true })
  } catch (error) {
    if (!(error instanceof UnhandledEventError)) {
      response.statusCode = 400
    }

    return response.json({
      error: `Webhook failed: ${error.message}`
    })
  }
}

export default WebhookRoute