import { Link } from 'react-router-dom'

const HERO_IMAGES = [
  '/images/Hero_Image.jpeg',
  '/images/Home_Page_1.png',
  '/images/Purpose_Image.jpeg',
  '/images/purpose.jpeg',
]

export default function Hero() {
  return (
    <section className="bg-white min-h-[85vh] flex flex-col">
      <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Headline, body, CTA */}
          <div className="order-2 lg:order-1">
            <h1 className="font-sans text-4xl sm:text-5xl lg:text-[62px] lg:leading-[78px] lg:tracking-[-0.62px] font-medium text-[#000] mb-6">
              All Kids Deserve the{' '}
              <span className="text-brand-purple-dark">Opportunity</span> to Shine
            </h1>
            <p className="font-sans text-[18px] font-normal leading-[155%] text-[var(--sds-color-text-default-default)] mb-10 max-w-xl">
              The Ball Four Foundation raises awareness for Neurodevelopmental Disorders (ND) through education and advocacy as well as by sponsoring performance-based activities for kids with disabilities.
            </p>
            <Link
              to="/resources"
              className="inline-block bg-[#0F006A] text-[#FFF] px-10 py-4 rounded-full font-normal hover:opacity-90 transition-opacity shadow-md hover:shadow-lg text-base"
            >
              Explore our resources
            </Link>
          </div>

          {/* Right column - 2x2 image grid with squircle corners */}
          <div className="order-1 lg:order-2 grid grid-cols-2 gap-4 sm:gap-5">
            {HERO_IMAGES.map((src, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-squircle-lg sm:rounded-[2.5rem] shadow-lg aspect-[4/3] bg-gray-100"
              >
                <img
                  src={src}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Light purple gradient at bottom */}
      <div
        className="h-24 flex-shrink-0 w-full bg-gradient-to-t from-brand-purple-light to-white"
        aria-hidden
      />
    </section>
  )
}
