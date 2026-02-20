import { useEffect, useState } from 'react'
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

export default function Purpose() {
  const [latestArticles, setLatestArticles] = useState<WordPressPost[]>([])
  const [articlesLoading, setArticlesLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchLatest() {
      try {
        setArticlesLoading(true)
        const res = await fetch(
          'https://blog.ballfour.org/wp-json/wp/v2/posts?_embed&per_page=3&orderby=date'
        )
        if (!res.ok) throw new Error('Failed to fetch posts')
        const data = await res.json()
        if (!cancelled) setLatestArticles(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setLatestArticles([])
      } finally {
        if (!cancelled) setArticlesLoading(false)
      }
    }
    fetchLatest()
    return () => { cancelled = true }
  }, [])

  const cards = [
    {
      title: 'Spreading the Word',
      description: 'Sharing articles, books, podcasts, and other educational resources about Neurodevelopmental Disorders (ND) that keep families informed about the latest research and treatment options.',
    },
    {
      title: 'Advocating for Change',
      description: 'Leading the charge for a more inclusive world by increasing access to Neurodevelopmental Disorders (ND) assessments, therapy options, and employment opportunities.',
    },
    {
      title: 'Creating Opportunities to Be Seen and Heard',
      description: 'Sponsoring dance, art, sports, and other performance-based activities that give kids with Neurodevelopmental Disorders (ND) the opportunity to develop their talents and take center stage.',
    },
  ]

  const getFeaturedImage = (post: WordPressPost): string => {
    const url = post._embedded?.['wp:featuredmedia']?.[0]?.source_url
    return url || '/images/Purpose_Image.jpeg'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section – reduced height, compressed image column */}
      <section className="bg-white flex flex-col">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div
            className="rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-xl"
            style={{
              background: 'linear-gradient(180deg, #E8E4F7 0%, #F8F7FC 50%, #FFFFFF 100%)',
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-5 sm:p-6 lg:p-8 items-center">
            {/* Left – headline, paragraph, button */}
            <div className="order-2 lg:order-1">
              <h1
                className="mb-4 text-3xl sm:text-4xl lg:text-[44px] lg:leading-[58px]"
                style={{
                  color: 'var(--Primary-Blue, #0F006A)',
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  letterSpacing: '-0.62px',
                }}
              >
                <span style={{ color: '#000' }}>Creating a World</span>
                <br />
                <span style={{ color: '#000' }}>Where</span>{' '}
                <span>All Can Thrive</span>
              </h1>
              <p
                className="mb-6 max-w-xl"
                style={{
                  color: 'var(--sds-color-text-default-default)',
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: '18px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '155%',
                }}
              >
                The first step is raising awareness around Neurodevelopmental Disorders (ND). We do that through education, advocacy, and event sponsorship that offers kids with neurodevelopmental disorders the chance to shine.
              </p>
              <Link
                to="/resources"
                className="inline-block bg-[#0F006A] text-[#FFF] px-10 py-4 rounded-full font-normal hover:opacity-90 transition-opacity shadow-md hover:shadow-lg text-base"
              >
                Explore our resources
              </Link>
            </div>

            {/* Right – 4-image collage, compressed height (shorter aspect ratio) */}
            <div className="order-1 lg:order-2 grid grid-cols-2 gap-2 sm:gap-3">
              <img
                src="/images/Purpose_Image.jpeg"
                alt=""
                className="w-full aspect-[4/3] object-cover rounded-[2rem_3rem_1.5rem_2.5rem]"
              />
              <img
                src="/images/purpose.jpeg"
                alt=""
                className="w-full aspect-[4/3] object-cover rounded-[3rem_1.5rem_2.5rem_2rem] mt-2 sm:mt-3"
              />
              <img
                src="/images/Hero_Image.jpeg"
                alt=""
                className="w-full aspect-[4/3] object-cover rounded-[1.5rem_2rem_3rem_1.5rem] -mt-1 sm:-mt-2"
              />
              <img
                src="/images/Image.png"
                alt=""
                className="w-full aspect-[4/3] object-cover rounded-[2.5rem_1.5rem_2rem_3rem] mt-1 sm:mt-2"
              />
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story – full-container image with yellow box overlay on top */}
      <section className="py-12 px-4 sm:py-16">
        <div className="max-w-7xl mx-auto overflow-hidden rounded-[24px] sm:rounded-[28px] shadow-lg relative aspect-[16/9] sm:aspect-[21/9] min-h-[240px] sm:min-h-[280px] bg-gray-100">
          {/* Full-container image */}
          <img
            src="/images/Container.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Our Story – overlay on top of image, vertically centered, left margin */}
          <div
            className="absolute left-4 sm:left-6 right-4 sm:right-auto top-1/2 -translate-y-1/2 w-auto sm:w-[608px] max-w-[calc(100%-2rem)] flex flex-col items-start gap-[10px] rounded-[25px] py-[34px] px-[26px]"
            style={{ backgroundColor: '#FBCE3E' }}
          >
            <span
              className="inline-flex w-fit h-[32px] items-center justify-center rounded-[50px] px-4 text-sm font-medium"
              style={{ backgroundColor: '#EBE8FD', color: 'var(--Primary-Blue, #0F006A)' }}
            >
              Our Story
            </span>
            <p
              className="max-w-full"
              style={{
                color: 'var(--sds-color-text-default-default)',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '18px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '155%',
              }}
            >
              With one in 36 kids on the spectrum, Neurodevelopmental Disorders (ND) are a growing issue affecting families across the US — with many not getting the support they need. The Ball Four Foundation was created to bridge the gaps in awareness and care about Neurodevelopmental Disorders (ND), so that families can find the books about them and the resources they need, young people can reach their full potential, and together we can create a more inclusive world for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission + What We Do – match reference layout */}
      <section className="py-12 px-4 sm:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Our Mission – pill + statement on white */}
          <div className="mb-10">
            <span
              className="inline-flex h-[32px] items-center justify-center rounded-[50px] px-4 text-sm font-medium mb-4"
              style={{ backgroundColor: '#E0D7FC', color: '#4A2B8A' }}
            >
              Our Mission
            </span>
            <h2
              className="w-full"
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
              The Ball Four Foundation raises awareness for Neurodevelopmental Disorders (ND) through education and advocacy as well as by sponsoring performance-based activities for kids with disabilities.
            </h2>
          </div>

          {/* What We Do – dark container, 3 columns */}
          <div
            className="rounded-[25px] p-8 sm:p-10 lg:p-12 flex flex-col gap-10"
            style={{ backgroundColor: '#1A0F49' }}
          >
            <div className="flex flex-col gap-2">
              <h2
                className="max-w-2xl"
                style={{
                  color: 'var(--sds-color-text-neutral-on-neutral)',
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: '44px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '65px',
                  letterSpacing: '-0.44px',
                }}
              >
                What We Do
              </h2>
              <p
                className="max-w-2xl"
                style={{
                  color: 'var(--sds-color-text-neutral-on-neutral)',
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: '18px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '155%',
                }}
              >
                Our comprehensive approach to supporting children with Neurodevelopmental Disorders and their families.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
              {cards.map((card, index) => (
                <div key={index} className="flex flex-col items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] bg-[#FFF] shadow-md">
                    <svg className="h-7 w-7 text-[#1A0F49]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="font-sans text-xl font-bold text-white" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                    {index === 2 ? 'Creating Opportunities' : card.title}
                  </h3>
                  <p
                    style={{
                      color: 'var(--sds-color-text-neutral-on-neutral)',
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: '18px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '155%',
                    }}
                  >
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Education + Resources for Families – pill, heading, paragraph + button, then 2 cards */}
      <section className="py-12 px-4 sm:py-16">
        <div className="max-w-7xl mx-auto rounded-2xl overflow-hidden p-8 md:p-10 lg:p-12" style={{ backgroundColor: '#F6F3FD' }}>
          {/* Top: Resources pill, heading, paragraph + button row */}
          <div className="mb-10">
            <span
              className="inline-flex h-[32px] items-center justify-center rounded-[50px] px-4 text-sm font-medium mb-4"
              style={{ backgroundColor: '#E0D7FC', color: '#4A2B8A' }}
            >
              Resources
            </span>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="lg:max-w-[65%]">
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
                  Education + Resources for Families Living with NDs
                </h2>
                <p
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
              </div>
              <div className="shrink-0">
                <Link
                  to="/resources"
                  className="inline-block bg-[#0F006A] text-[#FFF] px-10 py-4 rounded-full font-normal hover:opacity-90 transition-opacity shadow-md hover:shadow-lg text-base"
                >
                  Explore our resources
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom: latest 3 articles from Understand (WordPress) – Read more → individual article */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articlesLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="rounded-[10px] overflow-hidden bg-[#FFF] shadow-md flex flex-col animate-pulse">
                  <div className="w-full aspect-[16/10] bg-gray-200" />
                  <div className="p-6 flex flex-col flex-grow gap-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-9 w-24 bg-gray-200 rounded-full mt-2" />
                  </div>
                </div>
              ))
            ) : (
              latestArticles.map((post) => (
                <div key={post.id} className="rounded-[10px] overflow-hidden bg-[#FFF] shadow-md flex flex-col">
                  <img
                    src={getFeaturedImage(post)}
                    alt=""
                    className="w-full aspect-[16/10] object-cover"
                  />
                  <div className="p-6 flex flex-col flex-grow">
                    <h3
                      className="mb-3 font-medium text-brand-purple-dark"
                      style={{
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                        fontSize: '20px',
                        lineHeight: '1.3',
                      }}
                    >
                      {stripHtml(post.title.rendered)}
                    </h3>
                    <p
                      className="mb-4 flex-grow line-clamp-3"
                      style={{
                        color: 'var(--sds-color-text-default-default)',
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                        fontSize: '18px',
                        fontWeight: 400,
                        lineHeight: '155%',
                      }}
                    >
                      {stripHtml(post.excerpt.rendered)}
                    </p>
                    <Link
                      to={`/understand/${post.id}`}
                      className="inline-block w-fit bg-[#0F006A] text-[#FFF] px-6 py-3 rounded-full font-normal hover:opacity-90 transition-opacity text-sm"
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

      {/* Same as Home (without Latest Notes): Join Us, Newsletter. Footer is in App layout. */}
      <JoinUsSection />
      <Newsletter />
    </div>
  )
}
