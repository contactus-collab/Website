import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Create client - will work with placeholder values if env vars not set
// (components will fall back to sample data)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

