import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Note } from '../types/supabase'

interface Article {
  id: number
  title: string
  date: string
  excerpt: string
  content: string
  featured?: boolean
}

const articleDatabase: { [key: number]: Article } = {
  1: {
    id: 1,
    title: 'Understanding Neurodevelopmental Disorders: A Guide for Families',
    date: new Date().toISOString().split('T')[0],
    excerpt: 'Neurodevelopmental Disorders (ND) affect how children learn, communicate, and interact with the world. This comprehensive guide helps families understand autism, ADHD, dyslexia, and other conditions, providing clarity and hope for the journey ahead.',
    featured: true,
    content: `
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Neurodevelopmental Disorders (ND) are a group of conditions that affect the development of the nervous system, impacting how children learn, communicate, behave, and interact with others. As a parent or caregiver, understanding these conditions is the first step toward providing the support and resources your child needs to thrive.
      </p>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">What Are Neurodevelopmental Disorders?</h2>
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Neurodevelopmental disorders are conditions that begin during the developmental period, typically before a child enters school. These conditions are characterized by developmental deficits that produce impairments in personal, social, academic, or occupational functioning. Common neurodevelopmental disorders include:
      </p>

      <ul class="list-disc list-inside space-y-3 mb-6 text-lg text-gray-700 ml-4">
        <li><strong>Autism Spectrum Disorder (ASD):</strong> A condition characterized by challenges with social skills, repetitive behaviors, speech, and nonverbal communication.</li>
        <li><strong>Attention-Deficit/Hyperactivity Disorder (ADHD):</strong> A condition marked by an ongoing pattern of inattention and/or hyperactivity-impulsivity that interferes with functioning or development.</li>
        <li><strong>Dyslexia:</strong> A learning disorder that affects reading and related language-based processing skills.</li>
        <li><strong>Dyspraxia:</strong> A condition affecting physical coordination and movement.</li>
        <li><strong>Intellectual Disabilities:</strong> Conditions characterized by limitations in intellectual functioning and adaptive behavior.</li>
      </ul>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">Early Recognition and Diagnosis</h2>
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Early recognition and diagnosis are crucial for children with neurodevelopmental disorders. Research consistently shows that early intervention can significantly improve outcomes, helping children develop essential skills and reach their full potential. Parents and caregivers are often the first to notice developmental differences, and their observations are invaluable in the diagnostic process.
      </p>

      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        If you have concerns about your child's development, don't hesitate to speak with your pediatrician. They can conduct developmental screenings and refer you to specialists if needed. Remember, seeking help is not a sign of failure—it's an act of love and advocacy for your child.
      </p>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">Supporting Your Child's Journey</h2>
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Every child with a neurodevelopmental disorder is unique, with their own strengths, challenges, and potential. The journey may have its ups and downs, but with the right support, resources, and understanding, children with ND can lead fulfilling, successful lives.
      </p>

      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        At Ball Four Foundation, we believe that every child deserves the opportunity to shine. Through education, advocacy, and community support, we're working to create a world where neurodiversity is not just accepted, but celebrated. Together, we can help children with neurodevelopmental disorders reach their full potential and thrive.
      </p>

      <div class="bg-primary-50 border-l-4 border-primary-600 p-6 my-8 rounded-r-lg">
        <p class="text-lg text-gray-800 italic">
          "Understanding neurodevelopmental disorders is not about finding what's 'wrong' with a child—it's about discovering their unique way of experiencing and interacting with the world. Every child has strengths, and with the right support, they can achieve amazing things."
        </p>
      </div>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">Resources and Next Steps</h2>
        <p class="text-lg text-gray-700 mb-6 leading-relaxed">
          If you're looking for more information, support, or resources, we're here to help. Visit our <a href="/resources" class="text-primary-600 hover:text-primary-700 font-semibold underline">Resources page</a> for books, podcasts, and educational materials. Join our <a href="/newsletter" class="text-primary-600 hover:text-primary-700 font-semibold underline">newsletter</a> to stay connected with our community and receive updates about events, resources, and stories that inspire.
        </p>
    `,
  },
  2: {
    id: 2,
    title: 'Supporting Your Child\'s Social and Emotional Development',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    excerpt: 'Every child develops at their own pace. For children with neurodevelopmental differences, social and emotional growth may look different. Learn practical strategies to nurture confidence, friendship skills, and emotional regulation.',
    content: `
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Social and emotional development is a fundamental aspect of every child's growth. For children with neurodevelopmental disorders, this journey may follow a different path, but with understanding, patience, and the right strategies, they can develop strong social connections and emotional resilience.
      </p>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">Understanding Social and Emotional Development</h2>
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Social and emotional development encompasses a child's ability to understand and manage their emotions, form positive relationships, and navigate social situations. For children with neurodevelopmental differences, these skills may develop at different rates or require different approaches, but they are just as important and achievable.
      </p>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">Building Emotional Regulation Skills</h2>
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Emotional regulation is the ability to manage and respond to emotions in appropriate ways. For children with neurodevelopmental disorders, this can be particularly challenging. Here are some strategies that can help:
      </p>

      <ul class="list-disc list-inside space-y-3 mb-6 text-lg text-gray-700 ml-4">
        <li><strong>Create a calm-down space:</strong> Designate a quiet, comfortable area where your child can go when they feel overwhelmed.</li>
        <li><strong>Use visual supports:</strong> Visual schedules, emotion charts, and social stories can help children understand and express their feelings.</li>
        <li><strong>Practice deep breathing:</strong> Teach simple breathing exercises that your child can use when they feel anxious or upset.</li>
        <li><strong>Validate emotions:</strong> Let your child know that all feelings are valid, and help them find appropriate ways to express them.</li>
      </ul>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">Fostering Friendship Skills</h2>
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Making and maintaining friendships can be challenging for children with neurodevelopmental differences, but it's not impossible. Here are some ways to support your child's social development:
      </p>

      <ul class="list-disc list-inside space-y-3 mb-6 text-lg text-gray-700 ml-4">
        <li><strong>Practice social scenarios:</strong> Role-play common social situations at home to help your child feel more confident.</li>
        <li><strong>Find shared interests:</strong> Encourage activities and hobbies that align with your child's interests, where they can connect with like-minded peers.</li>
        <li><strong>Teach social cues:</strong> Help your child recognize facial expressions, body language, and tone of voice through games and activities.</li>
        <li><strong>Create structured play opportunities:</strong> Organized activities with clear rules can be more comfortable for some children than unstructured free play.</li>
      </ul>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">Building Confidence and Self-Esteem</h2>
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Confidence is built through success and positive experiences. Celebrate your child's strengths and achievements, no matter how small they may seem. Help them discover their unique talents and interests, whether it's art, music, sports, technology, or something else entirely.
      </p>

      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        At Ball Four Foundation, we sponsor performance-based activities that give children with neurodevelopmental disorders opportunities to shine. These experiences can be transformative, building confidence and showing children what they're capable of achieving.
      </p>

      <div class="bg-primary-50 border-l-4 border-primary-600 p-6 my-8 rounded-r-lg">
        <p class="text-lg text-gray-800 italic">
          "Every child has unique strengths and talents. When we focus on what they can do rather than what they can't, we help them build the confidence they need to navigate the world."
        </p>
      </div>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">Seeking Support</h2>
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Remember, you don't have to navigate this journey alone. Connect with other families, seek support from professionals, and take advantage of resources available in your community. Social skills groups, therapy, and support networks can all play valuable roles in your child's development.
      </p>
    `,
  },
  3: {
    id: 3,
    title: 'Navigating School Support Systems for Children with ND',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    excerpt: 'Accessing the right educational support can transform your child\'s school experience. This article explains IEPs, 504 plans, classroom accommodations, and how to work effectively with educators to ensure your child thrives.',
    content: `
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Education is a fundamental right for every child, and children with neurodevelopmental disorders deserve access to the support and accommodations they need to succeed in school. Understanding the available support systems and how to access them is crucial for parents and caregivers.
      </p>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">Understanding IEPs and 504 Plans</h2>
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Two primary support systems are available for children with neurodevelopmental disorders in schools:
      </p>

      <div class="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 class="text-2xl font-semibold text-gray-900 mb-3">Individualized Education Program (IEP)</h3>
        <p class="text-lg text-gray-700 mb-4 leading-relaxed">
          An IEP is a legal document that outlines the special education services and supports a child will receive. It's available for children who qualify for special education services under the Individuals with Disabilities Education Act (IDEA).
        </p>
        <p class="text-lg text-gray-700 leading-relaxed">
          An IEP includes specific goals, accommodations, modifications, and related services (such as speech therapy, occupational therapy, or counseling) tailored to the child's unique needs.
        </p>
      </div>

      <div class="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 class="text-2xl font-semibold text-gray-900 mb-3">504 Plan</h3>
        <p class="text-lg text-gray-700 mb-4 leading-relaxed">
          A 504 Plan provides accommodations and modifications for children with disabilities who don't require special education services but need support to access the general education curriculum.
        </p>
        <p class="text-lg text-gray-700 leading-relaxed">
          Under Section 504 of the Rehabilitation Act, schools must provide reasonable accommodations to ensure children with disabilities have equal access to education.
        </p>
      </div>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">Common Classroom Accommodations</h2>
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Accommodations are changes to how a child learns, not what they learn. Common accommodations for children with neurodevelopmental disorders include:
      </p>

      <ul class="list-disc list-inside space-y-3 mb-6 text-lg text-gray-700 ml-4">
        <li><strong>Seating arrangements:</strong> Preferential seating near the teacher or away from distractions</li>
        <li><strong>Extended time:</strong> Additional time for tests and assignments</li>
        <li><strong>Breaks:</strong> Regular breaks to help with focus and regulation</li>
        <li><strong>Visual supports:</strong> Visual schedules, charts, and reminders</li>
        <li><strong>Assistive technology:</strong> Tools like text-to-speech software or noise-canceling headphones</li>
        <li><strong>Modified assignments:</strong> Adjustments to the length or format of assignments</li>
        <li><strong>Communication supports:</strong> Alternative ways to demonstrate knowledge</li>
      </ul>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">Working Effectively with Educators</h2>
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Building a positive, collaborative relationship with your child's teachers and school staff is essential. Here are some tips for effective communication:
      </p>

      <ul class="list-disc list-inside space-y-3 mb-6 text-lg text-gray-700 ml-4">
        <li><strong>Be proactive:</strong> Schedule regular check-ins with teachers, not just when problems arise</li>
        <li><strong>Share information:</strong> Provide teachers with relevant information about your child's strengths, challenges, and what works at home</li>
        <li><strong>Be collaborative:</strong> Approach meetings as a team working together for your child's success</li>
        <li><strong>Document everything:</strong> Keep records of meetings, emails, and important conversations</li>
        <li><strong>Know your rights:</strong> Familiarize yourself with special education laws and your child's rights</li>
      </ul>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">Advocating for Your Child</h2>
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        As a parent or caregiver, you are your child's most important advocate. Don't be afraid to speak up, ask questions, and request what your child needs. Remember, you know your child best, and your input is valuable in creating an effective support plan.
      </p>

      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        If you encounter challenges or feel that your child's needs aren't being met, consider seeking support from advocacy organizations, special education advocates, or legal resources in your area.
      </p>

      <div class="bg-primary-50 border-l-4 border-primary-600 p-6 my-8 rounded-r-lg">
        <p class="text-lg text-gray-800 italic">
          "Every child has the right to an education that meets their needs. With the right support and accommodations, children with neurodevelopmental disorders can thrive in school and beyond."
        </p>
      </div>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">Additional Resources</h2>
        <p class="text-lg text-gray-700 mb-6 leading-relaxed">
          For more information about educational support, visit our <a href="/resources" class="text-primary-600 hover:text-primary-700 font-semibold underline">Resources page</a> for books and materials on navigating the school system. Remember, you're not alone in this journey—there are many families and professionals ready to support you and your child.
        </p>
    `,
  },
  4: {
    id: 4,
    title: 'Creating Inclusive Play Opportunities for All Children',
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    excerpt: 'Play is essential for every child\'s development. Discover how to create inclusive play spaces and activities that welcome children with neurodevelopmental differences, fostering friendships and building skills through fun.',
    content: `
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Play is the language of childhood—it's how children learn, explore, connect, and express themselves. For children with neurodevelopmental disorders, inclusive play opportunities are not just beneficial; they're essential for development, social connection, and joy.
      </p>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">Why Inclusive Play Matters</h2>
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Inclusive play benefits all children, not just those with neurodevelopmental differences. When children of all abilities play together, they learn empathy, patience, and different ways of thinking and problem-solving. For children with ND, inclusive play provides opportunities to:
      </p>

      <ul class="list-disc list-inside space-y-3 mb-6 text-lg text-gray-700 ml-4">
        <li>Develop social skills in a natural, low-pressure environment</li>
        <li>Build confidence through successful play experiences</li>
        <li>Practice communication and turn-taking</li>
        <li>Explore their interests and strengths</li>
        <li>Form meaningful friendships</li>
      </ul>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">Designing Inclusive Play Spaces</h2>
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Creating an inclusive play environment doesn't require expensive equipment or major renovations. Here are some key principles:
      </p>

      <h3 class="text-2xl font-semibold text-gray-900 mt-6 mb-3">Physical Accessibility</h3>
      <ul class="list-disc list-inside space-y-2 mb-6 text-lg text-gray-700 ml-4">
        <li>Ensure play areas are accessible to children with mobility differences</li>
        <li>Provide quiet spaces for children who need breaks from sensory stimulation</li>
        <li>Offer a variety of play options at different skill levels</li>
      </ul>

      <h3 class="text-2xl font-semibold text-gray-900 mt-6 mb-3">Sensory Considerations</h3>
      <ul class="list-disc list-inside space-y-2 mb-6 text-lg text-gray-700 ml-4">
        <li>Provide both high-energy and calm play options</li>
        <li>Consider noise levels and offer quiet alternatives</li>
        <li>Include tactile, visual, and movement-based activities</li>
        <li>Allow children to choose their level of participation</li>
      </ul>

      <h3 class="text-2xl font-semibold text-gray-900 mt-6 mb-3">Social Structure</h3>
      <ul class="list-disc list-inside space-y-2 mb-6 text-lg text-gray-700 ml-4">
        <li>Offer both structured and unstructured play opportunities</li>
        <li>Provide clear rules and expectations when needed</li>
        <li>Encourage parallel play as well as interactive play</li>
        <li>Support children in finding play partners with shared interests</li>
      </ul>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">Inclusive Play Activities</h2>
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Here are some activities that work well in inclusive settings:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-gray-50 p-6 rounded-lg">
          <h4 class="text-xl font-semibold text-gray-900 mb-3">Art and Creative Play</h4>
          <p class="text-gray-700">Drawing, painting, sculpting, and crafting allow children to express themselves without the pressure of verbal communication.</p>
        </div>
        <div class="bg-gray-50 p-6 rounded-lg">
          <h4 class="text-xl font-semibold text-gray-900 mb-3">Building and Construction</h4>
          <p class="text-gray-700">Blocks, LEGOs, and building materials encourage problem-solving and can be enjoyed individually or collaboratively.</p>
        </div>
        <div class="bg-gray-50 p-6 rounded-lg">
          <h4 class="text-xl font-semibold text-gray-900 mb-3">Music and Movement</h4>
          <p class="text-gray-700">Dancing, playing instruments, and movement games provide sensory input and opportunities for self-expression.</p>
        </div>
        <div class="bg-gray-50 p-6 rounded-lg">
          <h4 class="text-xl font-semibold text-gray-900 mb-3">Nature Exploration</h4>
          <p class="text-gray-700">Outdoor play, gardening, and nature walks offer calming sensory experiences and opportunities for discovery.</p>
        </div>
      </div>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">Supporting Play at Home and in the Community</h2>
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Creating inclusive play opportunities starts at home and extends to community spaces. Look for playgrounds, community centers, and programs that welcome children of all abilities. Many communities are working to make play spaces more inclusive, and your advocacy can help drive these positive changes.
      </p>

      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        At Ball Four Foundation, we sponsor performance-based activities that give children with neurodevelopmental disorders opportunities to shine. These activities—whether dance, art, sports, or theater—provide structured yet creative play experiences that build skills and confidence.
      </p>

      <div class="bg-primary-50 border-l-4 border-primary-600 p-6 my-8 rounded-r-lg">
        <p class="text-lg text-gray-800 italic">
          "When we create spaces where all children can play together, we're not just building playgrounds—we're building communities where every child belongs."
        </p>
      </div>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">The Role of Adults</h2>
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Adults play a crucial role in facilitating inclusive play. This doesn't mean controlling or directing play, but rather:
      </p>

      <ul class="list-disc list-inside space-y-3 mb-6 text-lg text-gray-700 ml-4">
        <li>Observing and understanding each child's needs and preferences</li>
        <li>Providing support when needed while allowing children to lead</li>
        <li>Modeling inclusive behavior and positive social interactions</li>
        <li>Intervening when necessary to ensure safety and inclusion</li>
        <li>Celebrating all forms of play and participation</li>
      </ul>

      <h2 class="text-3xl font-bold text-gray-900 mt-8 mb-4">Building Inclusive Communities</h2>
      <p class="text-lg text-gray-700 mb-6 leading-relaxed">
        Creating truly inclusive play opportunities requires a community effort. Work with schools, community centers, and local organizations to advocate for inclusive play spaces and programs. When we prioritize inclusion, we create environments where all children can thrive.
      </p>

        <p class="text-lg text-gray-700 mb-6 leading-relaxed">
          For more resources on supporting children's development through play, visit our <a href="/resources" class="text-primary-600 hover:text-primary-700 font-semibold underline">Resources page</a>. Together, we can create a world where every child has the opportunity to play, learn, and grow.
        </p>
    `,
  },
}

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const contentRef = useRef<HTMLDivElement>(null)

  // Handle clicks on anchor tags to use React Router
  useEffect(() => {
    if (contentRef.current) {
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('/')) {
          e.preventDefault()
          navigate(target.getAttribute('href') || '/')
        }
      }
      contentRef.current.addEventListener('click', handleClick)
      return () => {
        if (contentRef.current) {
          contentRef.current.removeEventListener('click', handleClick)
        }
      }
    }
  }, [navigate, article])

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const articleId = id ? parseInt(id) : null
        if (!articleId) {
          setArticle(null)
          return
        }

        // Try to fetch from Supabase first
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('id', articleId)
          .single()

        if (error) throw error

        if (data) {
          setArticle(data as Article)
        } else {
          // Fallback to local database
          setArticle(articleDatabase[articleId] || null)
        }
      } catch (error) {
        console.error('Error fetching article:', error)
        // Fallback to local database
        const articleId = id ? parseInt(id) : null
        if (articleId) {
          setArticle(articleDatabase[articleId] || null)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [id])

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-lg text-gray-700 mb-8">The article you're looking for doesn't exist.</p>
          <Link
            to="/notes"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Back to Notes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            to="/notes"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mb-8 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Notes
          </Link>

          {/* Article Header */}
          <header className="mb-8">
            {article.featured && (
              <span className="inline-block bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                Featured Article
              </span>
            )}
            <div className="flex items-center gap-3 text-gray-500 mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time>{formatDate(article.date)}</time>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed">
              {article.excerpt}
            </p>
          </header>

          {/* Article Content */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div
              ref={contentRef}
              className="prose prose-lg prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-ul:text-gray-700 prose-li:text-gray-700 max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Call to Action */}
          <div className="mt-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
            <p className="text-xl text-primary-100 mb-6 max-w-2xl mx-auto">
              Join our community to receive more articles, resources, and updates about supporting children with Neurodevelopmental Disorders.
            </p>
            <Link
              to="/newsletter"
              className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Subscribe to Our Newsletter
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}

