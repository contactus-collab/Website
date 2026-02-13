import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export type ApplicationStatus = 'pending' | 'granted' | 'rejected'

export interface GrantApplication {
  id: number
  child_name: string
  email: string
  phone: string | null
  parent_name: string | null
  additional_notes: string | null
  status: ApplicationStatus
  created_at: string
}

export default function Applications() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [applications, setApplications] = useState<GrantApplication[]>([])
  const [loadingApplications, setLoadingApplications] = useState<boolean>(true)
  const [selectedApp, setSelectedApp] = useState<GrantApplication | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<GrantApplication | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
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
      } else {
        fetchApplications()
      }
    } catch (error) {
      console.error('Error checking admin role:', error)
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      setLoadingApplications(true)
      const { data, error } = await supabase
        .from('grant_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplications(
        (data || []).map((row: any) => ({
          ...row,
          status: row.status ?? 'pending',
        }))
      )
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoadingApplications(false)
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

  const sendStatusEmail = async (app: GrantApplication, status: 'granted' | 'rejected') => {
    // Use a fresh session so the access token is not expired (edge function validates the JWT)
    const { data: { session }, error: sessionError } = await supabase.auth.refreshSession()
    if (sessionError || !session) throw new Error(sessionError?.message || 'Not authenticated')

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const isGranted = status === 'granted'
    const subject = isGranted
      ? 'Your grant application has been approved – Ball Four Foundation'
      : 'Update on your grant application – Ball Four Foundation'
    const content = isGranted
      ? `<p>Dear ${app.child_name}${app.parent_name ? ` and ${app.parent_name}` : ''},</p>
<p>We are pleased to inform you that your grant application has been <strong>approved</strong>.</p>
<p>You will receive further details about next steps shortly.</p>
<p>Thank you for your interest in Ball Four Foundation.</p>
<p>Best regards,<br/>Ball Four Foundation</p>`
      : `<p>Dear ${app.child_name}${app.parent_name ? ` and ${app.parent_name}` : ''},</p>
<p>Thank you for your interest in Ball Four Foundation and for submitting a grant application.</p>
<p>After careful review, we are unable to approve your application at this time.</p>
<p>We encourage you to apply again in the future when your circumstances or our criteria may have changed.</p>
<p>Best regards,<br/>Ball Four Foundation</p>`

    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({
        subject,
        recipients: [app.email],
        contentType: 'html',
        content,
      }),
    })

    let result: { error?: string; success?: boolean } = {}
    try {
      result = await response.json()
    } catch {
      result = { error: `Server returned ${response.status} (non-JSON). Check Supabase function logs.` }
    }
    if (!response.ok) {
      const msg = result.error || `HTTP ${response.status}. Check that send-email function and Gmail env vars are set in Supabase.`
      throw new Error(msg)
    }
    return result
  }

  const updateStatus = async (id: number, status: ApplicationStatus, app: GrantApplication) => {
    setActionLoading(true)
    setEmailMessage(null)
    try {
      const { error } = await supabase
        .from('grant_applications')
        .update({ status })
        .eq('id', id)
      if (error) throw error
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
      if (selectedApp?.id === id) setSelectedApp((prev) => (prev ? { ...prev, status } : null))

      if (status === 'granted' || status === 'rejected') {
        try {
          await sendStatusEmail(app, status)
          setEmailMessage({ type: 'success', text: `Status updated and ${status === 'granted' ? 'approval' : 'rejection'} email sent to ${app.email}.` })
        } catch (emailErr: any) {
          setEmailMessage({ type: 'error', text: `Status updated but email failed: ${emailErr?.message || 'Could not send email'}.` })
        }
      }
    } catch (err) {
      console.error('Error updating status:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setActionLoading(true)
    try {
      const { error } = await supabase.from('grant_applications').delete().eq('id', deleteConfirm.id)
      if (error) throw error
      setApplications((prev) => prev.filter((a) => a.id !== deleteConfirm.id))
      setDeleteConfirm(null)
      setSelectedApp((prev) => (prev?.id === deleteConfirm.id ? null : prev))
    } catch (err) {
      console.error('Error deleting application:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const statusBadge = (status: ApplicationStatus) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800',
      granted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    const labels = { pending: 'Pending', granted: 'Granted', rejected: 'Rejected' }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-600 mt-1">
              Grant applications from the Apply page. {applications.length} total · Click a row to view details.
            </p>
            {applications.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <span className="text-gray-500">
                  Pending: <strong className="text-amber-700">{applications.filter((a) => (a.status ?? 'pending') === 'pending').length}</strong>
                </span>
                <span className="text-gray-500">
                  Granted: <strong className="text-green-700">{applications.filter((a) => a.status === 'granted').length}</strong>
                </span>
                <span className="text-gray-500">
                  Rejected: <strong className="text-red-700">{applications.filter((a) => a.status === 'rejected').length}</strong>
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {loadingApplications ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-16 flex justify-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-16 text-center text-gray-500">
                No applications submitted yet.
              </div>
            ) : (
              applications.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => setSelectedApp(app)}
                  className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all p-4 sm:p-5 flex flex-wrap items-center gap-4 sm:gap-6"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="font-semibold text-gray-900">{app.child_name}</span>
                      {statusBadge(app.status ?? 'pending')}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 truncate">{app.email}</p>
                  </div>
                  <div className="text-sm text-gray-500 shrink-0">
                    {formatDate(app.created_at)}
                  </div>
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail modal */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => { setSelectedApp(null); setEmailMessage(null) }} />
              <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedApp.child_name}</h2>
                    <div className="mt-1">{statusBadge(selectedApp.status ?? 'pending')}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedApp(null); setEmailMessage(null) }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
                    <a href={`mailto:${selectedApp.email}`} className="text-primary-600 hover:underline">
                      {selectedApp.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</p>
                    <p className="text-gray-900">{selectedApp.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Parent name</p>
                    <p className="text-gray-900">{selectedApp.parent_name || '—'}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Additional notes</p>
                    <div className="max-h-[200px] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/50 p-3">
                      <p className="text-gray-900 whitespace-pre-wrap text-sm leading-relaxed break-words">
                        {selectedApp.additional_notes || '—'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</p>
                    <p className="text-gray-600">{formatDate(selectedApp.created_at)}</p>
                  </div>
                </div>
                {emailMessage && (
                  <div
                    role="alert"
                    className={`mx-6 mb-2 px-4 py-3 rounded-lg text-sm ${
                      emailMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {emailMessage.text}
                  </div>
                )}
                <p className="px-6 text-xs text-gray-500 mb-2">
                  Grant and Rejected emails are sent to the applicant’s email address above.
                </p>
                <div className="p-6 border-t border-gray-100 flex flex-wrap gap-3">
                  {selectedApp.status !== 'granted' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => updateStatus(selectedApp.id, 'granted', selectedApp)}
                      className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-70"
                    >
                      Grant
                    </button>
                  )}
                  {selectedApp.status !== 'rejected' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => updateStatus(selectedApp.id, 'rejected', selectedApp)}
                      className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-70"
                    >
                      Rejected
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setDeleteConfirm(selectedApp)}
                    className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-70"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedApp(null); setEmailMessage(null) }}
                    className="ml-auto px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-[60] overflow-y-auto" aria-modal="true" role="dialog">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
              <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                <p className="text-gray-900 font-medium">Delete this application?</p>
                <p className="mt-1 text-sm text-gray-600">
                  Application from {deleteConfirm.child_name} will be permanently removed.
                </p>
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-70"
                  >
                    {actionLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
