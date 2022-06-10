import { render, screen, fireEvent } from '@testing-library/react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

import { SubscribeButton } from '.'


jest.mock('next-auth/react')
jest.mock('next/router')

describe('SubscribeButton Component', () => {
  it('renders correctly', () => {
    const useSessionMocked = jest.mocked(useSession)

    useSessionMocked.mockReturnValueOnce({
      status: 'unauthenticated',
      data: undefined
    })

    render(<SubscribeButton />)
    
    const button = screen.getByText('Subscribe now')

    expect(button).toBeInTheDocument()
  })

  it('redirects user to sign in when not authenticated', () => {
    const mockedSignIn = jest.mocked(signIn)
    const useSessionMocked = jest.mocked(useSession)

    useSessionMocked.mockReturnValueOnce({
      status: 'unauthenticated',
      data: undefined
    })

    render(<SubscribeButton />)

    const button = screen.getByText('Subscribe now')

    fireEvent.click(button)

    expect(mockedSignIn).toHaveBeenCalled()
  })

  it('redirects user to posts when already has a subscription', () => {
    const useRouterMocked = jest.mocked(useRouter)
    const useSessionMocked = jest.mocked(useSession)
    const pushMock = jest.fn()

    useSessionMocked.mockReturnValueOnce({
      status: 'authenticated',
      data: {
        user: {
          name: 'John Doe'
        },
        activeSubscription: 'oi',
        expires: new Date().toISOString()
      }
    })

    useRouterMocked.mockReturnValueOnce({
      push: pushMock
    } as any)

    render(<SubscribeButton />)

    const button = screen.getByText('Subscribe now')
    fireEvent.click(button)

    expect(pushMock).toHaveBeenCalledWith('/posts')
  })
})