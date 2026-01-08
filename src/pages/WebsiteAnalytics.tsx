import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface AnalyticsData {
  users: number
  newUsers: number
  sessions: number
  pageViews: number
  eventCount: number
  bounceRate: number
  avgSessionDuration: number
  previousUsers: number
  totalVisitors: number
  averageDaily: number
  peakVisitors: number
  currentVisitors: number
  percentageChange: number
  pageViewsList: Array<{ page: string; title: string; views: number; users: number }>
  dateRange: { start: string; end: string }
  previousDateRange: { start: string; end: string }
  dailyComparisonData?: Array<{ date: string; last7days: number; previous7days: number }>
}

type DateRangeType = '7days' | '30days' | '60days' | '90days' | 'custom'

export default function WebsiteAnalytics() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRangeType>('7days')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
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
        fetchAnalyticsData()
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

  const fetchAnalyticsData = async () => {
    setLoadingAnalytics(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
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
      const response = await fetch(`${supabaseUrl}/functions/v1/get-analytics?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        // Don't set analytics data if there's an error
        throw new Error(result.error || 'Failed to fetch analytics data')
      }

      // Only set data if we have valid analytics data
      if (result.data) {
        console.log('Analytics data received:', result.data)
        console.log('Daily comparison data:', result.data.dailyComparisonData)
        setAnalyticsData(result.data)
      } else {
        throw new Error('No analytics data available')
      }
    } catch (err: any) {
      console.error('Error fetching analytics:', err)
      setError(err.message || 'Failed to load analytics data. Please try again.')
    } finally {
      setLoadingAnalytics(false)
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
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Website Analytics</h1>
                  <p className="text-primary-100 mt-1">Google Analytics data for your website</p>
                </div>
              </div>
              <button
                onClick={fetchAnalyticsData}
                disabled={loadingAnalytics}
                className="bg-white text-primary-700 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className={`w-5 h-5 ${loadingAnalytics ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-8">
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

          {/* Analytics Content */}
          {loadingAnalytics ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Loading analytics data...</p>
            </div>
          ) : analyticsData && analyticsData.users !== undefined ? (
            <div className="space-y-6">
              {/* Key Metrics - Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Visitors */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 relative overflow-hidden">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Visitors</h3>
                  <p className="text-4xl font-bold text-green-600 mb-1">
                    {(analyticsData.totalVisitors ?? 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Period total</p>
                </div>

                {/* Average Daily */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 relative overflow-hidden">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Average Daily</h3>
                  <p className="text-4xl font-bold text-blue-600 mb-1">
                    {(analyticsData.averageDaily ?? 0).toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">Visitors per day</p>
                </div>

                {/* Peak Visitors */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 relative overflow-hidden">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Peak Visitors</h3>
                  <p className="text-4xl font-bold text-purple-600 mb-1">
                    {(analyticsData.peakVisitors ?? 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Highest single day</p>
                </div>

                {/* Current */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 relative overflow-hidden">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Current</h3>
                  <p className="text-4xl font-bold text-green-600 mb-1">
                    {(analyticsData.currentVisitors ?? 0).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <svg 
                      className={`w-3 h-3 ${(analyticsData.percentageChange ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={(analyticsData.percentageChange ?? 0) >= 0 ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                      />
                    </svg>
                    <span className={`text-sm font-medium ${(analyticsData.percentageChange ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {(analyticsData.percentageChange ?? 0) >= 0 ? '+' : ''}{(analyticsData.percentageChange ?? 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Comparison Graph - Last 7 days vs Previous period (Like Google Analytics Dashboard) */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
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
                              fetchAnalyticsData()
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
                {analyticsData.dailyComparisonData && analyticsData.dailyComparisonData.length > 0 ? (
                  <div style={{ width: '100%', height: '400px', minHeight: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={analyticsData.dailyComparisonData} 
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
                          domain={[0, (dataMax: number) => Math.max(dataMax + 2, 5)]}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                          formatter={(value: number | undefined) => value !== undefined ? value.toLocaleString() : '0'}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="line"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="last7days" 
                          stroke="#4285f4" 
                          strokeWidth={3}
                          name={
                            dateRange === 'custom' 
                              ? 'Selected period' 
                              : `Last ${dateRange.replace('days', '')} days`
                          }
                          dot={{ r: 4, fill: '#4285f4' }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="previous7days" 
                          stroke="#4285f4" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Previous period"
                          dot={{ r: 4, fill: '#4285f4' }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[400px] flex flex-col items-center justify-center text-gray-500">
                    <p className="mb-2">No comparison data available</p>
                    {analyticsData && (
                      <p className="text-xs text-gray-400">
                        dailyComparisonData: {analyticsData.dailyComparisonData ? `exists (length: ${analyticsData.dailyComparisonData.length})` : 'missing'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Page Views List */}
              {analyticsData.pageViewsList && analyticsData.pageViewsList.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Page Views by Page</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Page
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Page Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Views
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Users
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analyticsData.pageViewsList.map((page, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="bg-primary-100 text-primary-700 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm">
                                  {index + 1}
                                </div>
                                <span className="text-sm font-medium text-gray-900">{page.page}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600">{page.title}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-gray-900">{page.views.toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">{page.users.toLocaleString()}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-600 mb-2 font-semibold">No Analytics Data Available</p>
              <p className="text-sm text-gray-500 mb-4">
                {error 
                  ? 'Google Analytics API integration is required. Please complete the setup following the guide.'
                  : 'Please complete the Google Analytics API integration to view data.'}
              </p>
              {error && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left max-w-md mx-auto">
                  <p className="text-sm text-blue-800">
                    <strong>Setup Required:</strong> See <code className="bg-blue-100 px-2 py-1 rounded">GOOGLE_ANALYTICS_SETUP.md</code> for instructions on configuring the Google Analytics API.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

