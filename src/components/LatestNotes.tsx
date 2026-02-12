import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const WORDPRESS_API = 'https://blog.ballfour.org/wp-json/wp/v2/posts?_embed&per_page=3'

interface WordPressPost {
  id: number
  title: { rendered: string }
  excerpt: { rendered: string }
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>
  }
}

function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

function stripHtml(html: string): string {
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export default function LatestNotes() {
  const [posts, setPosts] = useState<WordPressPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(WORDPRESS_API)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch posts')
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setPosts(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const getFeaturedImage = (post: WordPressPost): string | null => {
    return post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header: Latest posts (left) + All blog posts (right) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          <h2 className="font-sans text-2xl sm:text-3xl lg:text-[44px] lg:leading-[65px] lg:tracking-[-0.44px] font-medium text-[#000]">
            Latest posts
          </h2>
          <Link
            to="/understand"
            className="flex h-[50px] items-center justify-center shrink-0 bg-[#0F006A] text-[#FFF] px-10 rounded-full font-normal hover:opacity-90 transition-opacity text-base"
          >
            All blog posts
          </Link>
        </div>

        {/* Article cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-[25px] overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-6 space-y-3 bg-[#F6F3FD] rounded-b-[25px]">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-10 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-[var(--sds-color-text-default-default)] text-center py-8">
            Unable to load latest posts. Try again later.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => {
              const imageUrl = getFeaturedImage(post)
              const title = decodeHtmlEntities(post.title.rendered)
              const excerpt = stripHtml(post.excerpt.rendered)
              return (
                <article
                  key={post.id}
                  className="rounded-[25px] overflow-hidden flex flex-col"
                >
                  <Link to={`/understand/${post.id}`} className="block aspect-video bg-gray-100 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt=""
                        className="w-full h-full object-cover rounded-t-[25px]"
                      />
                    ) : (
                      <div className="w-full h-full rounded-t-[25px] bg-gray-200" />
                    )}
                  </Link>
                  <div className="p-6 flex flex-col flex-1 bg-[#F6F3FD] rounded-b-[25px]">
                    <h3 className="font-sans text-[18px] font-semibold leading-normal text-[#000] mb-2 line-clamp-2">
                      <Link to={`/understand/${post.id}`} className="hover:underline">
                        {title}
                      </Link>
                    </h3>
                    <p className="font-sans text-[18px] font-normal leading-[155%] text-[var(--sds-color-text-default-default)] flex-1 line-clamp-3">
                      {excerpt}
                    </p>
                    <Link
                      to={`/understand/${post.id}`}
                      className="inline-flex items-center justify-center mt-4 w-fit bg-[#0F006A] text-[#FFF] px-6 py-3 rounded-full font-normal hover:opacity-90 transition-opacity text-base"
                    >
                      Read more
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
