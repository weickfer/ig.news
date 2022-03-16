import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { RichText } from 'prismic-dom'
import { getPrismicClient, PrismicPredicates } from '../../services/prismic'
import styles from '../../styles/pages/PostsExplorer.module.scss'


interface PostsExplorerProps {
  posts: Array<{
    slug: string;
    title: string;
    excerpt: string;
    updatedAt: string;
  }>
}

export default function PostsExplorer({ posts }: PostsExplorerProps) {
  return (
    <>
      <Head>
        <title>Posts Explorer | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {
            posts.map(post => (
              <Link key={post.slug} href={`/posts/${post.slug}`}>
                <a>
                  <time>{post.updatedAt}</time>
                  <strong>{post.title}</strong>
                  <p>{post.excerpt}</p>
                </a>
              </Link>
            ))
          }
        </div>
      </main>
    </>
  )
}

type Post = {
  title: string,
  content: Array<{
    type: string
    text: string
  }>
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient()
  const response = await prismic.query<Post>([
    PrismicPredicates.at('document.type', 'post'),
  ], {
    fetch: ['post.title', 'post.content'],
    pageSize: 100,
  })

  const posts = response.results.map(post => ({
    slug: post.uid,
    title: RichText.asText(post.data.title),
    excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
    updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }))

  return {
    props: { posts },
    revalidate: 60 * 60 // 1 hour
  }
}
