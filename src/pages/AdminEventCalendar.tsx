import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { CalendarEvent, EventType } from '../types/supabase'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const EVENT_COLORS: Record<EventType, string> = { educational: '#7C3AED', game: '#14B8A6', general: '#F59E0B' }

function getCalendarGrid(year: number, month: number): { date: Date; isCurrentMonth: boolean }[][] {
  const first = new Date(year, month, 1)
  const startOffset = first.getDay() === 0 ? 6 : first.getDay() - 1
  const startDate = new Date(year, month, 1 - startOffset)
  const weeks: { date: Date; isCurrentMonth: boolean }[][] = []
  for (let w = 0; w < 6; w++) {
    const week: { date: Date; isCurrentMonth: boolean }[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + w * 7 + d)
      week.push({ date, isCurrentMonth: date.getMonth() === month })
    }
    weeks.push(week)
  }
  return weeks
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function AdminEventCalendar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [viewDate, setViewDate] = useState(() => new Date())
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', event_date: '', start_time: '', end_time: '', location: '', event_type: 'general' as EventType })
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) setUser(session.user)
      else navigate('/login')
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { navigate('/login'); return }
      setUser(session.user)
      const { data, error } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
      if (error || !data || data.role !== 'admin') navigate('/login')
      else fetchEvents()
    } catch { navigate('/login') }
    finally { setLoading(false) }
  }

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true })
    if (!error) setEvents((data as CalendarEvent[]) || [])
  }

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    events.forEach(ev => {
      const key = ev.event_date
      if (!map[key]) map[key] = []
      map[key].push(ev)
    })
    return map
  }, [events])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const grid = useMemo(() => getCalendarGrid(year, month), [year, month])
  const goPrev = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const goNext = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const openAdd = (dateKey: string) => {
    setSelectedDateKey(dateKey)
    setForm({
      title: '',
      description: '',
      event_date: dateKey,
      start_time: '',
      end_time: '',
      location: '',
      event_type: 'general',
    })
    setSelectedEvent(null)
    setModal('add')
  }

  const openEdit = (ev: CalendarEvent) => {
    setSelectedEvent(ev)
    setForm({
      title: ev.title,
      description: ev.description || '',
      event_date: ev.event_date,
      start_time: ev.start_time || '',
      end_time: ev.end_time || '',
      location: ev.location || '',
      event_type: (ev.event_type as EventType) || 'general',
    })
    setModal('edit')
  }

  const openDelete = (ev: CalendarEvent) => {
    setSelectedEvent(ev)
    setModal('delete')
  }

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('events').insert({
      title: form.title.trim(),
      description: form.description.trim() || null,
      event_date: form.event_date,
      start_time: form.start_time.trim() || null,
      end_time: form.end_time.trim() || null,
      location: form.location.trim() || null,
      event_type: form.event_type,
      color: EVENT_COLORS[form.event_type],
    })
    setSaving(false)
    if (!error) { await fetchEvents(); setModal(null) }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent) return
    setSaving(true)
    const { error } = await supabase.from('events').update({
      title: form.title.trim(),
      description: form.description.trim() || null,
      event_date: form.event_date,
      start_time: form.start_time.trim() || null,
      end_time: form.end_time.trim() || null,
      location: form.location.trim() || null,
      event_type: form.event_type,
      color: EVENT_COLORS[form.event_type],
      updated_at: new Date().toISOString(),
    }).eq('id', selectedEvent.id)
    setSaving(false)
    if (!error) { await fetchEvents(); setModal(null); setSelectedEvent(null) }
  }

  const handleDelete = async () => {
    if (!selectedEvent) return
    const { error } = await supabase.from('events').delete().eq('id', selectedEvent.id)
    if (!error) { await fetchEvents(); setModal(null); setSelectedEvent(null) }
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

  const navLink = (to: string, label: string, icon: React.ReactNode) => (
    <Link
      to={to}
      className={`block px-4 py-3 rounded-xl transition-colors ${
        location.pathname === to ? 'bg-[#ECE6FE] border-l-4 border-[#0F006A] text-[#0F006A] font-semibold' : 'text-gray-700 hover:bg-[#F5F3F9]'
      }`}
      onClick={() => setSidebarOpen(false)}
    >
      <div className="flex items-center gap-3">{icon}<span className="text-sm font-medium">{label}</span></div>
    </Link>
  )

  return (
    <div className="min-h-screen bg-[#F8F7FC] flex font-sans">
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`w-64 bg-white shadow-lg fixed h-full left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <img src="/images/ballfour-foundation-logo.png" alt="Ball Four" className="h-10 w-auto" />
              <button type="button" onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <h2 className="text-xl font-bold text-[#0F006A]">Admin Panel</h2>
          </div>
          <nav className="space-y-2 mb-8 flex-1">
            {navLink('/admin', 'Dashboard', <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>)}
            {navLink('/admin/add-user', 'Add User', <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>)}
            {navLink('/admin/subscribers', 'Subscribers', <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>)}
            {navLink('/admin/applications', 'Applications', <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>)}
            {navLink('/admin/email-campaign', 'Email Campaign', <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>)}
            <div className="pt-4 border-t border-gray-200">
              <p className="px-4 text-xs text-gray-500 uppercase tracking-wider mb-2">Events</p>
              {navLink('/admin/event-import', 'Event Import', <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>)}
              {navLink('/admin/events', 'Event Calendar', <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>)}
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="px-4 text-xs text-gray-500 uppercase tracking-wider mb-2">Marketing</p>
              {navLink('/admin/marketing/website', 'Website', <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>)}
              {navLink('/admin/marketing/linkedin', 'LinkedIn', <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>)}
              {navLink('/admin/marketing/instagram', 'Instagram', <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>)}
            </div>
          </nav>
          <div className="border-t border-gray-200 pt-6">
            <p className="px-4 text-xs text-gray-500 uppercase mb-2">Account</p>
            <p className="px-4 text-sm text-gray-700 truncate">{user?.email}</p>
            <button type="button" onClick={handleLogout} className="w-full mt-4 flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#F5F3F9] rounded-xl text-left">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64">
        <div className="lg:hidden bg-white shadow-md p-4">
          <button type="button" onClick={() => setSidebarOpen(true)} className="text-gray-700 hover:text-[#0F006A]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#0F006A]">Event Calendar</h1>
              <p className="text-gray-600 mt-1">Add, edit, or delete events. They appear on the public calendar.</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/admin/event-import" className="px-4 py-2 bg-[#ECE6FE] text-[#0F006A] rounded-xl font-medium hover:bg-[#DBD3F5]">
                Import from Excel
              </Link>
              <a href="/event-calendar" target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-[#F5F3F9]">
                View public calendar
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-8">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <button type="button" onClick={goPrev} className="p-2 rounded-lg hover:bg-[#F5F3F9] text-gray-700" aria-label="Previous month">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="min-w-[180px] text-center font-semibold text-[#0F006A]">{MONTHS[month]} {year}</span>
                <button type="button" onClick={goNext} className="p-2 rounded-lg hover:bg-[#F5F3F9] text-gray-700" aria-label="Next month">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 border-b border-gray-200 bg-[#F5F3F9]">
              {DAYS.map(day => (
                <div key={day} className="py-3 text-center font-semibold text-gray-700 text-sm">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {grid.map((week, wi) =>
                week.map(({ date, isCurrentMonth }, di) => {
                  const dateKey = formatDateKey(date)
                  const dayEvents = eventsByDate[dateKey] ?? []
                  return (
                    <div
                      key={`${wi}-${di}`}
                      className="min-h-[100px] sm:min-h-[120px] border-b border-r border-gray-100 p-2 flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm ${isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}`}>{date.getDate()}</span>
                        <button
                          type="button"
                          onClick={() => openAdd(dateKey)}
                          className="text-[#0F006A] hover:bg-[#ECE6FE] rounded p-0.5"
                          title="Add event"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                      <div className="flex flex-col gap-1 flex-grow overflow-auto">
                        {dayEvents.map(ev => (
                          <div
                            key={ev.id}
                            className="rounded-lg overflow-hidden border-l-4 py-1.5 px-2 bg-[#F5F3F9] group"
                            style={{ borderLeftColor: ev.color || EVENT_COLORS[(ev.event_type as EventType) || 'general'] }}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <button type="button" onClick={() => openEdit(ev)} className="text-left flex-1 min-w-0">
                                <span className="font-medium text-gray-800 truncate block text-xs">{ev.title}</span>
                                <span className="text-gray-500 text-xs">{ev.start_time || 'All day'}</span>
                              </button>
                              <button type="button" onClick={() => openDelete(ev)} className="opacity-0 group-hover:opacity-100 text-red-600 hover:bg-red-50 rounded p-0.5 shrink-0" title="Delete">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-[#0F006A] mb-4">{modal === 'add' ? 'Add event' : 'Edit event'}</h2>
            <form onSubmit={modal === 'add' ? handleSaveAdd : handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F006A] focus:border-[#0F006A]" placeholder="Event title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" required value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F006A] focus:border-[#0F006A]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
                  <input type="text" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F006A]" placeholder="e.g. 10:00 AM" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
                  <input type="text" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F006A]" placeholder="e.g. 11:00 AM" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F006A]" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value as EventType }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F006A]">
                  <option value="general">General</option>
                  <option value="educational">Educational</option>
                  <option value="game">Game</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Links</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F006A]" placeholder="URLs or text with embedded links (one or more)" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-[#0F006A] text-white rounded-xl font-medium hover:opacity-95 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-[#F5F3F9]">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {modal === 'delete' && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[#0F006A] mb-2">Delete event?</h2>
            <p className="text-gray-600 text-sm mb-4">“{selectedEvent.title}” will be removed from the calendar.</p>
            <div className="flex gap-3">
              <button type="button" onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700">Delete</button>
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-[#F5F3F9]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
