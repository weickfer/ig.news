import { useSession, signIn } from 'next-auth/react'
import { api } from '../../services/api'
import { getStripeJSClient } from '../../services/stripe-js'
import styles from './styles.module.scss'

interface SubscribeButtonProps {
  priceId: string
}

export function SubscribeButton({ }: SubscribeButtonProps) {
  const { data: session } = useSession()

  const handleSubscribe = async () => {
    if (!session) {
      signIn('github')

      return
    }

    try {
      const response = await api.post('/subscribe')
      const { sessionId } = response.data

      const stripe = await getStripeJSClient()

      await stripe.redirectToCheckout({ sessionId })
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <button
      type='button'
      className={styles.buttonContainer}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  )
}