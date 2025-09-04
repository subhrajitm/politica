/**
 * Mobile-optimized Politician Card Component
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Calendar, ExternalLink, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/OptimizedImage';
import { FavouriteButton } from '@/components/FavouriteButton';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Politician } from '@/lib/types';

interface MobilePoliticianCardProps {
  politician: Politician;
  onTap?: () => void;
  onShare?: () => void;
  compact?: boolean;
}

export function MobilePoliticianCard({ 
  politician, 
  onTap, 
  onShare,
  compact = false 
}: MobilePoliticianCardProps) {
  const isMobile = useIsMobile();
  const [isPressed, setIsPressed] = useState(false);

  const cardRef = useTouchGestures({
    onTap: onTap || (() => {}),
    onLongPress: () => {
      if (onShare) {
        onShare();
      }
    },
  });

  if (!isMobile) {
    return null;
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({
          title: politician.name,
          text: `Check out ${politician.name} on PolitiFind`,
          url: `/politicians/${politician.id}`,
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else if (onShare) {
      onShare();
    }
  };

  return (
    <Card 
      ref={cardRef}
      className={`transition-all duration-150 ${
        isPressed ? 'scale-95 shadow-sm' : 'shadow-md'
      } ${compact ? 'mb-2' : 'mb-4'}`}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
    >
      <CardContent className={`p-0 ${compact ? '' : 'pb-4'}`}>
        <Link href={`/politicians/${politician.id}`} className="block">
          <div className="flex gap-3 p-4">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="relative">
                <OptimizedImage
                  src={politician.photo_url || '/images/placeholder-politician.jpg'}
                  alt={politician.name}
                  width={compact ? 60 : 80}
                  height={compact ? 60 : 80}
                  className="rounded-full object-cover"
                />
                
                {/* Online indicator for active politicians */}
                {politician.is_active && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-gray-900 truncate ${
                    compact ? 'text-sm' : 'text-base'
                  }`}>
                    {politician.name}
                  </h3>
                  
                  <p className={`text-gray-600 truncate ${
                    compact ? 'text-xs' : 'text-sm'
                  }`}>
                    {politician.position}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <FavouriteButton 
                    politicianId={politician.id} 
                    size={compact ? 'sm' : 'default'}
                  />
                  
                  <Button
                    variant="ghost"
                    size={compact ? 'sm' : 'default'}
                    onClick={handleShare}
                    className="h-8 w-8 p-0"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Party and Location */}
              <div className="flex items-center gap-2 mt-2">
                {politician.party && (
                  <Badge 
                    variant="secondary" 
                    className={compact ? 'text-xs px-2 py-0.5' : 'text-xs'}
                  >
                    {politician.party}
                  </Badge>
                )}
                
                {politician.constituency && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span className={compact ? 'text-xs' : 'text-sm'}>
                      {politician.constituency}
                    </span>
                  </div>
                )}
              </div>

              {/* Additional Info for non-compact cards */}
              {!compact && (
                <div className="mt-3 space-y-2">
                  {politician.date_of_birth && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs">
                        Age {new Date().getFullYear() - new Date(politician.date_of_birth).getFullYear()}
                      </span>
                    </div>
                  )}

                  {politician.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {politician.bio}
                    </p>
                  )}

                  {/* Quick Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {politician.experience_years && (
                      <span>{politician.experience_years}y exp</span>
                    )}
                    {politician.education && (
                      <span className="truncate">{politician.education}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Swipe indicator */}
        <div className="px-4 pb-2">
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full w-0 transition-all duration-300 swipe-indicator" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MobilePoliticianGrid({ 
  politicians, 
  onPoliticianTap,
  onPoliticianShare 
}: {
  politicians: Politician[];
  onPoliticianTap?: (politician: Politician) => void;
  onPoliticianShare?: (politician: Politician) => void;
}) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <div className="space-y-3 px-4">
      {politicians.map((politician) => (
        <MobilePoliticianCard
          key={politician.id}
          politician={politician}
          onTap={() => onPoliticianTap?.(politician)}
          onShare={() => onPoliticianShare?.(politician)}
          compact
        />
      ))}
    </div>
  );
}