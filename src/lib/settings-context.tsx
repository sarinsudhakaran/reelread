import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './auth-context'
import { supabase, isConfigured } from './supabase'
import type { UserSettings } from './types'

type SettingsContextType = {
  settings: UserSettings | null
  loading: boolean
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const DEFAULT_SETTINGS: Omit<UserSettings, 'id' | 'user_id' | 'updated_at'> = {
  font_size: 18,
  font_family: 'system',
  line_height: 1.5,
  reading_width: 'normal',
  theme: 'dark',
  bg_color: '#0E0E10',
  text_color: '#F2F2F0',
  words_per_slide: 100,
  markdown_split_level: 1,
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConfigured || !session?.user.id) {
      setLoading(false)
      return
    }

    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        if (data) {
          setSettings(data)
        } else {
          const newSettings = {
            ...DEFAULT_SETTINGS,
            user_id: session.user.id,
            id: crypto.randomUUID(),
            updated_at: new Date().toISOString(),
          }
          const { data: created } = await supabase
            .from('user_settings')
            .insert([newSettings])
            .select()
            .single()

          if (created) setSettings(created)
        }
      } catch {
        // Handle errors gracefully
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [session?.user.id])

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!session?.user.id || !settings) return

    const updated = {
      ...settings,
      ...updates,
      updated_at: new Date().toISOString(),
    }

    setSettings(updated)

    await supabase
      .from('user_settings')
      .update(updated)
      .eq('user_id', session.user.id)
  }

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
