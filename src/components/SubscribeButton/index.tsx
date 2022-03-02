import styles from './styles.module.scss'

interface SubscribeButtonProps {
  priceId: string
}

export function SubscribeButton({ }: SubscribeButtonProps) {
  return (
    <button type='button' className={styles.buttonContainer}>
      Subscribe now
    </button>
  )
}