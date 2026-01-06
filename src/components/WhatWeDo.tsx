interface Activity {
  title: string
  description: string
  icon: string
}

export default function WhatWeDo() {
  const activities: Activity[] = [
    {
      title: 'Spreading the Word',
      description: 'Sharing articles, books, podcasts, and other educational resources about Neurodevelopmental Disorders (ND) that keep families informed about the latest research and treatment options.',
      icon: '📢',
    },
    {
      title: 'Advocating for Change',
      description: 'Leading the charge for a more inclusive world by increasing access to Neurodevelopmental Disorders (ND) assessments, therapy options, and employment opportunities',
      icon: '🤝',
    },
    {
      title: 'Creating Opportunities to Be Seen and Heard',
      description: 'Sponsoring dance, art, sports, and other performance-based activities that give kids with Neurodevelopmental Disorders (ND) the opportunity to develop their talents and take center stage.',
      icon: '🌟',
    },
  ]

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What We Do
          </h2>
          <div className="w-24 h-1 bg-primary-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group"
            >
              <div className="text-6xl mb-6 text-center group-hover:scale-110 transition-transform duration-300">
                {activity.icon}
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center group-hover:text-primary-600 transition-colors duration-300">
                {activity.title}
              </h3>
              <p className="text-gray-700 leading-relaxed text-center">
                {activity.description}
              </p>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="w-12 h-1 bg-primary-600 mx-auto rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
