import LatestNotes from '../components/LatestNotes'
import Newsletter from '../components/Newsletter'

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/Resources_Hero.jpeg"
            alt="Thought Leaders"
            className="w-full h-full object-cover object-[center_60%]"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/40"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Thought Leaders
          </h1>
          <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto drop-shadow-md">
            Discover the best books, online resources, podcasts, etc from experts, advocates, and families on Neurodevelopmental Disorders (ND). Ball Four Foundation exists as the trusted support on your journey.
          </p>
        </div>
      </section>

      {/* Books Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              📚 Books for Parents & Caregivers
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Guidance, strategies, and support for understanding and helping children with neurodevelopmental disorders. These books focus on understanding, acceptance, and practical strategies rather than "cure"—emphasizing inclusive support and tailored interventions.
            </p>
            <div className="w-24 h-1 bg-primary-600 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {books.map((book, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="mb-4">
                  <div className="w-12 h-1 bg-primary-600 rounded-full mb-4"></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 font-medium mb-3">By: {book.author}</p>
                  {book.description && (
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      {book.description}
                    </p>
                  )}
                </div>
                <a
                  href={book.buyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full text-center bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Buy Now
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Podcasts Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🎧 Podcasts for Parents & Caregivers
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              High-quality podcasts offering practical tips, expert insights, and community support for parents and caregivers supporting children with autism, ADHD, and broader neurodiversity.
            </p>
            <div className="w-24 h-1 bg-primary-600 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {podcasts.map((podcast, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="mb-4">
                  <div className="w-12 h-1 bg-primary-600 rounded-full mb-4"></div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    {podcast.title}
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {podcast.description}
                  </p>
                  {podcast.host && (
                    <p className="text-sm text-gray-600 italic mb-4">
                      {podcast.host}
                    </p>
                  )}
                </div>
                {podcast.links.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {podcast.links.map((link, linkIndex) => (
                      <a
                        key={linkIndex}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-primary-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Notes Section */}
      <LatestNotes />

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">Newsletter</h2>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              The Ball Four Foundation exists to support children with Neurodevelopmental Disorders (ND). Join us in this important conversation, sign up for the Newsletter and follow us on social media.
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
