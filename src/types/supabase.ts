// Type definitions for Supabase database tables

export interface Note {
  id: number
  title: string
  excerpt?: string | null
  content?: string | null
  date?: string | null
  featured?: boolean
  image_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface Newsletter {
  id: number
  email: string
  first_name?: string | null
  last_name?: string | null
  unsubscribed?: boolean
  created_at?: string
}

export type EventType = 'educational' | 'game' | 'general'

export interface CalendarEvent {
  id: string
  title: string
  description?: string | null
  event_date: string // YYYY-MM-DD
  start_time?: string | null // e.g. "10:00 AM"
  end_time?: string | null
  location?: string | null
  event_type: EventType
  color?: string | null // hex
  created_at?: string
  updated_at?: string
}

