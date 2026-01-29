import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    checkUser()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        checkAdminRole(session.user.id)
      } else {
        setUser(null)
        setIsAdmin(false)
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
        setIsAdmin(false)
        navigate('/login')
      } else {
        setIsAdmin(true)
      }
    } catch (error) {
      console.error('Error checking admin role:', error)
      setIsAdmin(false)
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
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium">Subscribers</span>
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
              
              {/* Website Link */}
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
              
              {/* LinkedIn Link */}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.email}</p>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Newsletter Subscribers Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Newsletter Subscribers</h2>
              <NewsletterStats />
            </div>

            {/* Notes Management Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes Management</h2>
              <NotesStats />
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/notes')}
                  className="w-full text-left bg-primary-50 text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  View All Notes
                </button>
                <button
                  onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                  className="w-full text-left bg-gray-50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Open Supabase Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* User Management Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Admin User Management</h2>
            <UserManagement />
          </div>
        </div>
      </div>
    </div>
  )
}

function NewsletterStats() {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    fetchCount()
  }, [])

  const fetchCount = async () => {
    try {
      const { count, error } = await supabase
        .from('newsletter')
        .select('*', { count: 'exact', head: true })

      if (error) throw error
      setCount(count)
    } catch (error) {
      console.error('Error fetching newsletter count:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-3xl font-bold text-primary-600">...</div>
  }

  return (
    <div>
      <div className="text-3xl font-bold text-primary-600">{count ?? 0}</div>
      <p className="text-gray-600 text-sm mt-2">Total subscribers</p>
    </div>
  )
}

function NotesStats() {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    fetchCount()
  }, [])

  const fetchCount = async () => {
    try {
      const { count, error } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })

      if (error) throw error
      setCount(count)
    } catch (error) {
      console.error('Error fetching notes count:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-3xl font-bold text-primary-600">...</div>
  }

  return (
    <div>
      <div className="text-3xl font-bold text-primary-600">{count ?? 0}</div>
      <p className="text-gray-600 text-sm mt-2">Total notes</p>
    </div>
  )
}

function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .eq('role', 'admin')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  return (
    <div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Users</h3>
        {loadingUsers ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        ) : users.length === 0 ? (
          <p className="text-gray-500 text-sm">No admin users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

