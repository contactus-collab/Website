import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import JoinUsSection from '../components/JoinUsSection'
import Newsletter from '../components/Newsletter'

interface WordPressPost {
  id: number
  title: { rendered: string }
  excerpt: { rendered: string }
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>
  }
}

function stripHtml(html: string): string {
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

interface Book {
  title: string
  author: string
  buyLink: string
  description?: string
}

interface PodcastLink {
  label: string
  url: string
}

interface Podcast {
  title: string
  description: string
  host?: string
  links: PodcastLink[]
}

export default function Resources() {
  const [latestNotes, setLatestNotes] = useState<WordPressPost[]>([])
  const [notesLoading, setNotesLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchLatest() {
      try {
        setNotesLoading(true)
        const res = await fetch(
          'https://blog.ballfour.org/wp-json/wp/v2/posts?_embed&per_page=3&orderby=date'
        )
        if (!res.ok) throw new Error('Failed to fetch posts')
        const data = await res.json()
        if (!cancelled) setLatestNotes(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setLatestNotes([])
      } finally {
        if (!cancelled) setNotesLoading(false)
      }
    }
    fetchLatest()
    return () => { cancelled = true }
  }, [])

  const getFeaturedImage = (post: WordPressPost): string => {
    const url = post._embedded?.['wp:featuredmedia']?.[0]?.source_url
    return url || '/images/Purpose_Image.jpeg'
  }

  const books: Book[] = [
    {
      title: 'Uniquely Human: A Different Way of Seeing Autism',
      author: 'Barry M. Prizant, Ph.D.',
      buyLink: 'https://www.amazon.com/dp/0399185615',
      description: 'A compassionate perspective on autism that shifts focus from "fixing" to understanding and empowerment.',
    },
    {
      title: 'The Explosive Child: A New Approach for Understanding and Parenting Easily Frustrated, Chronically Inflexible Children',
      author: 'Ross W. Greene, Ph.D.',
      buyLink: 'https://www.amazon.com/dp/0062840835',
      description: 'Offers actionable strategies for parenting kids with emotional intensity and self-regulation challenges.',
    },
    {
      title: 'The Whole-Brain Child',
      author: 'Daniel J. Siegel & Tina Payne Bryson',
      buyLink: 'https://www.amazon.com/dp/0553386697',
      description: 'Uses neuroscience to help parents nurture children\'s developing emotional and cognitive skills.',
    },
    {
      title: 'NeuroTribes: The Legacy of Autism and the Future of Neurodiversity',
      author: 'Steve Silberman',
      buyLink: 'https://www.amazon.com/dp/0399185615',
      description: 'A broader historical and cultural understanding of autism and neurodiversity.',
    },
    {
      title: 'The Essential Guide to Neurodevelopmental Disorders',
      author: 'Desmond Gahan',
      buyLink: 'https://www.barnesandnoble.com/w/the-essential-guide-to-neurodevelopmental-disorders-desmond-gahan/1144152293',
      description: 'Introductory resource explaining ADHD, autism, and other neurodevelopmental conditions.',
    },
  ]

  const podcasts: Podcast[] = [
    {
      title: 'The Autism ADHD Podcast',
      description: 'A neurodiversity-affirming show offering practical tips for supporting autistic and ADHD children\'s emotional regulation, social skills, school life, and more — with real stories and expert insight.',
      links: [
        { label: 'Apple Podcasts', url: 'https://podcasts.apple.com/us/podcast/the-autism-adhd-podcast/id1485255815' },
        { label: 'iHeart', url: 'https://www.iheart.com/podcast/263-the-autism-adhd-podcast-145257676/' },
      ],
    },
    {
      title: 'Beautifully Complex Podcast',
      description: 'Focused on parenting children with ADHD, autism, anxiety, and sensory and learning differences — offering empathetic support and relatable conversations for families.',
      links: [
        { label: 'Listen Here', url: 'https://parentingadhdandautism.com/parenting-adhd-podcast/' },
      ],
    },
    {
      title: 'Parenting Autism and ADHD',
      description: 'A podcast designed to guide parents and carers through real challenges like school attendance, sensory needs, and behaviour — with practical advice and community perspective.',
      links: [
        { label: 'Spotify', url: 'https://open.spotify.com/show/4vvcLehxOgtZJgVOovNXjd' },
      ],
    },
    {
      title: 'Every Brain is Different',
      description: 'Designed for parents raising kids with autism, ADHD, and other neurodiverse conditions — featuring expert insights, tools, and community support for helping children thrive.',
      links: [
        { label: 'Apple Podcasts', url: 'https://podcasts.apple.com/us/podcast/autistic-and-adhd-kids-parenting-strategies-every/id1697406719' },
      ],
    },
    {
      title: 'The Neurodiversity Podcast',
      description: 'Explores neurodiversity from multiple angles including psychology, education, and social support — helpful for deeper learning about inclusive perspectives and strategies.',
      links: [
        { label: 'Listen Here', url: 'https://neurodiversitypodcast.com/home/' },
      ],
    },
  ]

  const podcastColorIndices = useMemo(() => {
    const indices = Array.from({ length: podcasts.length }, (_, i) => i % 3)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    return indices
  }, [podcasts.length])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section – rounded container, blurred background + dark blue overlay, centered text */}
      <section className="py-12 px-4 sm:py-16">
        <div className="max-w-7xl mx-auto rounded-[32px] sm:rounded-[40px] overflow-hidden relative min-h-[320px] sm:min-h-[380px] flex items-center justify-center">
          {/* Blurred background image */}
          <img
            src="/images/resources.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-105 blur-sm"
            aria-hidden
          />
          {/* Dark blue semi-transparent overlay */}
          <div
            className="absolute inset-0 z-0"
            
            aria-hidden
          />
          {/* Centered content */}
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
              Thought Leaders
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
              Discover the best books, online resources, podcasts, etc from experts, advocates, and families on Neurodevelopmental Disorders (ND). Ball Four Foundation exists as the trusted support on your journey.
            </p>
          </div>
        </div>
      </section>

      {/* Books for Parents & Caregivers – pill, heading, intro, grid of cards */}
      <section className="py-12 px-4 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <span
            className="inline-flex h-[32px] items-center justify-center rounded-[50px] px-4 text-sm font-bold mb-4"
            style={{ backgroundColor: '#ECE6FE', color: '#4E288E' }}
          >
            Books
          </span>
          <h2
            className="mb-4"
            style={{
              color: '#000',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '44px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '65px',
              letterSpacing: '-0.44px',
            }}
          >
            Books for Parents & Caregivers
          </h2>
          <p
            className="mb-10 max-w-4xl"
            style={{
              color: 'var(--sds-color-text-default-default)',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '18px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '155%',
            }}
          >
            On our Resources page, we offer an evolving collection of vetted resources that include the best books about neurodevelopmental disorders (ND), podcasts, and live events for families of children with NDs. Get answers to your questions, hear from people who have faced similar challenges, and find ways to get involved in your community.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book, index) => (
              <div
                key={index}
                className="rounded-xl flex flex-col self-stretch"
                style={{
                  backgroundColor: '#F9F7FE',
                  padding: '25px',
                  flex: '1 0 0',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <h3
                  className="mb-3 flex-grow-0"
                  style={{
                    color: 'var(--sds-color-text-default-default)',
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontSize: '20px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: 'normal',
                  }}
                >
                  {book.title}
                </h3>
                {book.description && (
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
                    {book.description}
                  </p>
                )}
                <div className="flex w-full items-center justify-between gap-4 mt-auto pt-2">
                  <p
                    className="text-[#1E1E1E] font-normal"
                    style={{
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: '15px',
                    }}
                  >
                    {book.author}
                  </p>
                  <a
                    href={book.buyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-[50px] shrink-0 items-center justify-center rounded-full bg-[#0F006A] px-8 font-normal text-white shadow-md transition-opacity hover:opacity-90 hover:shadow-lg text-base"
                  >
                    Buy now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Podcasts for Parents & Caregivers – pill, heading, intro, Listen More, colored cards */}
      <section className="py-12 px-4 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <span
            className="inline-flex h-[32px] items-center justify-center rounded-[50px] px-4 text-sm font-bold mb-4"
            style={{ backgroundColor: '#ECE6FE', color: '#4E288E' }}
          >
            Podcast
          </span>
          <div className="mb-10">
            <h2
              className="mb-4"
              style={{
                color: '#000',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '44px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '65px',
                letterSpacing: '-0.44px',
              }}
            >
              Podcasts for Parents & Caregivers
            </h2>
            <p
              className="max-w-4xl"
              style={{
                color: 'var(--sds-color-text-default-default)',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '18px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '155%',
              }}
            >
              High-quality podcasts offering practical tips, expert insights, and community support for parents and caregivers supporting children with autism, ADHD, and broader neurodiversity.
            </p>
          </div>

          <div id="podcasts-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {podcasts.map((podcast, index) => {
              const cardColors = [
                { bg: '#1A0F49' },
                { bg: '#FBCE3E' },
                { bg: '#7DD3C0' },
              ]
              const card = cardColors[podcastColorIndices[index]]
              const isDark = card.bg === '#1A0F49'
              const textAndButtonColor = isDark ? '#FFF' : '#0F006A'
              const firstLink = podcast.links[0]
              return (
                <div
                  key={index}
                  className="rounded-xl flex flex-col self-stretch"
                  style={{
                    backgroundColor: card.bg,
                    padding: '25px',
                    flex: '1 0 0',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div className="flex-grow min-w-0">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[10px] bg-white shadow-sm">
                      <svg className="h-6 w-6 text-[#1A0F49]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <h3
                      className="mb-3 font-medium"
                      style={{
                        color: textAndButtonColor,
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                        fontSize: '20px',
                        fontStyle: 'normal',
                        fontWeight: 500,
                        lineHeight: 'normal',
                      }}
                    >
                      {podcast.title}
                    </h3>
                    <p
                      className="flex-grow"
                      style={{
                        color: textAndButtonColor,
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                        fontSize: '16px',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        lineHeight: 'normal',
                        opacity: isDark ? 0.95 : 1,
                      }}
                    >
                      {podcast.description}
                    </p>
                  </div>
                  {firstLink && (
                    <a
                      href={firstLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex h-[50px] w-full items-center justify-center rounded-full border-2 bg-transparent font-normal transition-opacity hover:opacity-90 text-base"
                      style={{
                        borderColor: textAndButtonColor,
                        color: textAndButtonColor,
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                      }}
                    >
                      Listen here
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Latest Notes – white container on light purple, Articles pill, 3 article cards */}
      <section className="py-12 px-4 sm:py-16">
        <div className="max-w-7xl mx-auto overflow-hidden shadow-lg p-8 md:p-10 lg:p-12" style={{ borderRadius: '25px', background: '#F6F3FD' }}>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div>
              <span
                className="inline-flex h-[32px] items-center justify-center rounded-[50px] px-4 text-sm font-bold mb-4"
                style={{ backgroundColor: '#ECE6FE', color: '#4E288E' }}
              >
                Articles
              </span>
              <h2
                className="mb-3"
                style={{
                  color: '#000',
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: '44px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '65px',
                  letterSpacing: '-0.44px',
                }}
              >
                Latest Notes
              </h2>
              <p
                className="max-w-2xl"
                style={{
                  color: 'var(--sds-color-text-default-default)',
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '155%',
                }}
              >
                Discover articles and insights about Neurodevelopmental Disorders (ND) that support your journey and help children thrive.
              </p>
            </div>
            <Link
              to="/understand"
              className="flex h-[50px] shrink-0 items-center justify-center rounded-full bg-[#0F006A] px-8 font-normal text-white shadow-md transition-opacity hover:opacity-90 hover:shadow-lg text-base w-fit"
            >
              View all Notes
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {notesLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl overflow-hidden bg-gray-100 animate-pulse">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-4/5" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-10 w-28 bg-gray-200 rounded-full mt-4" />
                  </div>
                </div>
              ))
            ) : (
              latestNotes.map((post) => (
                <div key={post.id} className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-md flex flex-col">
                  <img
                    src={getFeaturedImage(post)}
                    alt=""
                    className="w-full aspect-video object-cover"
                  />
                  <div className="p-5 flex flex-col flex-grow">
                    <h3
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
                      {stripHtml(post.title.rendered)}
                    </h3>
                    <p
                      className="mb-4 flex-grow"
                      style={{
                        color: 'var(--sds-color-text-default-default)',
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                        fontSize: '16px',
                        fontWeight: 400,
                        lineHeight: 'normal',
                      }}
                    >
                      {(() => {
                        const text = stripHtml(post.excerpt.rendered)
                        return text.length > 100 ? `${text.slice(0, 100).trim()}…` : text
                      })()}
                    </p>
                    <Link
                      to={`/understand/${post.id}`}
                      className="inline-flex h-[50px] w-fit items-center justify-center rounded-full bg-[#0F006A] px-6 font-normal text-white transition-opacity hover:opacity-90 text-sm"
                    >
                      Read more
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Join Us in Making a Difference – same as Home */}
      <JoinUsSection />

      {/* Newsletter – same as Home (dark two-column section) */}
      <Newsletter />
    </div>
  )
}
