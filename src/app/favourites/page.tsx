'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ImageWithPlaceholder from '@/components/ImageWithPlaceholder'
import { useFavourites } from '@/contexts/FavouritesContext'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, User, MapPin, Building, Loader2 } from 'lucide-react'
import { PartyLogo } from '@/components/PartyLogo'
import AuthModal from '@/components/auth/AuthModal'

export default function FavouritesPage() {
  const { user } = useAuth()
  const { favourites, loading } = useFavourites()
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      setAuthModalOpen(true)
    }
  }, [user])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your Favourites</h1>
          <p className="text-muted-foreground mb-6">
            Sign in to save and manage your favourite politicians
          </p>
          <Button onClick={() => setAuthModalOpen(true)}>
            Sign In
          </Button>
        </div>
        <AuthModal 
          open={authModalOpen} 
          onOpenChange={setAuthModalOpen}
          defaultMode="login"
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading your favourites...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Your Favourites</h1>
        <p className="text-muted-foreground">
          {favourites.length === 0 
            ? "You haven't saved any politicians yet. Start exploring and add some to your favourites!"
            : `You have ${favourites.length} favourite politician${favourites.length === 1 ? '' : 's'}.`
          }
        </p>
      </div>

      {favourites.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No favourites yet</h2>
            <p className="text-muted-foreground mb-6">
              Start exploring politicians and add them to your favourites to see them here.
            </p>
            <Button asChild>
              <Link href="/politicians">
                Browse Politicians
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.map((favourite) => (
            <Card key={favourite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative w-full aspect-square">
                <ImageWithPlaceholder
                  src={favourite.politician.photo_url}
                  alt={`Photo of ${favourite.politician.full_name}`}
                  fill
                  placeholder="user"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg flex-1">
                    {favourite.politician.full_name}
                  </h3>
                  <PartyLogo party={favourite.politician.party} className="w-6 h-6" />
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="w-4 h-4" />
                    <span>{favourite.politician.current_position}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{favourite.politician.constituency}</span>
                  </div>
                </div>

                <Badge variant="outline" className="mb-4">
                  {favourite.politician.party}
                </Badge>

                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/politicians/${favourite.politician.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
