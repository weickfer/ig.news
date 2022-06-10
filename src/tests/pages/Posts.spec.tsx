import { render, screen } from '@testing-library/react'
import Post, { getStaticProps } from '../../pages/posts'
import { getPrismicClient } from '../../services/prismic'

jest.mock('../../services/prismic')

const testPost = {
  slug: 'my-test-post',
  title: 'Test Post',
  excerpt: 'The Test post has a content with too many loose words',
  updatedAt: '12 de fevereiro de 2020',
}

describe('Posts Page', () => {
  it('renders correctly', () => {
    render(<Post posts={[testPost]}/>)

    expect(screen.getByText('Test Post')).toBeInTheDocument()
  })

  it('loads initial data', async () => {
    const prismicClientMocked = jest.mocked(getPrismicClient)

    prismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'my-test-post',
            data: {
              title: [
                { type: 'heading', text: 'Test Post' }
              ],
              content: [
                { type: 'paragraph', text: 'The Test post has a content with too many loose words' }
              ]
            },
            last_publication_date: '02-12-2020'
          }
        ]
      })
    } as any)

    const staticProps = await getStaticProps({})

    expect(staticProps).toEqual(
      expect.objectContaining({
        props: {
          posts: [testPost]
        }
      })
    )
  })
})