import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function EmailCampaign() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [subject, setSubject] = useState('')
  const [recipients, setRecipients] = useState('')
  const [recipientSource, setRecipientSource] = useState<'manual' | 'all' | 'subscribers' | 'unsubscribed'>('manual')
  const [loadingRecipients, setLoadingRecipients] = useState(false)
  const [contentType, setContentType] = useState<'text' | 'html'>('text')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    checkUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        checkAdminRole(session.user.id)
      } else {
        setUser(null)
        navigate('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error || !data || data.role !== 'admin') {
        navigate('/login')
      }
    } catch (error) {
      console.error('Error checking admin role:', error)
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await checkAdminRole(session.user.id)
      } else {
        navigate('/login')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error checking user:', error)
      navigate('/login')
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const fetchRecipientsFromSource = async (source: 'all' | 'subscribers' | 'unsubscribed') => {
    setLoadingRecipients(true)
    setMessage(null)

    try {
      let query = supabase
        .from('newsletter')
        .select('email')
        .order('created_at', { ascending: false })

      if (source === 'subscribers') {
        query = query.eq('unsubscribed', false)
      } else if (source === 'unsubscribed') {
        query = query.eq('unsubscribed', true)
      }
      // For 'all', no filter is applied

      const { data, error } = await query

      if (error) throw error

      const emailList = (data || []).map(item => item.email).join(', ')
      setRecipients(emailList)
      setRecipientSource(source)

      if (data && data.length > 0) {
        setMessage({
          type: 'success',
          text: `Loaded ${data.length} email${data.length !== 1 ? 's' : ''} from ${source === 'all' ? 'all users' : source === 'subscribers' ? 'subscribers' : 'unsubscribed users'}`,
        })
      } else {
        setMessage({
          type: 'error',
          text: `No emails found for ${source === 'all' ? 'all users' : source === 'subscribers' ? 'subscribers' : 'unsubscribed users'}`,
        })
      }
    } catch (error: any) {
      console.error('Error fetching recipients:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Failed to fetch recipients. Please try again.',
      })
    } finally {
      setLoadingRecipients(false)
    }
  }

  const handleRecipientSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'manual' | 'all' | 'subscribers' | 'unsubscribed'
    
    if (value === 'manual') {
      setRecipientSource('manual')
      setRecipients('')
      setMessage(null)
    } else {
      fetchRecipientsFromSource(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!subject.trim()) {
      setMessage({ type: 'error', text: 'Subject is required' })
      return
    }

    if (!recipients.trim()) {
      setMessage({ type: 'error', text: 'At least one recipient is required' })
      return
    }

    if (!content.trim()) {
      setMessage({ type: 'error', text: 'Email content is required' })
      return
    }

    // Parse recipients (comma or newline separated)
    const recipientList = recipients
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0)

    if (recipientList.length === 0) {
      setMessage({ type: 'error', text: 'Please enter at least one valid email address' })
      return
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = recipientList.filter(email => !emailRegex.test(email))
    if (invalidEmails.length > 0) {
      setMessage({ type: 'error', text: `Invalid email addresses: ${invalidEmails.join(', ')}` })
      return
    }

    setSending(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          subject,
          recipients: recipientList,
          contentType,
          content,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send emails')
      }

      setMessage({
        type: 'success',
        text: `Successfully sent ${result.sentCount || recipientList.length} email(s)`,
      })

      // Reset form
      setSubject('')
      setRecipients('')
      setContent('')
      setContentType('text')
    } catch (error: any) {
      console.error('Error sending emails:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Failed to send emails. Please try again.',
      })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-white shadow-lg fixed h-full left-0 top-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <img
                src="/images/ballfour-foundation-logo.png"
                alt="Ball Four Foundation"
                className="h-10 w-auto"
              />
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
          </div>

          <nav className="space-y-2 mb-8 flex-1">
            <Link
              to="/admin"
              className={`block px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/admin'
                  ? 'bg-primary-50 border-l-4 border-primary-600 text-primary-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-sm font-medium">Dashboard</span>
              </div>
            </Link>
            <Link
              to="/admin/add-user"
              className={`block px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/admin/add-user'
                  ? 'bg-primary-50 border-l-4 border-primary-600 text-primary-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">Add User</span>
              </div>
            </Link>
            <Link
              to="/admin/subscribers"
              className={`block px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/admin/subscribers'
                  ? 'bg-primary-50 border-l-4 border-primary-600 text-primary-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium">Subscribers</span>
              </div>
            </Link>
            <Link
              to="/admin/applications"
              className={`block px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/admin/applications'
                  ? 'bg-primary-50 border-l-4 border-primary-600 text-primary-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium">Applications</span>
              </div>
            </Link>
            <Link
              to="/admin/email-campaign"
              className={`block px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/admin/email-campaign'
                  ? 'bg-primary-50 border-l-4 border-primary-600 text-primary-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Email Campaign</span>
              </div>
            </Link>
            
            {/* Marketing Module */}
            <div className="pt-4 border-t border-gray-200">
              <p className="px-4 text-xs text-gray-500 uppercase tracking-wider mb-2">Marketing Module</p>
              
              <Link
                to="/admin/marketing/website"
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === '/admin/marketing/website'
                    ? 'bg-primary-50 border-l-4 border-primary-600 text-primary-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm font-medium">Website</span>
                </div>
              </Link>
              
              <Link
                to="/admin/marketing/linkedin"
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === '/admin/marketing/linkedin'
                    ? 'bg-primary-50 border-l-4 border-primary-600 text-primary-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="text-sm font-medium">LinkedIn</span>
                </div>
              </Link>
            </div>
          </nav>

          <div className="border-t border-gray-200 pt-6">
            <div className="px-4 mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Account</p>
              <p className="text-sm text-gray-700 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Menu Button */}
        <div className="lg:hidden bg-white shadow-md p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 hover:text-primary-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Campaign</h1>
            <p className="text-gray-600">Send emails to multiple recipients individually</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter email subject"
                required
              />
            </div>

            {/* Recipients */}
            <div>
              <label htmlFor="recipientSource" className="block text-sm font-medium text-gray-700 mb-2">
                Select Recipients
              </label>
              <select
                id="recipientSource"
                value={recipientSource}
                onChange={handleRecipientSourceChange}
                disabled={loadingRecipients}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="manual">Manual Entry</option>
                <option value="all">All Users</option>
                <option value="subscribers">Subscribers</option>
                <option value="unsubscribed">Unsubscribed Users</option>
              </select>
              
              <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-2">
                Recipients <span className="text-red-500">*</span>
                {loadingRecipients && (
                  <span className="ml-2 text-xs text-gray-500">(Loading...)</span>
                )}
              </label>
              <textarea
                id="recipients"
                value={recipients}
                onChange={(e) => {
                  setRecipients(e.target.value)
                  if (recipientSource !== 'manual') {
                    setRecipientSource('manual')
                  }
                }}
                disabled={loadingRecipients}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter email addresses separated by commas or new lines&#10;example@email.com, another@email.com"
                rows={4}
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                {recipientSource === 'manual' 
                  ? 'Enter email addresses manually, or select from the dropdown above to auto-populate.'
                  : 'You can edit the email list manually. Each recipient will receive an individual email.'}
              </p>
            </div>

            {/* Content Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Format <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="contentType"
                    value="text"
                    checked={contentType === 'text'}
                    onChange={(e) => setContentType(e.target.value as 'text' | 'html')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Plain Text</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="contentType"
                    value="html"
                    checked={contentType === 'html'}
                    onChange={(e) => setContentType(e.target.value as 'text' | 'html')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">HTML</span>
                </label>
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Email Content <span className="text-red-500">*</span>
              </label>
              {contentType === 'html' ? (
                <div className="space-y-4">
                  <div>
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                      placeholder="Enter HTML code for your email&#10;&lt;html&gt;&#10;  &lt;body&gt;&#10;    &lt;h1&gt;Hello&lt;/h1&gt;&#10;    &lt;p&gt;Your email content here&lt;/p&gt;&#10;  &lt;/body&gt;&#10;&lt;/html&gt;"
                      rows={15}
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Enter HTML code. The email will be formatted according to your HTML structure.
                    </p>
                  </div>
                  
                  {/* HTML Preview */}
                  {content.trim() && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preview
                      </label>
                      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Email Preview</span>
                          <span className="text-xs text-gray-500">This is how your email will appear</span>
                        </div>
                        <div className="p-4 bg-white" style={{ minHeight: '300px' }}>
                          <iframe
                            title="Email Preview"
                            srcDoc={(() => {
                              let htmlContent = content.trim()
                              // Wrap in proper HTML structure if not already wrapped
                              if (!htmlContent.toLowerCase().includes('<html')) {
                                htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
${htmlContent}
</body>
</html>`
                              }
                              return htmlContent
                            })()}
                            className="w-full border-0"
                            style={{ minHeight: '300px', width: '100%' }}
                            sandbox="allow-same-origin"
                          />
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Preview updates automatically as you type. Note: Some email clients may render HTML differently.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your email content as plain text"
                  rows={15}
                  required
                />
              )}
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={sending}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Emails'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubject('')
                  setRecipients('')
                  setRecipientSource('manual')
                  setContent('')
                  setContentType('text')
                  setMessage(null)
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
