import Newsletter from '../components/Newsletter'

export default function NewsletterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero – same look as Resources: rounded container, blurred bg + overlay, centered text */}
      <section className="py-12 px-4 sm:py-16">
        <div className="max-w-7xl mx-auto rounded-[32px] sm:rounded-[40px] overflow-hidden relative min-h-[320px] sm:min-h-[380px] flex items-center justify-center">
          <img
            src="/images/resources.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-105 blur-sm"
            aria-hidden
          />
          <div
            className="absolute inset-0 z-0"
            style={{ }}
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
              Stay Connected
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
              Join our community and stay informed about the latest resources, events, and stories that matter.
            </p>
          </div>
        </div>
      </section>

      {/* Intro text – bridges hero and sign-up */}
      <section className="py-10 px-4 sm:py-14 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <p
            style={{
              color: 'var(--sds-color-text-default-default)',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '18px',
              fontWeight: 400,
              lineHeight: '155%',
            }}
          >
            Our newsletter brings you the latest from Ball Four Foundation: new resources on neurodevelopmental disorders, upcoming events, stories from families and advocates, and ways to get involved. No spam — just thoughtful updates a few times a year.
          </p>
        </div>
      </section>

      {/* Newsletter subscription – dark two-column section */}
      <Newsletter />
    </div>
  )
}
