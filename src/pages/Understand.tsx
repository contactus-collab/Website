import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

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

export default function Understand() {
  const [posts, setPosts] = useState<WordPressPost[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch posts from WordPress REST API with embedded media
      const response = await fetch(
        'https://blog.ballfour.org/wp-json/wp/v2/posts?_embed&per_page=100'
      )
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`)
      }
      
      const data = await response.json()
      // Only display posts that are clearly from WordPress (id, title.rendered, date)
      const fromWordPress = Array.isArray(data)
        ? data.filter(
            (p: unknown): p is WordPressPost =>
              p != null &&
              typeof p === 'object' &&
              'id' in p &&
              typeof (p as WordPressPost).id === 'number' &&
              (p as WordPressPost).title?.rendered != null &&
              (p as WordPressPost).date != null
          )
        : []
      setPosts(fromWordPress)
    } catch (err) {
      console.error('Error fetching WordPress posts:', err)
      setError(err instanceof Error ? err.message : 'Failed to load articles')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const decodeHtmlEntities = (text: string): string => {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    return textarea.value
  }

  const stripHtml = (html: string): string => {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const getFeaturedImage = (post: WordPressPost): string | null => {
    if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
      return post._embedded['wp:featuredmedia'][0].source_url
    }
    return null
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Loading articles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Articles</h2>
            <p className="text-red-600">{error}</p>
          </div>
          <button
            onClick={fetchPosts}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Understand
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our collection of articles and resources about Neurodevelopmental Disorders, 
            support strategies, and creating inclusive communities.
          </p>
        </div>

        {/* Articles Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No articles found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const featuredImage = getFeaturedImage(post)
              const excerpt = stripHtml(post.excerpt.rendered)

              return (
                <Link
                  key={post.id}
                  to={`/understand/${post.id}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block"
                >
                  {/* Card Header with Image */}
                  {featuredImage && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={featuredImage}
                        alt={post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || decodeHtmlEntities(post.title.rendered)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <time>{formatDate(post.date)}</time>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-primary-600 transition-colors">
                      {decodeHtmlEntities(post.title.rendered)}
                    </h2>

                    {/* Excerpt */}
                    {excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {excerpt}
                      </p>
                    )}

                    {/* Read More Link */}
                    <div className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                      <span>Read More</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

