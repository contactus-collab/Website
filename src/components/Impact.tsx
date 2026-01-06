import { Link } from 'react-router-dom'

export default function Impact() {
  const programs = [
    {
      title: 'Educational Programs',
      description: 'We provide comprehensive educational resources including books, articles, podcasts, and guides to help families stay informed about the latest research and treatment options for Neurodevelopmental Disorders.',
      icon: '📚',
    },
    {
      title: 'Performance Activities',
      description: 'Through sponsored dance, art, sports, and other performance-based activities, we give children with ND the opportunity to develop their talents, build confidence, and showcase their abilities.',
      icon: '🎭',
    },
    {
      title: 'Advocacy & Support',
      description: 'We work to increase access to assessments, therapy options, and employment opportunities, while creating a more inclusive world for everyone.',
      icon: '🤝',
    },
  ]

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How We Make a Difference
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Through our programs and initiatives, we're creating opportunities for children with Neurodevelopmental Disorders to reach their full potential.
          </p>
          <div className="w-24 h-1 bg-primary-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {programs.map((program, index) => (
            <div
              key={index}
              className="p-8 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 bg-white"
            >
              <div className="text-5xl mb-4 text-center">
                {program.icon}
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
                {program.title}
              </h3>
              <p className="text-gray-700 leading-relaxed text-center">
                {program.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-12 text-center text-white shadow-xl">
          <h3 className="text-3xl font-bold mb-4">
            Join Us in Making a Difference
          </h3>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Your support helps us provide resources, sponsor activities, and create opportunities for children with Neurodevelopmental Disorders to shine. Together, we can build a more inclusive world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/resources"
              className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Explore Resources
            </Link>
            <Link
              to="/newsletter"
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Stay Connected
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
