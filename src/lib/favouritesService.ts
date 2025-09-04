import { supabase } from './supabase'
import type { Database } from './supabase'

type UserFavourite = Database['public']['Tables']['user_favourites']['Row']
type UserFavouriteInsert = Database['public']['Tables']['user_favourites']['Insert']

export interface FavouriteWithPolitician extends UserFavourite {
  politician: {
    id: string
    full_name: string
    party: string
    constituency: string
    current_position: string
    photo_url: string
  }
}

export class FavouritesService {
  static async addFavourite(userId: string, politicianId: string) {
    try {
      const { data, error } = await supabase
        .from('user_favourites')
        .insert({
          user_id: userId,
          politician_id: politicianId,
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding favourite:', error)
      }

      return { data, error }
    } catch (err) {
      console.error('Unexpected error in addFavourite:', err)
      return { data: null, error: err }
    }
  }

  static async removeFavourite(userId: string, politicianId: string) {
    try {
      const { error } = await supabase
        .from('user_favourites')
        .delete()
        .eq('user_id', userId)
        .eq('politician_id', politicianId)

      if (error) {
        console.error('Error removing favourite:', error)
      }

      return { error }
    } catch (err) {
      console.error('Unexpected error in removeFavourite:', err)
      return { error: err }
    }
  }

  static async getUserFavourites(userId: string) {
    try {
      // First, try to check if the table exists by doing a simple count
      const { error: tableError } = await supabase
        .from('user_favourites')
        .select('id', { count: 'exact', head: true })

      if (tableError) {
        console.error('Table access error:', tableError)
        // If table doesn't exist or has permission issues, return empty array
        if (tableError.code === 'PGRST116' || tableError.message.includes('relation') || tableError.message.includes('does not exist')) {
          console.warn('user_favourites table does not exist or is not accessible. Please run the database migration.')
          return { data: [], error: null }
        }
        return { data: null, error: tableError }
      }

      const { data, error } = await supabase
        .from('user_favourites')
        .select(`
          *,
          politician:politicians(
            id,
            full_name,
            party,
            constituency,
            current_position,
            photo_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        return { data: null, error }
      }

      return { data: data as FavouriteWithPolitician[] | null, error }
    } catch (err) {
      console.error('Unexpected error in getUserFavourites:', err)
      return { data: null, error: err }
    }
  }

  static async isFavourite(userId: string, politicianId: string) {
    try {
      const { data, error } = await supabase
        .from('user_favourites')
        .select('id')
        .eq('user_id', userId)
        .eq('politician_id', politicianId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking favourite status:', error)
        return { isFavourite: false, error }
      }

      return { isFavourite: !!data, error: null }
    } catch (err) {
      console.error('Unexpected error in isFavourite:', err)
      return { isFavourite: false, error: err }
    }
  }

  static async getFavouriteCount(politicianId: string) {
    const { count, error } = await supabase
      .from('user_favourites')
      .select('*', { count: 'exact', head: true })
      .eq('politician_id', politicianId)

    return { count: count || 0, error }
  }
}
