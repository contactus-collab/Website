import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/Hero_Image.jpeg"
          alt="Ball Four Foundation"
          className="w-full h-full object-cover object-[center_10%]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/40"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg text-left">
            All Kids Deserve the Opportunity to Shine
          </h1>
          <p className="text-xl text-white mb-8 drop-shadow-md text-left">
            The Ball Four Foundation raises awareness for Neurodevelopmental Disorders (ND) through education and advocacy as well as by sponsoring performance-based activities for kids with disabilities.
          </p>
          <div className="text-left">
            <Link
              to="/resources"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Explore our Resources
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
