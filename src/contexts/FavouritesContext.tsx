'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { FavouritesService, type FavouriteWithPolitician } from '@/lib/favouritesService'
import { useAuth } from './AuthContext'

interface FavouritesContextType {
  favourites: FavouriteWithPolitician[]
  loading: boolean
  addFavourite: (politicianId: string) => Promise<{ success: boolean; error?: string }>
  removeFavourite: (politicianId: string) => Promise<{ success: boolean; error?: string }>
  isFavourite: (politicianId: string) => boolean
  refreshFavourites: () => Promise<void>
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined)

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const [favourites, setFavourites] = useState<FavouriteWithPolitician[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const loadFavourites = async () => {
    if (!user) {
      setFavourites([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await FavouritesService.getUserFavourites(user.id)
      if (error) {
        console.error('Error loading favourites:', error)
        // Don't throw the error, just log it and set empty array
        setFavourites([])
      } else {
        setFavourites(data || [])
      }
    } catch (err) {
      console.error('Error loading favourites:', err)
      // Don't throw the error, just log it and set empty array
      setFavourites([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFavourites()
  }, [user])

  const addFavourite = async (politicianId: string) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    try {
      const { error } = await FavouritesService.addFavourite(user.id, politicianId)
      if (error) {
        return { success: false, error: error.message }
      }
      
      // Refresh favourites list
      await loadFavourites()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to add favourite' }
    }
  }

  const removeFavourite = async (politicianId: string) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    try {
      const { error } = await FavouritesService.removeFavourite(user.id, politicianId)
      if (error) {
        return { success: false, error: error.message }
      }
      
      // Refresh favourites list
      await loadFavourites()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to remove favourite' }
    }
  }

  const isFavourite = (politicianId: string) => {
    return favourites.some(fav => fav.politician_id === politicianId)
  }

  const refreshFavourites = async () => {
    await loadFavourites()
  }

  const value = {
    favourites,
    loading,
    addFavourite,
    removeFavourite,
    isFavourite,
    refreshFavourites,
  }

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>
}

export function useFavourites() {
  const context = useContext(FavouritesContext)
  if (context === undefined) {
    throw new Error('useFavourites must be used within a FavouritesProvider')
  }
  return context
}
