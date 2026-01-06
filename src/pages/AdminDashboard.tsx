import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const navigate = useNavigate()

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
              className="block px-4 py-3 bg-primary-50 border-l-4 border-primary-600 rounded"
            >
              <p className="text-sm font-semibold text-primary-700">Dashboard</p>
            </Link>
            <Link
              to="/admin/add-user"
              className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">Add User</span>
              </div>
            </Link>
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

