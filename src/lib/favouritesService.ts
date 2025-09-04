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
        console.error('Table access error:', {
          message: (tableError as any)?.message,
          code: (tableError as any)?.code,
          details: (tableError as any)?.details,
          hint: (tableError as any)?.hint,
        })
        // If table doesn't exist or has permission issues, return empty array
        if (tableError.code === 'PGRST116' || tableError.message.includes('relation') || tableError.message.includes('does not exist')) {
          console.warn('user_favourites table does not exist or is not accessible. Please run the database migration.')
          return { data: [], error: null }
        }
        return { data: null, error: tableError }
      }

      // Step 1: Fetch favourites rows only
      const { data: favRows, error: favError } = await supabase
        .from('user_favourites')
        .select('id, user_id, politician_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (favError) {
        console.error('Supabase favourites fetch error:', {
          message: (favError as any)?.message,
          code: (favError as any)?.code,
          details: (favError as any)?.details,
          hint: (favError as any)?.hint,
        })
        return { data: null, error: favError }
      }

      const favourites = favRows || []
      if (favourites.length === 0) {
        return { data: [] as FavouriteWithPolitician[], error: null }
      }

      // Step 2: Fetch politicians in a single query
      const politicianIds = Array.from(new Set(favourites.map(f => f.politician_id)))
      const { data: politicians, error: polError } = await supabase
        .from('politicians')
        .select('id, full_name, party, constituency, current_position, photo_url')
        .in('id', politicianIds)

      if (polError) {
        console.error('Supabase politicians fetch error:', {
          message: (polError as any)?.message,
          code: (polError as any)?.code,
          details: (polError as any)?.details,
          hint: (polError as any)?.hint,
        })
        // Even if this fails, return the bare favourites list
        return { data: [] as FavouriteWithPolitician[], error: polError }
      }

      const idToPolitician = new Map<string, any>((politicians || []).map(p => [p.id, p]))
      const enriched: FavouriteWithPolitician[] = favourites
        .map(f => {
          const p = idToPolitician.get(f.politician_id)
          if (!p) return null
          return {
            ...f,
            politician: p,
          } as FavouriteWithPolitician
        })
        .filter(Boolean) as FavouriteWithPolitician[]

      return { data: enriched, error: null }
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
