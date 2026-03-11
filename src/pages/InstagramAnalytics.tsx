import { useEffect, useRef, useState } from 'react'
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

type DateRangeType = '60days' | '90days'

interface InstagramPost {
  postId: string
  userId: string
  type: string
  publishedAt: { dateTime: string; timezone: string }
  url: string
  content: string
  imageUrl: string
  likes: number
  comments: number
  shares: number
  interactions: number
  engagement: number
  reach: number
  saved: number
  impressionsTotal: number
  views: number
}

interface InstagramData {
  followersData: Array<{ date: string; value: number }>
  metrics: {
    currentFollowers: number
    previousFollowers: number
    changePercentage: number
    peakFollowers: number
    averageFollowers: number
  }
  posts: InstagramPost[]
}


export default function InstagramAnalytics() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [instagramData, setInstagramData] = useState<InstagramData | null>(null)
  const [loadingData, setLoadingData] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRangeType>('60days')
  const fetchAbortRef = useRef<AbortController | null>(null)
  const requestedRangeRef = useRef<DateRangeType | null>(null)
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
    return () => subscription.unsubscribe()
  }, [navigate])

  useEffect(() => {
    if (!currentUser) return
    fetchInstagramData()
  }, [currentUser, dateRange])

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single()
      if (error || !data || data.role !== 'admin') navigate('/login')
    } catch {
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
    } catch {
      navigate('/login')
      setLoading(false)
    }
  }

  const fetchInstagramData = async (overrideDateRange?: DateRangeType) => {
    const range = overrideDateRange ?? dateRange

    // Cancel any in-flight request so only the latest selection wins
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort()
    }
    const controller = new AbortController()
    fetchAbortRef.current = controller
    requestedRangeRef.current = range

    setLoadingData(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error('Not authenticated')

      const params = new URLSearchParams()
      params.append('dateRange', range)

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/functions/v1/get-instagram-analytics?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        signal: controller.signal,
        cache: 'no-store',
      })

      const result = await response.json()

      // Only apply this response if it's still the requested range (avoid stale response overwriting)
      if (requestedRangeRef.current !== range) return

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch Instagram analytics')
      }

      if (result.data) {
        setInstagramData({
          followersData: result.data.followersData ?? [],
          metrics: result.data.metrics ?? {
            currentFollowers: 0,
            previousFollowers: 0,
            changePercentage: 0,
            peakFollowers: 0,
            averageFollowers: 0,
          },
          posts: Array.isArray(result.data.posts) ? result.data.posts : [],
        })
      } else {
        throw new Error('No Instagram analytics data available')
      }
    } catch (err: unknown) {
      if (requestedRangeRef.current !== range) return
      if (err instanceof Error && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Failed to load Instagram analytics.')
    } finally {
      if (requestedRangeRef.current === range) {
        setLoadingData(false)
      }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FC] flex items-center justify-center font-sans">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F006A]" />
      </div>
    )
  }

  const sidebarNav = (
    <>
      <Link to="/admin" className={`block px-4 py-3 rounded-xl transition-colors ${location.pathname === '/admin' ? 'bg-[#ECE6FE] border-l-4 border-[#0F006A] text-[#0F006A] font-semibold' : 'text-gray-700 hover:bg-[#F5F3F9]'}`} onClick={() => setSidebarOpen(false)}>
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-sm font-medium">Dashboard</span>
        </div>
      </Link>
      <Link to="/admin/add-user" className={`block px-4 py-3 rounded-xl transition-colors ${location.pathname === '/admin/add-user' ? 'bg-[#ECE6FE] border-l-4 border-[#0F006A] text-[#0F006A] font-semibold' : 'text-gray-700 hover:bg-[#F5F3F9]'}`} onClick={() => setSidebarOpen(false)}>
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="text-sm font-medium">Add User</span>
        </div>
      </Link>
      <Link to="/admin/subscribers" className={`block px-4 py-3 rounded-xl transition-colors ${location.pathname === '/admin/subscribers' ? 'bg-[#ECE6FE] border-l-4 border-[#0F006A] text-[#0F006A] font-semibold' : 'text-gray-700 hover:bg-[#F5F3F9]'}`} onClick={() => setSidebarOpen(false)}>
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <span className="text-sm font-medium">Subscribers</span>
        </div>
      </Link>
      <Link to="/admin/applications" className={`block px-4 py-3 rounded-xl transition-colors ${location.pathname === '/admin/applications' ? 'bg-[#ECE6FE] border-l-4 border-[#0F006A] text-[#0F006A] font-semibold' : 'text-gray-700 hover:bg-[#F5F3F9]'}`} onClick={() => setSidebarOpen(false)}>
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span className="text-sm font-medium">Applications</span>
        </div>
      </Link>
      <Link to="/admin/email-campaign" className={`block px-4 py-3 rounded-xl transition-colors ${location.pathname === '/admin/email-campaign' ? 'bg-[#ECE6FE] border-l-4 border-[#0F006A] text-[#0F006A] font-semibold' : 'text-gray-700 hover:bg-[#F5F3F9]'}`} onClick={() => setSidebarOpen(false)}>
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          <span className="text-sm font-medium">Email Campaign</span>
        </div>
      </Link>
      <div className="pt-4 border-t border-gray-200">
        <p className="px-4 text-xs text-gray-500 uppercase tracking-wider mb-2">Events</p>
        <Link to="/admin/event-import" className={`block px-4 py-3 rounded-xl transition-colors ${location.pathname === '/admin/event-import' ? 'bg-[#ECE6FE] border-l-4 border-[#0F006A] text-[#0F006A] font-semibold' : 'text-gray-700 hover:bg-[#F5F3F9]'}`} onClick={() => setSidebarOpen(false)}>
          <div className="flex items-center gap-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg><span className="text-sm font-medium">Event Import</span></div>
        </Link>
        <Link to="/admin/events" className={`block px-4 py-3 rounded-xl transition-colors ${location.pathname === '/admin/events' ? 'bg-[#ECE6FE] border-l-4 border-[#0F006A] text-[#0F006A] font-semibold' : 'text-gray-700 hover:bg-[#F5F3F9]'}`} onClick={() => setSidebarOpen(false)}>
          <div className="flex items-center gap-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><span className="text-sm font-medium">Event Calendar</span></div>
        </Link>
      </div>
      <div className="pt-4 border-t border-gray-200">
        <p className="px-4 text-xs text-gray-500 uppercase tracking-wider mb-2">Marketing Module</p>
        <Link to="/admin/marketing/website" className={`block px-4 py-3 rounded-xl transition-colors ${location.pathname === '/admin/marketing/website' ? 'bg-[#ECE6FE] border-l-4 border-[#0F006A] text-[#0F006A] font-semibold' : 'text-gray-700 hover:bg-[#F5F3F9]'}`} onClick={() => setSidebarOpen(false)}>
          <div className="flex items-center gap-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg><span className="text-sm font-medium">Website</span></div>
        </Link>
        <Link to="/admin/marketing/linkedin" className={`block px-4 py-3 rounded-xl transition-colors ${location.pathname === '/admin/marketing/linkedin' ? 'bg-[#ECE6FE] border-l-4 border-[#0F006A] text-[#0F006A] font-semibold' : 'text-gray-700 hover:bg-[#F5F3F9]'}`} onClick={() => setSidebarOpen(false)}>
          <div className="flex items-center gap-3"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg><span className="text-sm font-medium">LinkedIn</span></div>
        </Link>
        <Link to="/admin/marketing/instagram" className={`block px-4 py-3 rounded-xl transition-colors ${location.pathname === '/admin/marketing/instagram' ? 'bg-[#ECE6FE] border-l-4 border-[#0F006A] text-[#0F006A] font-semibold' : 'text-gray-700 hover:bg-[#F5F3F9]'}`} onClick={() => setSidebarOpen(false)}>
          <div className="flex items-center gap-3"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg><span className="text-sm font-medium">Instagram</span></div>
        </Link>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#F8F7FC] flex font-sans">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`w-64 bg-white shadow-lg fixed h-full left-0 top-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <img src="/images/ballfour-foundation-logo.png" alt="Ball Four Foundation" className="h-10 w-auto" />
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <h2 className="text-xl font-bold text-[#0F006A]">Admin Panel</h2>
          </div>
          <nav className="space-y-2 mb-8 flex-1">{sidebarNav}</nav>
          <div className="border-t border-gray-200 pt-6">
            <div className="px-4 mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Account</p>
              <p className="text-sm text-gray-700 truncate">{currentUser?.email}</p>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#F5F3F9] rounded-xl transition-colors text-left">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64">
        <div className="lg:hidden bg-white shadow-md p-4">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-700 hover:text-[#0F006A]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  Instagram Analytics
                </h1>
                <p className="text-gray-600 mt-1">Track Instagram followers and post performance</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl shadow-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                  <p className="font-semibold">Error loading analytics</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loadingData ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F006A] mb-4" />
              <p className="text-gray-600">Loading Instagram analytics...</p>
            </div>
          ) : instagramData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Followers</h3>
                  <p className="text-4xl font-bold text-pink-600">{instagramData.metrics.currentFollowers.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Current count</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-400">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Average</h3>
                  <p className="text-4xl font-bold text-pink-500">{instagramData.metrics.averageFollowers.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">In period</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-400">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Peak</h3>
                  <p className="text-4xl font-bold text-pink-500">{instagramData.metrics.peakFollowers.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Highest count</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Growth</h3>
                  <p className="text-4xl font-bold text-green-600">{instagramData.metrics.currentFollowers.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <svg className={`w-3 h-3 ${instagramData.metrics.changePercentage >= 0 ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={instagramData.metrics.changePercentage >= 0 ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                    </svg>
                    <span className={`text-sm font-medium ${instagramData.metrics.changePercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {instagramData.metrics.changePercentage >= 0 ? '+' : ''}{instagramData.metrics.changePercentage.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">vs period start</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">Followers Over Time</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value as DateRangeType)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0F006A] focus:border-[#0F006A] bg-white"
                    >
                      <option value="60days">Last 60 days</option>
                      <option value="90days">Last 90 days</option>
                    </select>
                  </div>
                </div>
                {instagramData.followersData.length > 0 ? (
                  <div style={{ width: '100%', height: '400px', minHeight: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        key={`${dateRange}-${instagramData.followersData.length}`}
                        data={instagramData.followersData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#9ca3af" />
                        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#9ca3af" domain={['dataMin - 1', 'dataMax + 1']} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} formatter={(value: number | undefined) => value != null ? value.toLocaleString() : '0'} labelStyle={{ fontWeight: 600 }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />
                        <Line type="monotone" dataKey="value" stroke="#E1306C" strokeWidth={3} name="Followers" dot={{ r: 4, fill: '#E1306C' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[400px] flex flex-col items-center justify-center text-gray-500">
                    <p>No followers data for this period</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Posts</h3>
                {instagramData.posts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {instagramData.posts.map((post) => (
                      <a key={post.postId} href={post.url} target="_blank" rel="noopener noreferrer" className="flex rounded-xl bg-gray-50/90 shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="w-28 sm:w-36 flex-shrink-0 bg-gray-200">
                          {post.imageUrl ? (
                            <img src={post.imageUrl} alt="" className="w-full h-full object-cover min-h-[140px]" />
                          ) : (
                            <div className="w-full h-full min-h-[140px] flex items-center justify-center text-gray-400">No image</div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col gap-2 min-w-0 flex-1">
                          <p className="text-xs text-gray-500">
                            {post.publishedAt?.dateTime ? new Date(post.publishedAt.dateTime).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
                          </p>
                          <p className="text-sm text-gray-800 line-clamp-3" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                            {post.content?.replace(/\n/g, ' ').slice(0, 160) || 'No caption'}
                            {(post.content?.length ?? 0) > 160 ? '…' : ''}
                          </p>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-auto">
                            <span>❤️ {post.likes}</span>
                            <span>💬 {post.comments}</span>
                            <span>📊 Reach {post.reach}</span>
                            <span>Eng. {typeof post.engagement === 'number' ? post.engagement.toFixed(1) : post.engagement}%</span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    <p>No posts in this date range</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              <p className="text-gray-600 mb-2 font-semibold">No Instagram data yet</p>
              <p className="text-sm text-gray-500">Select a date range to load data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
