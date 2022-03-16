import Prismic from '@prismicio/client'

export const PrismicPredicates = Prismic.Predicates

export function getPrismicClient(req?: unknown) {
  const prismic = Prismic.client(
    process.env.PRISMIC_ENDPOINT,
    {
      accessToken: process.env.PRISMIC_ACCESS_TOKEN,
      req
    }
  )

  return prismic
}

// Handlers
type Post = {
  title: string,
  content: Array<{
    type: string
    text: string
  }>
}

export async function getManyPosts(req?: unknown, pageSize = 100) {
  const prismic = getPrismicClient(req)
  const response = await prismic.query<Post>([
    PrismicPredicates.at('document.type', 'post'),
  ], {
    fetch: ['post.title', 'post.content'],
    pageSize,
  })

  return response
}

export async function getOnePost(uid: string) {
  const prismic = getPrismicClient()
  const response = await prismic.getByUID<Post>('post', uid, {})

  return response
}
