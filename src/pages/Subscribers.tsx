import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Newsletter } from '../types/supabase'

export default function Subscribers() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const location = useLocation()
  const [subscribers, setSubscribers] = useState<Newsletter[]>([])
  const [unsubscribedSubscribers, setUnsubscribedSubscribers] = useState<Newsletter[]>([])
  const [loadingSubscribers, setLoadingSubscribers] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<'active' | 'unsubscribed'>('active')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; subscriberId: number | null; subscriberEmail: string; action: 'unsubscribe' | 'delete' | 'resubscribe' }>({
    show: false,
    subscriberId: null,
    subscriberEmail: '',
    action: 'delete',
  })
  const [deleting, setDeleting] = useState<boolean>(false)
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
        fetchSubscribers()
        fetchUnsubscribedSubscribers()
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

  const fetchSubscribers = async () => {
    try {
      setLoadingSubscribers(true)
      const { data, error } = await supabase
        .from('newsletter')
        .select('*')
        .eq('unsubscribed', false) // Only fetch active subscribers
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubscribers(data || [])
    } catch (error) {
      console.error('Error fetching subscribers:', error)
    } finally {
      setLoadingSubscribers(false)
    }
  }

  const fetchUnsubscribedSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter')
        .select('*')
        .eq('unsubscribed', true) // Only fetch unsubscribed subscribers
        .order('created_at', { ascending: false })

      if (error) throw error
      setUnsubscribedSubscribers(data || [])
    } catch (error) {
      console.error('Error fetching unsubscribed subscribers:', error)
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

  const handleUnsubscribeClick = (subscriberId: number, subscriberEmail: string) => {
    setDeleteConfirm({
      show: true,
      subscriberId,
      subscriberEmail,
      action: 'unsubscribe',
    })
  }

  const handleDeleteClick = (subscriberId: number, subscriberEmail: string) => {
    setDeleteConfirm({
      show: true,
      subscriberId,
      subscriberEmail,
      action: 'delete',
    })
  }

  const handleCancelAction = () => {
    setDeleteConfirm({
      show: false,
      subscriberId: null,
      subscriberEmail: '',
      action: 'delete',
    })
  }

  const handleResubscribeClick = (subscriberId: number, subscriberEmail: string) => {
    setDeleteConfirm({
      show: true,
      subscriberId,
      subscriberEmail,
      action: 'resubscribe',
    })
  }

  const handleConfirmAction = async () => {
    if (!deleteConfirm.subscriberId) return

    setDeleting(true)

    try {
      if (deleteConfirm.action === 'unsubscribe') {
        // Mark as unsubscribed instead of deleting
        const { error } = await supabase
          .from('newsletter')
          .update({ unsubscribed: true })
          .eq('id', deleteConfirm.subscriberId)

        if (error) throw error
        
        // Refresh both lists
        await Promise.all([fetchSubscribers(), fetchUnsubscribedSubscribers()])
      } else if (deleteConfirm.action === 'resubscribe') {
        // Mark as subscribed again
        const { error } = await supabase
          .from('newsletter')
          .update({ unsubscribed: false })
          .eq('id', deleteConfirm.subscriberId)

        if (error) throw error
        
        // Refresh both lists
        await Promise.all([fetchSubscribers(), fetchUnsubscribedSubscribers()])
        
        // Switch to active tab to show the resubscribed user
        setActiveTab('active')
      } else {
        // Permanently delete from database
        const { error } = await supabase
          .from('newsletter')
          .delete()
          .eq('id', deleteConfirm.subscriberId)

        if (error) throw error
        
        // Refresh both lists
        await Promise.all([fetchSubscribers(), fetchUnsubscribedSubscribers()])
      }
      
      setDeleteConfirm({
        show: false,
        subscriberId: null,
        subscriberEmail: '',
        action: 'delete',
      })
    } catch (error: any) {
      console.error('Error processing action:', error)
      const actionText = deleteConfirm.action === 'unsubscribe' 
        ? 'unsubscribe' 
        : deleteConfirm.action === 'resubscribe' 
        ? 'resubscribe' 
        : 'delete'
      alert(`Failed to ${actionText} subscriber. Please try again.`)
    } finally {
      setDeleting(false)
    }
  }

  // Get the current list based on active tab
  const currentList = activeTab === 'active' ? subscribers : unsubscribedSubscribers

  // Filter subscribers based on search term
  const filteredSubscribers = currentList.filter((subscriber) => {
    const search = searchTerm.toLowerCase()
    return (
      subscriber.email.toLowerCase().includes(search) ||
      subscriber.first_name?.toLowerCase().includes(search) ||
      subscriber.last_name?.toLowerCase().includes(search)
    )
  })

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
              className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Dashboard
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
            <div className="px-4 py-3 bg-primary-50 border-l-4 border-primary-600 rounded">
              <p className="text-sm font-semibold text-primary-700">Subscribers</p>
            </div>
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
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
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
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-8 mb-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold">Newsletter Subscribers</h1>
                <p className="text-primary-100 mt-2">Manage and view all newsletter subscribers</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-6 text-primary-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{subscribers.length} active subscriber{subscribers.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <span className="text-sm">{unsubscribedSubscribers.length} unsubscribed</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg p-2 mb-8 border border-gray-100">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveTab('active')
                  setSearchTerm('')
                }}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'active'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Active Subscribers ({subscribers.length})
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('unsubscribed')
                  setSearchTerm('')
                }}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'unsubscribed'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Unsubscribed ({unsubscribedSubscribers.length})
                </div>
              </button>
            </div>
          </div>

          {/* Search and Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <label htmlFor="search" className="sr-only">Search subscribers</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by email, first name, or last name..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Showing</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {filteredSubscribers.length} of {currentList.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            {loadingSubscribers ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="text-gray-500 text-sm mt-4">Loading subscribers...</p>
              </div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500 font-medium">
                  {searchTerm ? 'No subscribers found matching your search' : 'No subscribers found'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Subscribed
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubscribers.map((subscriber) => {
                      const fullName = [subscriber.first_name, subscriber.last_name]
                        .filter(Boolean)
                        .join(' ') || 'N/A'
                      
                      return (
                        <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary-100 p-2 rounded-full">
                                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{fullName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <a
                              href={`mailto:${subscriber.email}`}
                              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                            >
                              {subscriber.email}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {subscriber.created_at
                                ? new Date(subscriber.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              {activeTab === 'active' ? (
                                <>
                                  <button
                                    onClick={() => handleUnsubscribeClick(subscriber.id, subscriber.email)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                                    title="Unsubscribe from newsletter"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                    Unsubscribe
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(subscriber.id, subscriber.email)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Delete subscriber completely"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleResubscribeClick(subscriber.id, subscriber.email)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                    title="Resubscribe to newsletter"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Resubscribe
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(subscriber.id, subscriber.email)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Delete subscriber completely"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-full ${
                deleteConfirm.action === 'unsubscribe' 
                  ? 'bg-orange-100' 
                  : deleteConfirm.action === 'resubscribe'
                  ? 'bg-green-100'
                  : 'bg-red-100'
              }`}>
                {deleteConfirm.action === 'unsubscribe' ? (
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                ) : deleteConfirm.action === 'resubscribe' ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {deleteConfirm.action === 'unsubscribe' 
                    ? 'Unsubscribe Subscriber' 
                    : deleteConfirm.action === 'resubscribe'
                    ? 'Resubscribe Subscriber'
                    : 'Delete Subscriber'}
                </h3>
                <p className="text-sm text-gray-500">
                  {deleteConfirm.action === 'resubscribe' 
                    ? 'This will add them back to the active subscribers list'
                    : 'This action cannot be undone'}
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to {
                deleteConfirm.action === 'unsubscribe' 
                  ? 'unsubscribe' 
                  : deleteConfirm.action === 'resubscribe'
                  ? 'resubscribe'
                  : 'permanently delete'
              }{' '}
              <span className="font-semibold">{deleteConfirm.subscriberEmail}</span>?
              {deleteConfirm.action === 'delete' && (
                <span className="block mt-2 text-sm text-red-600">
                  This will completely remove the subscriber from the system.
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelAction}
                disabled={deleting}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={deleting}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  deleteConfirm.action === 'unsubscribe'
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : deleteConfirm.action === 'resubscribe'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {deleteConfirm.action === 'unsubscribe' 
                      ? 'Unsubscribing...' 
                      : deleteConfirm.action === 'resubscribe'
                      ? 'Resubscribing...'
                      : 'Deleting...'}
                  </>
                ) : (
                  <>
                    {deleteConfirm.action === 'unsubscribe' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    ) : deleteConfirm.action === 'resubscribe' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    {deleteConfirm.action === 'unsubscribe' 
                      ? 'Unsubscribe' 
                      : deleteConfirm.action === 'resubscribe'
                      ? 'Resubscribe'
                      : 'Delete'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

