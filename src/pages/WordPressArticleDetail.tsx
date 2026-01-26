import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

interface WordPressPost {
  id: number
  title: {
    rendered: string
  }
  content: {
    rendered: string
  }
  excerpt: {
    rendered: string
  }
  date: string
  link: string
  featured_media: number
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string
      alt_text: string
    }>
  }
}

export default function WordPressArticleDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<WordPressPost | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (id) {
      fetchPost(parseInt(id))
    }
  }, [id])

  const fetchPost = async (postId: number) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `https://blog.ballfour.org/wp-json/wp/v2/posts/${postId}?_embed`
      )

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Article not found')
        }
        throw new Error(`Failed to fetch article: ${response.status}`)
      }

      const data = await response.json()
      setPost(data)
    } catch (err) {
      console.error('Error fetching WordPress post:', err)
      setError(err instanceof Error ? err.message : 'Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const decodeHtmlEntities = (text: string): string => {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    return textarea.value
  }

  const getFeaturedImage = (post: WordPressPost): string | null => {
    if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
      return post._embedded['wp:featuredmedia'][0].source_url
    }
    return null
  }

  // Handle clicks on anchor tags to use React Router
  useEffect(() => {
    if (contentRef.current) {
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('/')) {
          e.preventDefault()
          navigate(target.getAttribute('href') || '/')
        }
      }
      contentRef.current.addEventListener('click', handleClick)
      return () => {
        if (contentRef.current) {
          contentRef.current.removeEventListener('click', handleClick)
        }
      }
    }
  }, [navigate, post])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-lg text-gray-700 mb-8">
            {error || "The article you're looking for doesn't exist."}
          </p>
          <Link
            to="/understand"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Back to Understand
          </Link>
        </div>
      </div>
    )
  }

  const featuredImage = getFeaturedImage(post)

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            to="/understand"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mb-8 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Understand
          </Link>

          {/* Featured Image */}
          {featuredImage && (
            <div className="relative h-64 md:h-96 overflow-hidden rounded-xl mb-8">
              <img
                src={featuredImage}
                alt={post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || decodeHtmlEntities(post.title.rendered)}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 text-gray-500 mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time>{formatDate(post.date)}</time>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {decodeHtmlEntities(post.title.rendered)}
            </h1>
          </header>

          {/* Article Content */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div
              ref={contentRef}
              className="wordpress-content prose prose-lg max-w-none 
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-h1:text-4xl prose-h1:mt-8 prose-h1:mb-4
                prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3
                prose-h4:text-xl prose-h4:mt-4 prose-h4:mb-2
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                prose-ul:text-gray-700 prose-ul:my-4 prose-ul:pl-6
                prose-ol:text-gray-700 prose-ol:my-4 prose-ol:pl-6
                prose-li:text-gray-700 prose-li:my-2
                prose-blockquote:border-l-4 prose-blockquote:border-primary-600 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:my-6
                prose-img:rounded-lg prose-img:shadow-md prose-img:my-8 prose-img:w-full prose-img:h-auto
                prose-table:w-full prose-table:my-6 prose-table:border-collapse
                prose-th:border prose-th:border-gray-300 prose-th:px-4 prose-th:py-2 prose-th:bg-gray-100 prose-th:font-semibold prose-th:text-gray-900
                prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2 prose-td:text-gray-700
                prose-code:text-primary-700 prose-code:bg-primary-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
                prose-hr:border-gray-300 prose-hr:my-8"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />
          </div>

          {/* Call to Action */}
          <div className="mt-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
            <p className="text-xl text-primary-100 mb-6 max-w-2xl mx-auto">
              Join our community to receive more articles, resources, and updates about supporting children with Neurodevelopmental Disorders.
            </p>
            <Link
              to="/newsletter"
              className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Subscribe to Our Newsletter
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}

