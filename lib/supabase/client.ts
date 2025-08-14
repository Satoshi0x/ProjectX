import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          website_url: string | null
          bitcoin_address: string | null
          anonymous_id: string
          join_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website_url?: string | null
          bitcoin_address?: string | null
          anonymous_id: string
          join_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website_url?: string | null
          bitcoin_address?: string | null
          anonymous_id?: string
          join_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          domain: string
          user_id: string | null
          username: string
          content: string
          message_type: string
          tip_amount: number | null
          created_at: string
        }
        Insert: {
          id?: string
          domain: string
          user_id?: string | null
          username: string
          content: string
          message_type?: string
          tip_amount?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          domain?: string
          user_id?: string | null
          username?: string
          content?: string
          message_type?: string
          tip_amount?: number | null
          created_at?: string
        }
      }
      user_analytics: {
        Row: {
          id: string
          anonymous_id: string
          domain: string
          action_type: string
          action_data: any
          created_at: string
        }
        Insert: {
          id?: string
          anonymous_id: string
          domain: string
          action_type: string
          action_data?: any
          created_at?: string
        }
        Update: {
          id?: string
          anonymous_id?: string
          domain?: string
          action_type?: string
          action_data?: any
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
