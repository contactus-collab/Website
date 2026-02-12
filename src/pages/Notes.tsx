import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Newsletter from '../components/Newsletter'

interface WordPressPost {
  id: number
  title: { rendered: string }
  excerpt: { rendered: string }
  date: string
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string; alt_text?: string }>
  }
}

export default function Notes() {
  const [posts, setPosts] = useState<WordPressPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchPosts() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(
          'https://blog.ballfour.org/wp-json/wp/v2/posts?_embed&per_page=100&orderby=date'
        )
        if (!res.ok) throw new Error('Failed to fetch posts')
        const data = await res.json()
        if (!cancelled) setPosts(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load notes')
          setPosts([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchPosts()
    return () => { cancelled = true }
  }, [])

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const stripHtml = (html: string): string => {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const getFeaturedImage = (post: WordPressPost): string | null => {
    return post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null
  }

  const shortenExcerpt = (text: string, maxLen = 100): string => {
    const t = text.trim()
    return t.length <= maxLen ? t : `${t.slice(0, maxLen).trim()}…`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero – same image and typography as Resources page */}
      <section className="py-12 px-4 sm:py-16">
        <div className="max-w-7xl mx-auto rounded-[32px] sm:rounded-[40px] overflow-hidden relative min-h-[320px] sm:min-h-[380px] flex items-center justify-center">
          <img
            src="/images/resources.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-105 blur-sm"
            aria-hidden
          />
          <div className="relative z-10 text-center px-6 sm:px-10 py-12 max-w-3xl mx-auto">
            <h1
              className="mb-6"
              style={{
                color: '#FFF',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '62px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '78px',
                letterSpacing: '-0.62px',
              }}
            >
              Notes
            </h1>
            <p
              style={{
                color: '#FFF',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '18px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '155%',
              }}
            >
              Discover thoughtful, easy-to-understand notes about Neurodevelopmental Disorders—written to help families, caregivers, and educators learn, connect, and feel supported every step of the way.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 px-4" style={{ backgroundColor: '#F6F3FD' }}>
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="text-center py-8 text-red-600 mb-4">{error}</div>
          )}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-gray-600">No notes yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => {
                const imageUrl = getFeaturedImage(post)
                const title = stripHtml(post.title.rendered)
                const excerpt = shortenExcerpt(stripHtml(post.excerpt.rendered))
                return (
                  <article
                    key={post.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
                  >
                    <Link
                      to={`/understand/${post.id}`}
                      className="block aspect-video w-full overflow-hidden rounded-t-xl bg-gray-100"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100" aria-hidden />
                      )}
                    </Link>
                    <div className="p-5 flex flex-col flex-grow">
                      <h2
                        className="mb-2"
                        style={{
                          color: 'var(--sds-color-text-default-default)',
                          fontFamily: '"Plus Jakarta Sans", sans-serif',
                          fontSize: '20px',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          lineHeight: 'normal',
                        }}
                      >
                        <Link to={`/understand/${post.id}`} className="hover:opacity-90">
                          {title}
                        </Link>
                      </h2>
                      <p
                        className="mb-4 flex-grow"
                        style={{
                          color: 'var(--sds-color-text-default-default)',
                          fontFamily: '"Plus Jakarta Sans", sans-serif',
                          fontSize: '16px',
                          fontStyle: 'normal',
                          fontWeight: 400,
                          lineHeight: 'normal',
                        }}
                      >
                        {excerpt}
                      </p>
                      <div className="flex items-center justify-between gap-3 pt-2">
                        <time
                          style={{
                            color: 'var(--sds-color-text-default-default)',
                            fontFamily: '"Plus Jakarta Sans", sans-serif',
                            fontSize: '16px',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            lineHeight: 'normal',
                          }}
                        >
                          {formatDate(post.date)}
                        </time>
                        <Link
                          to={`/understand/${post.id}`}
                          className="inline-flex items-center gap-1.5 hover:opacity-90"
                          style={{
                            color: 'var(--Primary-Blue, #0F006A)',
                            fontFamily: '"Plus Jakarta Sans", sans-serif',
                            fontSize: '18px',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            lineHeight: '155%',
                          }}
                        >
                          <span>Read more</span>
                          <span
                            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                            style={{ backgroundColor: '#FBCE3E' }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                              <path d="M9 18L15 12L9 6" stroke="#14008B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <Newsletter />
    </div>
  )
}
