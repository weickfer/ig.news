import { render, screen } from '@testing-library/react'
import exp from 'constants'
import { getSession } from 'next-auth/react'

import Post, { getServerSideProps } from '../../pages/posts/[slug]'
import { getPrismicClient } from '../../services/prismic'

jest.mock('next-auth/react')
jest.mock('../../services/prismic')

const testPost = {
  slug: 'my-test-post',
  title: 'Test Post',
  content: '<p>The Test post has a content with too many loose words</p>',
  updatedAt: '12 de fevereiro',
}

describe('Post Page', () => {
  it('renders correctly', () => {
    render(<Post post={testPost}/>)

    expect(screen.getByText('Test Post')).toBeInTheDocument()
    expect(
      screen.getByText('The Test post has a content with too many loose words')
    ).toBeInTheDocument()
  })

  it('redirects user if no subscription is found', async () => {
    const getSessionMocked = jest.mocked(getSession)

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: undefined,
    } as any)

    const response = await getServerSideProps({
      req: {
        cookies: {}
      },
      params: {
        slug: ''
      },
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        redirect: {
          destination: '/',
          permanent: false
        }
      })
    )
  })

  it('loads initial data', async () => {
    const getSessionMocked = jest.mocked(getSession)
    const prismicClientMocked = jest.mocked(getPrismicClient)

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription',
    } as any)

    prismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            { type: 'heading', text: 'Test Post' }
          ],
          content: [
            { type: 'paragraph', text: 'The Test post has a content with too many loose words' }
          ]
        },
        last_publication_date: '02-12-2020'
      })
    } as any)

    const response = await getServerSideProps({ 
      params: { slug: 'my-test-post' } 
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: expect.objectContaining({
            slug: 'my-test-post'
          })
        }
      })
    )
  })
})