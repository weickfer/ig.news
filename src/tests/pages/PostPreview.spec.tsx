import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

import PostPreview, { getStaticProps } from '../../pages/posts/preview/[slug]'
import { getPrismicClient } from '../../services/prismic'

jest.mock('next-auth/react')
jest.mock('next/router')
jest.mock('../../services/prismic')

const testPost = {
  slug: 'my-test-post',
  title: 'Test Post',
  content: '<p>The Test post has a content with too many loose words</p>',
  updatedAt: '12 de fevereiro',
}

describe('Post Preview Page', () => {
  it('renders correctly', () => {
    const useSessionMocked = jest.mocked(useSession)

    useSessionMocked.mockReturnValueOnce({
      status: 'unauthenticated',
      data: undefined
    })

    render(<PostPreview post={testPost}/>)

    expect(screen.getByText('Test Post')).toBeInTheDocument()
    expect(
      screen.getByText('The Test post has a content with too many loose words')
    ).toBeInTheDocument()
    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument()
  })

  it('redirects user to complete post if subscription has active', () => {
    const useSessionMocked = jest.mocked(useSession)
    const useRouterMocked = jest.mocked(useRouter)
    const pushMocked = jest.fn()

    useSessionMocked.mockReturnValueOnce({
      status: 'authenticated',
      data: {
        expires: 'fake-date',
        activeSubscription: 'fake-subscription'
      }
    })

    useRouterMocked.mockReturnValueOnce({
      push: pushMocked,
    } as any)

    render(<PostPreview post={testPost}/>)

    expect(pushMocked).toHaveBeenCalledWith(`/posts/my-test-post`)
  })

  it('loads initial data', async () => {
    const prismicClientMocked = jest.mocked(getPrismicClient)

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

    const response = await getStaticProps({ 
      params: { slug: 'my-test-post' }
    })

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