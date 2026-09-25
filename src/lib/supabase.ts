import { createClient } from '@supabase/supabase-js'
export * from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigured = !!(supabaseUrl && supabaseKey)

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')
