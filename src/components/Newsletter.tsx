import { useState, FormEvent } from 'react'
import { supabase } from '../lib/supabase'

type Status = 'success' | 'error' | 'exists' | ''

const SECTION_BG = '#100d47'
const INPUT_BG = '#2b2161'

export default function Newsletter() {
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [status, setStatus] = useState<Status>('')
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setStatus('')
    setStatusMessage('')

    const trimmed = name.trim()
    const firstSpace = trimmed.indexOf(' ')
    const firstName = firstSpace > 0 ? trimmed.slice(0, firstSpace) : trimmed
    const lastName = firstSpace > 0 ? trimmed.slice(firstSpace + 1) : ''

    try {
      const { data: existingSubscriber, error: checkError } = await supabase
        .from('newsletter')
        .select('email, unsubscribed')
        .eq('email', email)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingSubscriber) {
        if (existingSubscriber.unsubscribed) {
          const { error: updateError } = await supabase
            .from('newsletter')
            .update({
              unsubscribed: false,
              first_name: firstName,
              last_name: lastName,
            })
            .eq('email', email)

          if (updateError) throw updateError

          setStatus('success')
          setStatusMessage('Welcome back! You\'ve been re-subscribed to our newsletter.')
        } else {
          setStatus('exists')
          setStatusMessage('You are already subscribed to our newsletter!')
        }
        setName('')
        setEmail('')
        return
      }

      const { error } = await supabase
        .from('newsletter')
        .insert([
          {
            email,
            first_name: firstName,
            last_name: lastName,
            unsubscribed: false,
            created_at: new Date().toISOString(),
          },
        ])

      if (error) throw error

      setStatus('success')
      setStatusMessage('Thank you for subscribing! We\'ll keep you updated.')
      setName('')
      setEmail('')
    } catch (error: any) {
      console.error('Error subscribing to newsletter:', error)
      setStatus('error')
      if (error?.code === '23505') {
        setStatusMessage('This email is already subscribed to our newsletter.')
      } else {
        setStatusMessage('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="py-16 px-4 md:py-20 md:px-8"
      style={{ backgroundColor: SECTION_BG }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left – heading + description */}
          <div>
            <h2
              className="mb-4 font-[500] max-w-xl"
              style={{
                color: 'var(--white, #FFF)',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '44px',
                lineHeight: '65px',
                letterSpacing: '-0.44px',
              }}
            >
              Subscribe to our Newsletter
            </h2>
            <p
              className="max-w-xl"
              style={{
                color: '#ECECEC',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '18px',
                fontWeight: 400,
                lineHeight: '155%',
              }}
            >
              Join the Ball Four Foundation community to stay informed about resources, events, and stories that support children with Neurodevelopmental Disorders and their families.
            </p>
          </div>

          {/* Right – form */}
          <form onSubmit={handleSubmit} className="max-w-md">
            <div className="space-y-4">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full h-[50px] px-6 rounded-full text-white placeholder:text-white/70 border-0 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                style={{ backgroundColor: INPUT_BG }}
                aria-label="Your name"
              />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full h-[50px] px-6 rounded-full text-white placeholder:text-white/70 border-0 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                style={{ backgroundColor: INPUT_BG }}
                aria-label="Your email"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full h-[50px] flex items-center justify-center rounded-full font-semibold text-base border-0 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:opacity-95"
              style={{ backgroundColor: '#fff', color: SECTION_BG }}
            >
              {loading ? 'Subscribing...' : 'Subscribe to our Newsletter'}
            </button>

            {status === 'success' && (
              <p className="mt-4 text-sm text-green-300">{statusMessage}</p>
            )}
            {status === 'exists' && (
              <p className="mt-4 text-sm text-blue-300">{statusMessage}</p>
            )}
            {status === 'error' && (
              <p className="mt-4 text-sm text-red-300">{statusMessage}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
