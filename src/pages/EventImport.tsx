import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { supabase } from '../lib/supabase'
import TextWithLinks from '../components/TextWithLinks'
import type { User } from '@supabase/supabase-js'
import type { EventType } from '../types/supabase'

type ParsedEvent = {
  title: string
  event_date: string
  start_time?: string
  location?: string
  description?: string
  event_type: EventType
}

const EVENT_COLORS: Record<EventType, string> = { educational: '#7C3AED', game: '#14B8A6', general: '#F59E0B' }

function normalizeHeader(h: string): string {
  return String(h || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Parse Excel "Date / Time" value into date (YYYY-MM-DD) and optional time string */
function parseDateAndTime(val: unknown): { date: string; time?: string } | null {
  if (val === undefined || val === null || val === '') return null
  // Excel serial (number): integer = date, fraction = time of day
  if (typeof val === 'number' && val >= 1) {
    const date = XLSX.SSF.parse_date_code(val)
    if (!date) return null
    const dateStr = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
    const fraction = val - Math.floor(val)
    if (fraction > 0) {
      const totalMinutes = Math.round(fraction * 24 * 60)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const h12 = hours % 12 || 12
      const timeStr = `${h12}:${String(minutes).padStart(2, '0')} ${ampm}`
      return { date: dateStr, time: timeStr }
    }
    return { date: dateStr }
  }
  if (typeof val === 'string') {
    const trimmed = val.trim()
    const iso = trimmed.match(/^\d{4}-\d{2}-\d{2}/)
    if (iso) {
      const timePart = trimmed.slice(iso[0].length).trim()
      const timeMatch = timePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i) || timePart.match(/(\d{1,2}):(\d{2})/)
      const time = timeMatch ? `${timeMatch[1]}:${timeMatch[2]}${timeMatch[3] ? ` ${timeMatch[3].toUpperCase()}` : ''}` : undefined
      return { date: iso[0], time }
    }
    const d = new Date(trimmed)
    if (!isNaN(d.getTime())) {
      const dateStr = d.toISOString().slice(0, 10)
      const hours = d.getHours()
      const minutes = d.getMinutes()
      if (hours !== 0 || minutes !== 0) {
        const ampm = hours >= 12 ? 'PM' : 'AM'
        const h12 = hours % 12 || 12
        const timeStr = `${h12}:${String(minutes).padStart(2, '0')} ${ampm}`
        return { date: dateStr, time: timeStr }
      }
      return { date: dateStr }
    }
  }
  return null
}

export default function EventImport() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [parsed, setParsed] = useState<ParsedEvent[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user)
      else navigate('/login')
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        navigate('/login')
        return
      }
      setUser(session.user)
      const { data, error: e } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
      if (e || !data || data.role !== 'admin') navigate('/login')
    } catch {
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResult(null)
    setError(null)
    const f = e.target.files?.[0]
    if (!f) {
      setFile(null)
      setParsed([])
      return
    }
    if (!/\.(xlsx|xls)$/i.test(f.name)) {
      setError('Please choose an Excel file (.xlsx or .xls).')
      setFile(null)
      setParsed([])
      return
    }
    setFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = ev.target?.result
        if (!data) return
        const wb = XLSX.read(data, { type: 'binary' })
        const first = wb.SheetNames[0]
        const sheet = wb.Sheets[first]
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
        if (rows.length === 0) {
          setParsed([])
          setError('No rows found in the sheet.')
          return
        }
        const firstRow = rows[0] || {}
        const rawKeys = Object.keys(firstRow)
        const normToRaw: Record<string, string> = {}
        rawKeys.forEach(k => { normToRaw[normalizeHeader(k)] = k })
        const pick = (row: Record<string, unknown>, candidates: string[]) => {
          for (const c of candidates) {
            const raw = normToRaw[c]
            if (raw != null) { const v = row[raw]; if (v !== undefined && v !== null && v !== '') return v }
          }
          return null
        }
        // Expected columns: Event Name, Date / Time, Location, Type, Links
        const eventNameKeys = ['event name', 'title', 'name']
        const dateTimeKeys = ['date / time', 'date/time', 'date time', 'date', 'event date', 'event_date']
        const locationKeys = ['location']
        const typeKeys = ['type', 'event type', 'event_type', 'category']
        const linksKeys = ['links', 'notes', 'description', 'desc']
        const parsedEvents: ParsedEvent[] = []
        for (const row of rows) {
          const titleVal = pick(row, eventNameKeys)
          const rawTitle = String(titleVal ?? '').trim()
          const dateTimeVal = pick(row, dateTimeKeys)
          const parsed = parseDateAndTime(dateTimeVal)
          const eventDate = parsed?.date
          if (!rawTitle || !eventDate) continue
          const startTime = parsed?.time
          const locationVal = pick(row, locationKeys)
          const location = locationVal != null ? String(locationVal).trim() || undefined : undefined
          const linksVal = pick(row, linksKeys)
          const description = linksVal != null ? String(linksVal).trim() || undefined : undefined
          let eventType: EventType = 'general'
          const typeVal = pick(row, typeKeys)
          if (typeVal) {
            const t = String(typeVal).toLowerCase()
            if (t.includes('educat')) eventType = 'educational'
            else if (t.includes('game')) eventType = 'game'
            else if (['educational', 'game', 'general'].includes(t)) eventType = t as EventType
          }
          parsedEvents.push({
            title: rawTitle,
            event_date: eventDate,
            start_time: startTime || undefined,
            location: location || undefined,
            description: description || undefined,
            event_type: eventType,
          })
        }
        setParsed(parsedEvents)
        setError(parsedEvents.length === 0 ? 'No valid rows. Expected columns: Event Name, Date / Time, Location, Type, Links' : null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse Excel.')
        setParsed([])
      }
    }
    reader.readAsBinaryString(f)
  }

  const handleImport = async () => {
    if (parsed.length === 0) return
    setImporting(true)
    setResult(null)
    setError(null)
    try {
      const { data: existing } = await supabase.from('events').select('title, event_date')
      const existingSet = new Set((existing || []).map(e => `${e.title}|${e.event_date}`))
      const toInsert = parsed.filter(p => !existingSet.has(`${p.title}|${p.event_date}`))
      let imported = 0
      for (const row of toInsert) {
        const { error: err } = await supabase.from('events').insert({
          title: row.title,
          event_date: row.event_date,
          start_time: row.start_time || null,
          location: row.location || null,
          description: row.description || null,
          event_type: row.event_type,
          color: EVENT_COLORS[row.event_type],
        })
        if (!err) imported++
      }
      setResult({ imported, skipped: parsed.length - toInsert.length })
      setParsed(toInsert.length > 0 ? toInsert : [])
      setFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.')
    } finally {
      setImporting(false)
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
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
            <h1 className="text-3xl font-bold text-[#0F006A] mb-2">Import Events from Excel</h1>
            <p className="text-gray-600">Upload an .xlsx or .xls file. First row must be headers: <strong>Event Name</strong>, <strong>Date / Time</strong>, <strong>Location</strong>, <strong>Type</strong>, <strong>Links</strong>. Duplicates (same event name + date) are skipped.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Choose file</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#ECE6FE] file:text-[#0F006A] file:font-medium hover:file:bg-[#DBD3F5]"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {result && (
              <p className="mt-2 text-sm text-green-700">
                Imported: <strong>{result.imported}</strong>. Skipped (duplicates): <strong>{result.skipped}</strong>.
              </p>
            )}
          </div>

          {parsed.length > 0 && (
            <>
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6 overflow-x-auto">
                <h2 className="text-lg font-semibold text-[#0F006A] mb-4">Preview ({parsed.length} rows)</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#F5F3F9]">
                      <th className="text-left py-3 px-3 font-semibold text-[#0F006A]">Event Name</th>
                      <th className="text-left py-3 px-3 font-semibold text-[#0F006A]">Date</th>
                      <th className="text-left py-3 px-3 font-semibold text-[#0F006A]">Time</th>
                      <th className="text-left py-3 px-3 font-semibold text-[#0F006A]">Location</th>
                      <th className="text-left py-3 px-3 font-semibold text-[#0F006A]">Type</th>
                      <th className="text-left py-3 px-3 font-semibold text-[#0F006A]">Links</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.slice(0, 50).map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3">{row.title}</td>
                        <td className="py-2 px-3">{row.event_date}</td>
                        <td className="py-2 px-3">{row.start_time ?? '—'}</td>
                        <td className="py-2 px-3">{row.location ?? '—'}</td>
                        <td className="py-2 px-3">
                          <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: EVENT_COLORS[row.event_type] }} />
                          {row.event_type}
                        </td>
                        <td className="py-2 px-3 max-w-xs break-words">{row.description ? <TextWithLinks text={row.description} className="text-sm" /> : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsed.length > 50 && <p className="text-gray-500 text-sm mt-2">Showing first 50 of {parsed.length}.</p>}
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing}
                  className="px-6 py-3 bg-[#0F006A] text-white rounded-xl font-medium hover:opacity-95 disabled:opacity-50"
                >
                  {importing ? 'Importing...' : 'Import to calendar'}
                </button>
                <Link to="/admin/events" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-[#F5F3F9]">
                  View calendar
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
