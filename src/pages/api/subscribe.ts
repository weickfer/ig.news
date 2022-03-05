import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

import { faunaClient, q } from './../../services/fauna';
import { stripeClient } from '../../services/stripe'

type User = {
  ref: { id: string }
  data: {
    stripe_customer_id: string
  }
}

async function SubscriptionRoute(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'POST') {
    return response
      .setHeader('Allow', 'POST')
      .status(405).end('Method not allowed')
  }

  const session = await getSession({ req: request })

  const user = await faunaClient.query<User>(
    q.Get(
      q.Match(
        q.Index('user_by_email'),
        q.Casefold(session.user.email)
      )
    )
  )

  let stripeCustomerId: string;

  if (!user.data.stripe_customer_id) {
    const stripeCustomer = await stripeClient.customers.create({
      email: session.user.email,
      // metadata: {}
    })

    await faunaClient.query(
      q.Update(
        q.Ref(q.Collection('users'), user.ref.id),
        {
          data: {
            stripe_customer_id: stripeCustomer.id
          }
        }
      )
    )

    stripeCustomerId = stripeCustomer.id
  }

  const checkoutSession = await stripeClient.checkout.sessions.create({
    customer: stripeCustomerId,
    success_url: process.env.STRIPE_SUCCESS_URL,
    cancel_url: process.env.STRIPE_CANCEL_URL,
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    line_items: [
      {
        price: 'price_1KYZoTKpVySo3swf4BAeBj7d',
        quantity: 1,
      }
    ],
    mode: 'subscription',
    allow_promotion_codes: true,
  })

  return response.status(200).json({ sessionId: checkoutSession.id })
}

export default SubscriptionRoute;