/** How We Make a Difference – two columns: left = 4 images (2x2), right = heading, intro, 3 feature rows with check icon */

const IMPACT_IMAGES = [
  '/images/Hero_Image.jpeg',
  '/images/Home_Page_1.png',
  '/images/Purpose_Image.jpeg',
  '/images/purpose.jpeg',
]

const PROGRAMS = [
  {
    title: 'Educational Programs',
    description: 'We provide comprehensive educational resources including books, articles, podcasts, and guides to help families stay informed about the latest research and treatment options for Neurodevelopmental Disorders.',
  },
  {
    title: 'Performance Activities',
    description: "Through sponsored dance, art, sports, and other performance-based activities, we give children with ND the opportunity to develop their talents, build confidence, and showcase their abilities.",
  },
  {
    title: 'Advocacy & Support',
    description: 'We work to increase access to assessments, therapy options, and employment opportunities, while creating a more inclusive world for everyone.',
  },
]

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

export default function Impact() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Two columns: left = 2x2 images, right = Our Mission pill + heading + intro + 3 features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-16">
          {/* Left – 2x2 image grid */}
          <div className="grid grid-cols-2 gap-4 order-2 lg:order-1 w-full">
            {IMPACT_IMAGES.map((src, i) => (
              <div
                key={i}
                className="relative w-full overflow-hidden rounded-[25px] aspect-[4/3] bg-gray-100"
              >
                <img
                  src={src}
                  alt=""
                  className="absolute inset-0 w-full h-full min-w-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Right – heading (H2), intro (body), 3 feature rows (H6 + body) */}
          <div className="order-1 lg:order-2">
            <h2 className="font-sans text-2xl sm:text-3xl lg:text-[44px] lg:leading-[65px] lg:tracking-[-0.44px] font-medium text-[#000] mb-4">
              How We Make a Difference
            </h2>
            <p className="font-sans text-[18px] font-normal leading-[155%] text-[var(--sds-color-text-default-default)] mb-8">
              Through our programs and initiatives, we're creating opportunities for children with Neurodevelopmental Disorders to reach their full potential.
            </p>
            <div className="space-y-6">
              {PROGRAMS.map((program, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-transparent" style={{ color: '#0F006A' }}>
                    <CheckCircleIcon className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-sans text-[18px] font-semibold leading-normal text-[#000] mb-2">
                      {program.title}
                    </h3>
                    <p className="font-sans text-[18px] font-normal leading-[155%] text-[var(--sds-color-text-default-default)]">
                      {program.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
