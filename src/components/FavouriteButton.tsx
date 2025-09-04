'use client'

import { useState } from 'react'
import { useFavourites } from '@/contexts/FavouritesContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Heart, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import AuthModal from './auth/AuthModal'

interface FavouriteButtonProps {
  politicianId: string
  politicianName: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showText?: boolean
}

export default function FavouriteButton({ 
  politicianId, 
  politicianName,
  variant = 'outline',
  size = 'sm',
  className = '',
  showText = true
}: FavouriteButtonProps) {
  const [loading, setLoading] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { user } = useAuth()
  const { isFavourite, addFavourite, removeFavourite } = useFavourites()
  const { toast } = useToast()

  const isFav = isFavourite(politicianId)

  const handleToggleFavourite = async () => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }

    setLoading(true)
    try {
      if (isFav) {
        const result = await removeFavourite(politicianId)
        if (result.success) {
          toast({
            title: 'Removed from favourites',
            description: `${politicianName} has been removed from your favourites.`,
          })
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to remove from favourites.',
            variant: 'destructive',
          })
        }
      } else {
        const result = await addFavourite(politicianId)
        if (result.success) {
          toast({
            title: 'Added to favourites',
            description: `${politicianName} has been added to your favourites.`,
          })
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to add to favourites.',
            variant: 'destructive',
          })
        }
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`${className} ${isFav ? 'text-red-500 hover:text-red-600' : ''}`}
        onClick={handleToggleFavourite}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
        )}
        {showText && (
          <span className="ml-2">
            {isFav ? 'Remove from Favourites' : 'Add to Favourites'}
          </span>
        )}
      </Button>
      
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        defaultMode="login"
      />
    </>
  )
}
