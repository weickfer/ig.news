import { render } from '@testing-library/react'
import { Header } from '.'

jest.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/',
  }),
}))

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: undefined }),
}))

describe('Header Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Header />)
  
    const homeAnchor = getByText('Home')
    const postsAnchor = getByText('Posts')
  
    expect(homeAnchor).toBeInTheDocument()
    expect(postsAnchor).toBeInTheDocument()
  })
})