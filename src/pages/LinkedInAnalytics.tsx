import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface LinkedInData {
  followersData: Array<{ date: string; value: number }>
  distributionData: Array<{ key: string; value: number }>
  industryDistributionData?: Array<{ key: string; value: number }>
  metrics: {
    totalFollowers: number
    currentFollowers: number
    previousFollowers: number
    changePercentage: number
    peakFollowers: number
    averageFollowers: number
  }
  dateRange: { start: string; end: string }
}

type DateRangeType = '7days' | '30days' | '60days' | '90days' | 'custom'

export default function LinkedInAnalytics() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [linkedInData, setLinkedInData] = useState<LinkedInData | null>(null)
  const [loadingData, setLoadingData] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRangeType>('7days')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage] = useState<number>(10)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user)
        checkAdminRole(session.user.id)
      } else {
        setCurrentUser(null)
        navigate('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  useEffect(() => {
    if (currentUser) {
      // Only auto-fetch if not using custom date range
      // For custom range, fetch only when Apply button is clicked
      if (dateRange !== 'custom' || (customStartDate && customEndDate)) {
        fetchLinkedInData()
      }
    }
  }, [currentUser, dateRange])

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
        setCurrentUser(session.user)
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

  const fetchLinkedInData = async () => {
    setLoadingData(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('Not authenticated')
      }

      // Build query parameters based on date range
      const params = new URLSearchParams()
      params.append('dateRange', dateRange)
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        params.append('startDate', customStartDate)
        params.append('endDate', customEndDate)
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/functions/v1/get-linkedin-analytics?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch LinkedIn analytics data')
      }

      if (result.data) {
        console.log('LinkedIn data received:', result.data)
        setLinkedInData(result.data)
        setCurrentPage(1) // Reset to first page when new data is loaded
      } else {
        throw new Error('No LinkedIn analytics data available')
      }
    } catch (err: any) {
      console.error('Error fetching LinkedIn analytics:', err)
      setError(err.message || 'Failed to load LinkedIn analytics data. Please try again.')
    } finally {
      setLoadingData(false)
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
              <p className="text-sm text-gray-700 truncate">{currentUser?.email}</p>
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
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn Analytics
                </h1>
                <p className="text-gray-600 mt-1">Track your LinkedIn follower growth and engagement</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl shadow-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold">Error loading analytics</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loadingData ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Loading LinkedIn analytics data...</p>
            </div>
          ) : linkedInData ? (
            <div className="space-y-6">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Followers */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600 relative overflow-hidden">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Followers</h3>
                  <p className="text-4xl font-bold text-blue-600 mb-1">
                    {linkedInData.metrics.totalFollowers.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Current followers</p>
                </div>

                {/* Average Followers */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 relative overflow-hidden">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Average</h3>
                  <p className="text-4xl font-bold text-blue-500 mb-1">
                    {linkedInData.metrics.averageFollowers.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">Average followers</p>
                </div>

                {/* Peak Followers */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-400 relative overflow-hidden">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Peak Followers</h3>
                  <p className="text-4xl font-bold text-blue-400 mb-1">
                    {linkedInData.metrics.peakFollowers.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Highest count</p>
                </div>

                {/* Growth */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 relative overflow-hidden">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Growth</h3>
                  <p className="text-4xl font-bold text-green-600 mb-1">
                    {linkedInData.metrics.currentFollowers.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <svg 
                      className={`w-3 h-3 ${linkedInData.metrics.changePercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={linkedInData.metrics.changePercentage >= 0 ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                      />
                    </svg>
                    <span className={`text-sm font-medium ${linkedInData.metrics.changePercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {linkedInData.metrics.changePercentage >= 0 ? '+' : ''}{linkedInData.metrics.changePercentage.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">vs period start</p>
                </div>
              </div>

              {/* Followers Growth Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">Followers Over Time</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {dateRange === 'custom' && (
                      <div className="flex gap-2 items-center">
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button
                          onClick={() => {
                            if (customStartDate && customEndDate) {
                              fetchLinkedInData()
                            }
                          }}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                    <select
                      value={dateRange}
                      onChange={(e) => {
                        const newRange = e.target.value as DateRangeType
                        setDateRange(newRange)
                        if (newRange !== 'custom') {
                          setCustomStartDate('')
                          setCustomEndDate('')
                        }
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                    >
                      <option value="7days">Last 7 days</option>
                      <option value="30days">Last 30 days</option>
                      <option value="60days">Last 60 days</option>
                      <option value="90days">Last 90 days</option>
                      <option value="custom">Custom date range</option>
                    </select>
                  </div>
                </div>
                {linkedInData.followersData && linkedInData.followersData.length > 0 ? (
                  <div style={{ width: '100%', height: '400px', minHeight: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={linkedInData.followersData} 
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          stroke="#9ca3af"
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          stroke="#9ca3af"
                          domain={['dataMin - 1', 'dataMax + 1']}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                          formatter={(value: number | undefined) => value !== undefined ? value.toLocaleString() : '0'}
                          labelStyle={{ fontWeight: 600 }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="line"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#0077b5" 
                          strokeWidth={3}
                          name="Followers"
                          dot={{ r: 4, fill: '#0077b5' }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[400px] flex flex-col items-center justify-center text-gray-500">
                    <p className="mb-2">No followers data available</p>
                  </div>
                )}
              </div>

              {/* Follower Distribution by Function */}
              {linkedInData.distributionData && linkedInData.distributionData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pie Chart */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Followers by Function</h3>
                    <div style={{ width: '100%', height: '400px', minHeight: '400px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={linkedInData.distributionData.slice(0, 10)}
                            cx="50%"
                            cy="45%"
                            labelLine={false}
                            label={({ key, percent }) => {
                              if (percent < 0.05) return '' // Don't show labels for slices less than 5%
                              const displayKey = key.length > 15 ? `${key.substring(0, 15)}...` : key
                              return `${displayKey}: ${(percent * 100).toFixed(1)}%`
                            }}
                            outerRadius={110}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {linkedInData.distributionData.slice(0, 10).map((entry, index) => {
                              const colors = [
                                '#0077b5', '#00a0dc', '#008cc9', '#006699', '#004d73',
                                '#5f9ea0', '#4682b4', '#6b8e23', '#b8860b', '#cd853f'
                              ]
                              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            })}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number, name: string, props: any) => [
                              `${value.toFixed(2)}%`,
                              props.payload.key
                            ]}
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                          />
                          <Legend 
                            wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                            formatter={(value) => {
                              const displayValue = value.length > 20 ? `${value.substring(0, 20)}...` : value
                              return displayValue
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Industry Distribution Bar Chart */}
                  {linkedInData.industryDistributionData && linkedInData.industryDistributionData.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Follower Distribution by Industry</h3>
                      <div style={{ width: '100%', height: '400px', minHeight: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={linkedInData.industryDistributionData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                            <XAxis 
                              type="number" 
                              tick={{ fontSize: 12, fill: '#6b7280' }} 
                              stroke="#9ca3af"
                              label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis 
                              type="category" 
                              dataKey="key" 
                              tick={{ fontSize: 11, fill: '#6b7280' }} 
                              stroke="#9ca3af" 
                              width={200}
                              interval={0}
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                              formatter={(value: number) => `${value.toFixed(2)}%`}
                              labelStyle={{ fontWeight: 600 }}
                            />
                            <Legend />
                            <Bar 
                              dataKey="value" 
                              fill="#0077b5" 
                              radius={[0, 8, 8, 0]}
                              name="Percentage (%)"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* All Functions List */}
              {linkedInData.distributionData && linkedInData.distributionData.length > 0 && (() => {
                const totalPages = Math.ceil(linkedInData.distributionData.length / itemsPerPage)
                const startIndex = (currentPage - 1) * itemsPerPage
                const endIndex = startIndex + itemsPerPage
                const paginatedData = linkedInData.distributionData.slice(startIndex, endIndex)
                
                return (
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Complete Function Distribution</h3>
                      <span className="text-sm text-gray-600">
                        Showing {startIndex + 1}-{Math.min(endIndex, linkedInData.distributionData.length)} of {linkedInData.distributionData.length}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Function
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Percentage
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Visual
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedData.map((item, index) => (
                            <tr key={startIndex + index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm">
                                    {startIndex + index + 1}
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">{item.key}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-semibold text-gray-900">{item.value.toFixed(2)}%</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-xs">
                                    <div
                                      className="bg-blue-600 h-2.5 rounded-full"
                                      style={{ width: `${item.value}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            Previous
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(page => {
                                // Show first page, last page, current page, and pages around current
                                return (
                                  page === 1 ||
                                  page === totalPages ||
                                  (page >= currentPage - 1 && page <= currentPage + 1)
                                )
                              })
                              .map((page, index, array) => {
                                // Add ellipsis if there's a gap
                                const prevPage = array[index - 1]
                                const showEllipsis = prevPage && page - prevPage > 1
                                
                                return (
                                  <div key={page} className="flex items-center gap-1">
                                    {showEllipsis && (
                                      <span className="px-2 text-gray-500">...</span>
                                    )}
                                    <button
                                      onClick={() => setCurrentPage(page)}
                                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        currentPage === page
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  </div>
                                )
                              })}
                          </div>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            Next
                          </button>
                        </div>
                        <div className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <p className="text-gray-600 mb-2 font-semibold">No LinkedIn Analytics Data Available</p>
              <p className="text-sm text-gray-500 mb-4">
                {error 
                  ? 'Metricool API integration is required. Please complete the setup.'
                  : 'Please complete the Metricool API integration to view data.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

