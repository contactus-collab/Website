import { useState, FormEvent } from 'react'
import { supabase } from '../lib/supabase'

type Status = 'success' | 'error' | 'exists' | ''

export default function Newsletter() {
  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [status, setStatus] = useState<Status>('')
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setStatus('')
    setStatusMessage('')

    try {
      // Check if email already exists
      const { data: existingSubscriber, error: checkError } = await supabase
        .from('newsletter')
        .select('email, unsubscribed')
        .eq('email', email)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is what we want for new subscribers
        throw checkError
      }

      if (existingSubscriber) {
        // Check if they are unsubscribed
        if (existingSubscriber.unsubscribed) {
          // Re-subscribe them
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
          // Already subscribed
          setStatus('exists')
          setStatusMessage('You are already subscribed to our newsletter!')
        }
        setFirstName('')
        setLastName('')
        setEmail('')
        return
      }

      // Insert new subscriber
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
      setFirstName('')
      setLastName('')
      setEmail('')
    } catch (error: any) {
      console.error('Error subscribing to newsletter:', error)
      setStatus('error')
      if (error?.code === '23505') {
        // Unique constraint violation
        setStatusMessage('This email is already subscribed to our newsletter.')
      } else {
        setStatusMessage('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Newsletter
        </h2>
        <p className="text-lg text-gray-700 mb-4">
          Join the Ball Four Foundation community to stay informed about resources, events, and stories that support children with Neurodevelopmental Disorders and their families.
        </p>
        <div className="flex justify-center space-x-4 mb-6">
          <a
            href="https://www.instagram.com/ballfourfoundation/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Instagram"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/company/the-ball-four-foundation/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="LinkedIn"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a
            href="https://x.com/ball4foundation"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="X (Twitter)"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                required
                className="w-full px-5 py-4 rounded-lg text-gray-900 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                required
                className="w-full px-5 py-4 rounded-lg text-gray-900 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full px-5 py-4 rounded-lg text-gray-900 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
        
        {status === 'success' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-center">
            <p className="font-semibold">✓ {statusMessage}</p>
          </div>
        )}
        {status === 'exists' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-center">
            <p className="font-semibold">ℹ️ {statusMessage}</p>
          </div>
        )}
        {status === 'error' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-center">
            <p className="font-semibold">{statusMessage}</p>
          </div>
        )}
      </form>

      <p className="text-sm text-gray-600 text-center mt-6 max-w-md mx-auto">
        By subscribing, you agree to receive updates from Ball Four Foundation. We respect your privacy and will never share your information.
      </p>
    </div>
  )
}
