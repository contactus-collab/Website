import { useState } from 'react'
import { Link } from 'react-router-dom'
import Newsletter from '../components/Newsletter'

export default function Purpose() {
  const [currentSlide, setCurrentSlide] = useState(0)

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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % cards.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + cards.length) % cards.length)
  }
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/Purpose_Image.jpeg"
            alt="Our Purpose"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/40"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Creating a World Where All Can Thrive
          </h1>
          <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto drop-shadow-md">
            The first step is raising awareness around Neurodevelopmental Disorders (ND). We do that through education, advocacy, and event sponsorship that offers kids with neurodevelopmental disorders the chance to shine.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <div className="text-center mb-12">
              <div className="inline-block bg-primary-100 rounded-full px-6 py-2 mb-6">
                <span className="text-primary-700 font-semibold text-sm uppercase tracking-wide">Our Story</span>
              </div>
            </div>
            
            <p className="text-xl text-gray-700 mb-6 text-center">
              With one in 36 kids on the spectrum, Neurodevelopmental Disorders (ND) are a growing issue affecting families across the US — <strong>with many not getting the support they need.</strong>
            </p>
            
            <p className="text-lg text-gray-700 mb-6 text-center">
              The Ball Four Foundation was created to bridge the gaps in awareness and care about Neurodevelopmental Disorders (ND), so that families can find the books about them and the resources they need, young people can reach their full potential, and together we can create a more inclusive world for everyone.
            </p>
            
            {/* Visual Divider */}
            <div className="flex items-center justify-center my-16">
              <div className="flex-grow border-t border-gray-300"></div>
              <div className="px-4">
                <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
              </div>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            {/* Our Mission Section */}
            <div className="mt-16 mb-16">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 md:p-12 shadow-lg">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Our Mission
                  </h2>
                  <div className="w-24 h-1 bg-primary-600 mx-auto rounded-full"></div>
                </div>
                <p className="text-xl text-gray-800 text-center max-w-3xl mx-auto leading-relaxed">
                  The Ball Four Foundation raises awareness for Neurodevelopmental Disorders (ND) through education and advocacy as well as by sponsoring performance-based activities for kids with disabilities.
                </p>
              </div>
            </div>
            
            {/* What We Do Section */}
            <div className="mt-16">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  What We Do
                </h2>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                  Our comprehensive approach to supporting children with Neurodevelopmental Disorders and their families.
                </p>
                <div className="w-24 h-1 bg-primary-600 mx-auto mt-4 rounded-full"></div>
              </div>
              
              <div className="relative max-w-7xl mx-auto">
                {/* Carousel Container */}
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {cards.map((card, index) => (
                      <div
                        key={index}
                        className="min-w-full px-4"
                      >
                        <div className="bg-gradient-to-br from-gray-50 to-white p-10 md:p-12 rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group max-w-4xl mx-auto">
                          <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6 text-center group-hover:text-primary-700 transition-colors duration-300">
                            {card.title}
                          </h3>
                          <p className="text-gray-700 text-lg leading-relaxed text-center">
                            {card.description}
                          </p>
                          <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="w-12 h-1 bg-primary-600 mx-auto rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={prevSlide}
                    className="bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous slide"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* Slide Indicators */}
                  <div className="flex gap-2">
                    {cards.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-3 rounded-full transition-all duration-300 ${
                          index === currentSlide
                            ? 'w-8 bg-primary-600'
                            : 'w-3 bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextSlide}
                    className="bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next slide"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inspiring Quote Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Side */}
            <div className="order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/purpose.jpeg"
                  alt="Children thriving and shining"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>

            {/* Quote Side */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <div className="relative">
                <svg
                  className="w-16 h-16 text-primary-200 mx-auto lg:mx-0 mb-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h3.983v10h-9.983z" />
                </svg>
                <blockquote className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 italic leading-relaxed">
                  "Every child deserves the opportunity to shine, regardless of their unique challenges. Together, we can create a world where neurodiversity is not just accepted, but celebrated."
                </blockquote>
                <div className="w-24 h-1 bg-primary-600 mx-auto lg:mx-0 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Education + Resources Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full -mr-32 -mt-32 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-200 rounded-full -ml-24 -mb-24 opacity-20"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="inline-block bg-primary-100 rounded-full px-4 py-1 mb-4">
                  <span className="text-primary-700 font-semibold text-sm">📚 Resources</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Education + Resources for Families Living with NDs
                </h2>
                <div className="w-24 h-1 bg-primary-600 mx-auto rounded-full"></div>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <p className="text-lg text-gray-700 mb-8 leading-relaxed text-center">
                  On our Resources page, we offer an evolving collection of vetted resources that include the best books about neurodevelopmental disorders (ND), podcasts, and live events for families of children with NDs. Get answers to your questions, hear from people who have faced similar challenges, and find ways to get involved in your community.
                </p>
                
                <div className="text-center">
                  <Link
                    to="/resources"
                    className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Explore Our Resources
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Join Us in Making a Difference
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              There are many ways to support our mission and help children with Neurodevelopmental Disorders thrive.
            </p>
            <div className="w-24 h-1 bg-primary-600 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-xl border-2 border-primary-100 hover:border-primary-300 transition-all duration-300 hover:shadow-lg text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Explore Resources</h3>
              <p className="text-gray-700 mb-4">Access books, podcasts, and educational materials to support your journey.</p>
              <Link
                to="/resources"
                className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center gap-1"
              >
                Learn More <span>→</span>
              </Link>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-xl border-2 border-primary-100 hover:border-primary-300 transition-all duration-300 hover:shadow-lg text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Stay Connected</h3>
              <p className="text-gray-700 mb-4">Subscribe to our newsletter for updates, events, and inspiring stories.</p>
              <Link
                to="/newsletter"
                className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center gap-1"
              >
                Subscribe <span>→</span>
              </Link>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-xl border-2 border-primary-100 hover:border-primary-300 transition-all duration-300 hover:shadow-lg text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Involved</h3>
              <p className="text-gray-700 mb-4">Connect with our community and help us create a more inclusive world.</p>
              <a
                href="mailto:contactus@ballfour.org"
                className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center gap-1"
              >
                Contact Us <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">Stay Connected</h2>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Join our community to receive updates about resources, events, and stories that support children with Neurodevelopmental Disorders.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <Newsletter />
          </div>
        </div>
      </section>
    </div>
  )
}
