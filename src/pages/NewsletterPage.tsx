import Newsletter from '../components/Newsletter'

export default function NewsletterPage() {
  const benefits = [
    {
      icon: '📧',
      title: 'Stay Updated',
      description: 'Receive regular updates about our programs, events, and initiatives that support children with Neurodevelopmental Disorders.',
    },
    {
      icon: '📖',
      title: 'Community Stories',
      description: 'Read inspiring stories about children and families we support through our programs and activities.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/Newsletter_Hero.jpeg"
            alt="Newsletter Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/40"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Stay Connected
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto drop-shadow-md">
            Join our community and stay informed about the latest resources, events, and stories that matter.
          </p>
        </div>
      </section>

      {/* Newsletter subscription – dark two-column section */}
      <Newsletter />

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Join Our Newsletter?
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              By subscribing, you'll stay connected with our mission to support children with Neurodevelopmental Disorders and their families.
            </p>
            <div className="w-24 h-1 bg-primary-600 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 text-center"
              >
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Information Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              What to Expect
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start">
                <span className="text-primary-600 mr-3 mt-1">✓</span>
                <div>
                  <strong className="text-gray-900">Regular Updates:</strong> Stay informed about our programs, events, and initiatives that support children.
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-primary-600 mr-3 mt-1">✓</span>
                <div>
                  <strong className="text-gray-900">Event Announcements:</strong> Be notified about workshops, performances, and community events.
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-primary-600 mr-3 mt-1">✓</span>
                <div>
                  <strong className="text-gray-900">Success Stories:</strong> Read inspiring stories from our community members and program participants.
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-primary-600 mr-3 mt-1">✓</span>
                <div>
                  <strong className="text-gray-900">Privacy Respected:</strong> We value your privacy and will never share your information with third parties.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
