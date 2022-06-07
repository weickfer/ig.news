import { render } from '@testing-library/react'
import { ActiveLink } from '.'

jest.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/',
  }),
}))

describe('ActiveLink', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <ActiveLink href="/" activeClassName="active">
        <a>Home</a>
      </ActiveLink>
    )
  
    const anchor = getByText('Home')
  
    expect(anchor).toBeInTheDocument()
  })
  
  it('adds active class if the link as current', () => {
    const { getByText } = render(
      <ActiveLink href="/" activeClassName="active">
        <a>Home</a>
      </ActiveLink>
    )
  
    const anchor = getByText('Home')
  
    expect(anchor).toHaveClass('active')
  })
})