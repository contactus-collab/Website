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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[25px] shadow-lg border border-gray-100 p-8 sm:p-10">
          <div className="flex justify-center mb-6">
            <img
              src="/images/ballfour-foundation-logo.png"
              alt="Ball Four Foundation"
              className="h-14 w-auto"
            />
          </div>
          <h1
            className="text-center mb-2"
            style={{
              color: '#000',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '44px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '65px',
              letterSpacing: '-0.44px',
            }}
          >
            Forgot Password
          </h1>
          <p
            className="text-center mb-8"
            style={{
              color: 'var(--sds-color-text-default-default)',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '18px',
              fontWeight: 400,
              lineHeight: '155%',
            }}
          >
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {message && (
              <div
                className={`px-4 py-3 rounded-xl text-sm font-medium ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
                style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
              >
                {message.text}
              </div>
            )}

            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full h-[50px] px-5 rounded-full border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0F006A]/30 focus:border-[#0F006A] transition-all"
                style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '16px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] flex items-center justify-center rounded-full font-medium text-white border-0 focus:outline-none focus:ring-2 focus:ring-[#0F006A]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-95"
              style={{ backgroundColor: '#0F006A', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '16px' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link
              to="/login"
              className="inline-block text-[#0F006A] hover:opacity-90 font-medium transition-opacity"
              style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '16px' }}
            >
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

