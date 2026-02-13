import { useState, useMemo } from 'react'
import Newsletter from '../components/Newsletter'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

type EventItem = { title: string; time: string; color: string }

// Sample events by date string YYYY-MM-DD (for demo – replace with real data source later)
const SAMPLE_EVENTS: Record<string, EventItem[]> = {
  '2025-01-01': [
    { title: 'Design Workshop', time: '10:00 AM', color: '#F59E0B' },
    { title: 'Design Workshop', time: '10:00 AM', color: '#7C3AED' },
  ],
  '2025-01-05': [{ title: 'Design Workshop', time: '10:00 AM', color: '#7C3AED' }],
  '2025-01-09': [{ title: 'Design Workshop', time: '10:00 AM', color: '#7C3AED' }],
  '2025-01-10': [{ title: 'Design Workshop', time: '10:00 AM', color: '#7C3AED' }],
  '2025-01-14': [{ title: 'Design Workshop', time: '10:00 AM', color: '#7C3AED' }],
  '2025-01-18': [
    { title: 'Design Workshop', time: '10:00 AM', color: '#7C3AED' },
    { title: 'Design Workshop', time: '10:00 AM', color: '#14B8A6' },
  ],
  '2025-01-19': [{ title: 'Design Workshop', time: '10:00 AM', color: '#F59E0B' }],
  '2025-01-22': [{ title: 'Design Workshop', time: '10:00 AM', color: '#7C3AED' }],
  '2025-01-23': [
    { title: 'Design Workshop', time: '10:00 AM', color: '#14B8A6' },
    { title: 'Design Workshop', time: '10:00 AM', color: '#F59E0B' },
  ],
  '2025-01-31': [{ title: 'Design Workshop', time: '10:00 AM', color: '#14B8A6' }],
}

function getCalendarGrid(year: number, month: number): { date: Date; isCurrentMonth: boolean }[][] {
  const first = new Date(year, month, 1)
  const startOffset = first.getDay() === 0 ? 6 : first.getDay() - 1 // Monday = 0
  const startDate = new Date(year, month, 1 - startOffset)
  const weeks: { date: Date; isCurrentMonth: boolean }[][] = []
  for (let w = 0; w < 6; w++) {
    const week: { date: Date; isCurrentMonth: boolean }[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + w * 7 + d)
      week.push({
        date,
        isCurrentMonth: date.getMonth() === month,
      })
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

export default function EventCalendar() {
  const [viewDate, setViewDate] = useState(() => new Date()) // Today's month by default
  const [eventFilter, setEventFilter] = useState<'all' | 'educational' | 'game' | 'general'>('all')
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  type EventType = 'educational' | 'game' | 'general'
  const UPCOMING_EVENTS: { title: string; date: string; time: string; description: string; type: EventType }[] = [
    { title: 'Educational event', date: '22 May', time: '10:00 AM', description: 'Initial consultation with new client about their requirements', type: 'educational' },
    { title: 'Game Events', date: '22 May', time: '10:00 AM', description: 'Initial consultation with new client about their requirements', type: 'game' },
    { title: 'General Event', date: '22 May', time: '10:00 AM', description: 'Initial consultation with new client about their requirements', type: 'general' },
    { title: 'Game Event', date: '22 May', time: '10:00 AM', description: 'Initial consultation with new client about their requirements', type: 'game' },
    { title: 'Educational event', date: '22 May', time: '10:00 AM', description: 'Initial consultation with new client about their requirements', type: 'educational' },
    { title: 'General Event', date: '22 May', time: '10:00 AM', description: 'Initial consultation with new client about their requirements', type: 'general' },
  ]
  const EVENT_COLORS: Record<EventType, string> = { educational: '#7C3AED', game: '#14B8A6', general: '#F59E0B' }
  const filteredEvents = eventFilter === 'all' ? UPCOMING_EVENTS : UPCOMING_EVENTS.filter((e) => e.type === eventFilter)

  const grid = useMemo(() => getCalendarGrid(year, month), [year, month])

  const goPrev = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const goNext = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-12 px-4 sm:py-16">
        <div className="max-w-7xl mx-auto rounded-[32px] sm:rounded-[40px] overflow-hidden relative min-h-[320px] sm:min-h-[380px] flex items-center justify-center">
          <img
            src="/images/events-hero.jpeg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-105 blur-sm"
            onError={(e) => {
              const target = e.currentTarget
              if (!target.src.endsWith('resources.png')) target.src = '/images/resources.png'
            }}
            aria-hidden
          />
          <div className="relative z-10 text-center px-6 sm:px-10 py-12 max-w-3xl mx-auto">
            <h1
              className="mb-6 text-center"
              style={{
                color: '#FFF',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '62px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '78px',
                letterSpacing: '-0.62px',
              }}
            >
              Nationwide ND
              <br />
              Events &amp; Gatherings
            </h1>
            <p
              className="text-center"
              style={{
                color: '#FFF',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '18px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '155%',
              }}
            >
              Find workshops, conferences, and community programs happening nationwide. Stay informed about opportunities to learn, connect, and advocate for children with Neurodevelopmental Disorders.
            </p>
          </div>
        </div>
      </section>

      {/* Intro section */}
      <section className="py-12 px-4 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <span
            className="inline-flex h-[32px] items-center justify-center rounded-[50px] px-4 text-sm font-bold mb-4"
            style={{ backgroundColor: '#ECE6FE', color: '#4E288E' }}
          >
            Event Calendar
          </span>
          <h2
            className="mb-4 text-left"
            style={{
              color: '#000',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '44px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '65px',
              letterSpacing: '-0.44px',
            }}
          >
            Your Guide to ND Events Nationwide
          </h2>
          <p
            className="max-w-3xl text-left"
            style={{
              color: 'var(--sds-color-text-default-default)',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '18px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '155%',
            }}
          >
            Ball Four Foundation curates a nationwide calendar of events focused on neurodevelopmental disorders. From coast to coast, families, educators, and professionals gather to share knowledge, build community, and advance understanding of ND. Whether you're looking for local workshops or national conferences, our calendar helps you discover events that matter.
          </p>
        </div>
      </section>

      {/* Calendar */}
      <section className="py-12 px-4 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2
              className="text-left"
              style={{
                color: '#000',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '28px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
              }}
            >
              Event Calendar
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                aria-label="Previous month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div
                className="min-w-[160px] flex h-10 items-center justify-center rounded-lg bg-gray-100 px-4 text-center font-medium text-gray-800"
                style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '15px' }}
              >
                {MONTHS[month]} {year}
              </div>
              <button
                type="button"
                onClick={goNext}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                aria-label="Next month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center font-semibold text-gray-700"
                  style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '14px' }}
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {grid.map((week, wi) =>
                week.map(({ date, isCurrentMonth }, di) => {
                  const key = `${wi}-${di}`
                  const dateKey = formatDateKey(date)
                  const events = SAMPLE_EVENTS[dateKey] ?? []
                  return (
                    <div
                      key={key}
                      className="min-h-[100px] sm:min-h-[120px] border-b border-r border-gray-100 p-2 flex flex-col"
                    >
                      <span
                        className="text-sm font-normal mb-1"
                        style={{
                          fontFamily: '"Plus Jakarta Sans", sans-serif',
                          color: isCurrentMonth ? '#6B7280' : '#9CA3AF',
                        }}
                      >
                        {date.getDate()}
                      </span>
                      <div className="flex flex-col gap-1.5 flex-grow overflow-auto">
                        {events.map((ev, i) => (
                          <div
                            key={`${dateKey}-${i}`}
                            className="rounded-lg overflow-hidden bg-gray-50 border-l-4 flex flex-col py-1.5 px-2"
                            style={{ borderLeftColor: ev.color }}
                          >
                            <span
                              className="font-normal text-gray-800 truncate"
                              style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '13px' }}
                            >
                              {ev.title}
                            </span>
                            <span
                              className="text-gray-500 text-xs"
                              style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                            >
                              {ev.time}
                            </span>
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
      </section>

      {/* Upcoming Events */}
      <section className="py-12 px-4 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h2
              className="text-left"
              style={{
                color: '#1F2937',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '32px',
                fontStyle: 'normal',
                fontWeight: 700,
                lineHeight: 'normal',
              }}
            >
              Upcoming Events
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setEventFilter('all')}
                className="inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: eventFilter === 'all' ? '#0F006A' : '#F3F4F6',
                  color: eventFilter === 'all' ? '#FFF' : '#374151',
                }}
              >
                All Events
              </button>
              <button
                type="button"
onClick={() => setEventFilter('educational')}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              <span className="h-2 w-2 rounded-full bg-[#7C3AED]" />
              Educational Events
              </button>
              <button
                type="button"
                onClick={() => setEventFilter('game')}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                <span className="h-2 w-2 rounded-full bg-[#14B8A6]" />
                Game Events
              </button>
              <button
                type="button"
                onClick={() => setEventFilter('general')}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                General Events
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((event, i) => (
              <div
                key={i}
                className="flex rounded-xl bg-gray-50/90 shadow-sm border border-gray-100 overflow-hidden"
              >
                <div
                  className="w-1.5 sm:w-2 flex-shrink-0 rounded-l-xl"
                  style={{ backgroundColor: EVENT_COLORS[event.type] }}
                />
                <div className="p-5 flex flex-col gap-2 min-w-0">
                  <h3
                    className="font-bold text-gray-800"
                    style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '18px' }}
                  >
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {event.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {event.time}
                    </span>
                  </div>
                  <p
                    className="text-gray-500 text-sm leading-snug"
                    style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                  >
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  )
}
