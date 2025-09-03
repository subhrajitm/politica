import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on our existing data structure
export type Database = {
  public: {
    Tables: {
      politicians: {
        Row: {
          id: string
          full_name: string
          aliases: string[] | null
          date_of_birth: string
          place_of_birth: string
          gender: string
          nationality: string
          languages: string[]
          address: string
          email: string
          phone: string
          website: string | null
          photo_url: string
          spouse: string | null
          children: string[] | null
          party: string
          constituency: string
          current_position: string
          assumed_office: string
          committees: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          aliases?: string[] | null
          date_of_birth: string
          place_of_birth: string
          gender: string
          nationality: string
          languages: string[]
          address: string
          email: string
          phone: string
          website?: string | null
          photo_url: string
          spouse?: string | null
          children?: string[] | null
          party: string
          constituency: string
          current_position: string
          assumed_office: string
          committees?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          aliases?: string[] | null
          date_of_birth?: string
          place_of_birth?: string
          gender?: string
          nationality?: string
          languages?: string[]
          address?: string
          email?: string
          phone?: string
          website?: string | null
          photo_url?: string
          spouse?: string | null
          children?: string[] | null
          party?: string
          constituency?: string
          current_position?: string
          assumed_office?: string
          committees?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      work_history: {
        Row: {
          id: string
          politician_id: string
          position: string
          tenure: string
          contributions: string
          created_at: string
        }
        Insert: {
          id?: string
          politician_id: string
          position: string
          tenure: string
          contributions: string
          created_at?: string
        }
        Update: {
          id?: string
          politician_id?: string
          position?: string
          tenure?: string
          contributions?: string
          created_at?: string
        }
      }
      education: {
        Row: {
          id: string
          politician_id: string
          institution: string
          degree: string
          year: string | null
          created_at: string
        }
        Insert: {
          id?: string
          politician_id: string
          institution: string
          degree: string
          year?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          politician_id?: string
          institution?: string
          degree?: string
          year?: string | null
          created_at?: string
        }
      }
      electoral_history: {
        Row: {
          id: string
          politician_id: string
          election: string
          result: string
          created_at: string
        }
        Insert: {
          id?: string
          politician_id: string
          election: string
          result: string
          created_at?: string
        }
        Update: {
          id?: string
          politician_id?: string
          election?: string
          result?: string
          created_at?: string
        }
      }
      policy_stances: {
        Row: {
          id: string
          politician_id: string
          issue: string
          stance: string
          created_at: string
        }
        Insert: {
          id?: string
          politician_id: string
          issue: string
          stance: string
          created_at?: string
        }
        Update: {
          id?: string
          politician_id?: string
          issue?: string
          stance?: string
          created_at?: string
        }
      }
      voting_records: {
        Row: {
          id: string
          politician_id: string
          bill: string
          vote: 'Yea' | 'Nay' | 'Abstain'
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          politician_id: string
          bill: string
          vote: 'Yea' | 'Nay' | 'Abstain'
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          politician_id?: string
          bill?: string
          vote?: 'Yea' | 'Nay' | 'Abstain'
          date?: string
          created_at?: string
        }
      }
      legislative_achievements: {
        Row: {
          id: string
          politician_id: string
          achievement: string
          year: string
          created_at: string
        }
        Insert: {
          id?: string
          politician_id: string
          achievement: string
          year: string
          created_at?: string
        }
        Update: {
          id?: string
          politician_id?: string
          achievement?: string
          year?: string
          created_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          politician_id: string
          group: string
          rating: string
          created_at: string
        }
        Insert: {
          id?: string
          politician_id: string
          group: string
          rating: string
          created_at?: string
        }
        Update: {
          id?: string
          politician_id?: string
          group?: string
          rating?: string
          created_at?: string
        }
      }
      campaign_finance: {
        Row: {
          id: string
          politician_id: string
          total_receipts: string
          total_disbursements: string
          cash_on_hand: string
          debt: string
          created_at: string
        }
        Insert: {
          id?: string
          politician_id: string
          total_receipts: string
          total_disbursements: string
          cash_on_hand: string
          debt: string
          created_at?: string
        }
        Update: {
          id?: string
          politician_id?: string
          total_receipts?: string
          total_disbursements?: string
          cash_on_hand?: string
          debt?: string
          created_at?: string
        }
      }
      relationships: {
        Row: {
          id: string
          politician_id: string
          name: string
          type: 'Political' | 'Corporate' | 'Personal'
          relationship: string
          created_at: string
        }
        Insert: {
          id?: string
          politician_id: string
          name: string
          type: 'Political' | 'Corporate' | 'Personal'
          relationship: string
          created_at?: string
        }
        Update: {
          id?: string
          politician_id?: string
          name?: string
          type?: 'Political' | 'Corporate' | 'Personal'
          relationship?: string
          created_at?: string
        }
      }
      news_mentions: {
        Row: {
          id: string
          politician_id: string
          source: string
          title: string
          url: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          politician_id: string
          source: string
          title: string
          url: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          politician_id?: string
          source?: string
          title?: string
          url?: string
          date?: string
          created_at?: string
        }
      }
      speeches: {
        Row: {
          id: string
          politician_id: string
          title: string
          url: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          politician_id: string
          title: string
          url: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          politician_id?: string
          title?: string
          url?: string
          date?: string
          created_at?: string
        }
      }
      social_media: {
        Row: {
          id: string
          politician_id: string
          twitter: string | null
          facebook: string | null
          created_at: string
        }
        Insert: {
          id?: string
          politician_id: string
          twitter?: string | null
          facebook?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          politician_id?: string
          twitter?: string | null
          facebook?: string | null
          created_at?: string
        }
      }
    }
  }
}
