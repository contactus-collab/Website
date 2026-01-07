// Type definitions for Supabase database tables

export interface Note {
  id: number
  title: string
  excerpt?: string | null
  content?: string | null
  date?: string | null
  featured?: boolean
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

