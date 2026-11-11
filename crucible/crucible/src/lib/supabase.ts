import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

export type Profile = {
  id: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  role: 'admin' | 'member'
  created_at: string
}

export type Channel = {
  id: string
  name: string
  slug: string
  description: string | null
  is_announcements: boolean
  created_at: string
}

export type Message = {
  id: string
  channel_id: string
  user_id: string
  content: string
  parent_id: string | null
  is_pinned: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
  attachments?: Attachment[]
  replies_count?: number
}

export type Attachment = {
  id: string
  message_id: string
  url: string
  type: 'image' | 'audio'
  filename: string
  size: number
}

export type InviteCode = {
  code: string
  created_by: string
  used_by: string | null
  expires_at: string | null
  created_at: string
}
