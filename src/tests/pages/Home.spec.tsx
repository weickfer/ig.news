import { render, screen } from '@testing-library/react'
import Home, { getStaticProps } from '../../pages'
import { stripe } from '../../services/stripe'

jest.mock('../../services/stripe')

jest.mock('next/router')
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: undefined
  })
}))

describe('Home Page', () => {
  it('renders correctly', () => {
    render(<Home product={{
      amount: 'R$10,00',
      priceId: 'fake-id'
    }} />)

    expect(screen.getByText('for R$10,00 month')).toBeInTheDocument()
  })

  it('loads initial data', async () => {
    const retrieveStripePricesMocked = jest.mocked(stripe.prices.retrieve)

    retrieveStripePricesMocked.mockResolvedValueOnce({
      id: 'fake-id',
      unit_amount: 1000
    } as any)

    const staticProps = await getStaticProps({})

    expect(staticProps).toEqual(
      expect.objectContaining({
        props: {
          product: {
            priceId: 'fake-id',
            amount: '$10.00'
          }
        }
      })
    )
  })
})