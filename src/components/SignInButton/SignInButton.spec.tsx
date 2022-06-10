import { render } from '@testing-library/react'
import { useSession } from 'next-auth/react'

import { SignInButton } from '.'


jest.mock('next-auth/react')

describe('SignInButton  Component', () => {
  it('renders correctly when user is not authenticated', () => {
    const useSessionMocked = jest.mocked(useSession)

    useSessionMocked.mockReturnValueOnce({
      data: undefined,
      status: 'unauthenticated'
    })

    const { getByText } = render(<SignInButton />)
    const githubSignInButton = getByText('Sign in with Github')
  
    expect(githubSignInButton).toBeInTheDocument()
  })
  
  it('renders correctly when user is authenticated', () => {
    const useSessionMocked = jest.mocked(useSession)

    useSessionMocked.mockReturnValueOnce({
      data: {
        user: {
          name: 'John Doe'
        },
        expires: new Date().toString(),
      },
      status: 'authenticated'
    })

    const { getByText } = render(<SignInButton />)
  
    const signOutButtonWithUserName = getByText('John Doe')
  
    expect(signOutButtonWithUserName).toBeInTheDocument()
  })
})