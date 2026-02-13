import { useState, FormEvent, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check for success message from password reset
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (data.user) {
        // Check if user is admin
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (userError || !userData) {
          // If profile doesn't exist, sign out the user
          await supabase.auth.signOut()
          throw new Error('Access denied. Admin privileges required.')
        }

        if (userData.role !== 'admin') {
          // If user is not an admin, sign them out
          await supabase.auth.signOut()
          throw new Error('Access denied. Admin privileges required.')
        }

        navigate('/admin')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to sign in. Please check your credentials.')
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
            Admin Login
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
            Sign in to access the admin dashboard
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm font-medium" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                {successMessage}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm font-medium" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full h-[50px] px-5 rounded-full border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0F006A]/30 focus:border-[#0F006A] transition-all"
                style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '16px' }}
              />
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
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
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-[#0F006A] hover:opacity-90 font-medium transition-opacity"
                style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '16px' }}
              >
                Forgot your password?
              </Link>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link
              to="/"
              className="inline-block text-[#0F006A] hover:opacity-90 font-medium transition-opacity"
              style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '16px' }}
            >
              ← Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

