import { useState, FormEvent, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase password reset uses hash fragments, not query params
    // Check if we have the hash in the URL
    const hash = window.location.hash
    if (!hash || !hash.includes('access_token')) {
      // Also check query params as fallback
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')
      
      if (!accessToken || !refreshToken) {
        setError('Invalid or expired reset link. Please request a new password reset.')
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      // Supabase password reset uses hash fragments
      const hash = window.location.hash
      let accessToken: string | null = null
      let refreshToken: string | null = null

      if (hash) {
        // Parse hash fragments
        const hashParams = new URLSearchParams(hash.substring(1))
        accessToken = hashParams.get('access_token')
        refreshToken = hashParams.get('refresh_token')
      } else {
        // Fallback to query params
        accessToken = searchParams.get('access_token')
        refreshToken = searchParams.get('refresh_token')
      }

      if (!accessToken || !refreshToken) {
        throw new Error('Invalid or expired reset link')
      }

      // Set the session with the tokens from the URL
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (sessionError) throw sessionError

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) throw updateError

      // Sign out and redirect to login
      await supabase.auth.signOut()
      navigate('/login', { 
        state: { message: 'Password reset successfully! Please sign in with your new password.' } 
      })
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError(err.message || 'Failed to reset password. Please try again or request a new reset link.')
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
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter new password"
                minLength={6}
              />
              <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters</p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Confirm new password"
                minLength={6}
              />
            </div>
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
                  Resetting password...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
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

