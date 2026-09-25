export type Profile = {
  id: string
  email: string
  username: string | null
  avatar_url: string | null
  created_at: string
}

export type Document = {
  id: string
  user_id: string
  title: string
  file_type: 'pdf' | 'markdown' | 'txt'
  file_path: string
  page_count: number | null
  created_at: string
  updated_at: string
}

export type Reading = {
  id: string
  document_id: string
  user_id: string
  current_slide: number
  total_slides: number
  percentage_read: number
  last_read_at: string
}

export type Bookmark = {
  id: string
  document_id: string
  user_id: string
  slide_index: number
  created_at: string
}

export type UserSettings = {
  id: string
  user_id: string
  font_size: number
  font_family: 'system' | 'serif' | 'mono' | 'dyslexic'
  line_height: number
  reading_width: 'narrow' | 'normal' | 'wide'
  theme: 'light' | 'dark' | 'sepia' | 'solarized' | 'high-contrast'
  bg_color: string
  text_color: string
  words_per_slide: number
  markdown_split_level: number
  updated_at: string
}

export type Session = any
