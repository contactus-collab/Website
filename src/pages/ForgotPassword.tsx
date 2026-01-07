import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const getBaseSiteUrl = (): string => {
    const raw = (import.meta.env.VITE_SITE_URL || '').trim()
    if (!raw) return window.location.origin

    // If someone accidentally sets `VITE_SITE_URL=https://www.ballfour.org/#`,
    // strip the hash so redirects don't land on the home page hash route.
    try {
      const url = new URL(raw)
      url.hash = ''
      const base = `${url.origin}${url.pathname}`.replace(/\/$/, '')
      return base || window.location.origin
    } catch {
      return raw.replace(/#.*$/, '').replace(/\/$/, '') || window.location.origin
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Use production URL from environment variable, fallback to current origin for development
      const siteUrl = getBaseSiteUrl()
      const redirectUrl = `${siteUrl}/reset-password`
      
      // Log for debugging (remove in production if needed)
      console.log('Password reset redirect URL:', redirectUrl)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'Password reset email sent! Please check your inbox and follow the instructions to reset your password.',
      })
      setEmail('')
    } catch (err: any) {
      console.error('Password reset error:', err)
      setMessage({
        type: 'error',
        text: err.message || 'Failed to send password reset email. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-6">
            <img
              src="/images/ballfour-foundation-logo.png"
              alt="Ball Four Foundation"
              className="h-16 w-auto"
            />
          </div>
          <h2 className="mt-6 text-center text-4xl font-bold text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </div>
        </form>

        <div className="text-center space-y-2">
          <Link
            to="/login"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

