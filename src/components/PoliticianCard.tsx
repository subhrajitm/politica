'use client'

import Link from 'next/link';
import type { Politician } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PartyLogo } from './PartyLogo';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import ImageWithPlaceholder from './ImageWithPlaceholder';
import FavouriteButton from './FavouriteButton';

type PoliticianCardProps = {
  politician: Politician;
  viewMode?: 'grid' | 'list';
};

export default function PoliticianCard({ politician, viewMode = 'grid' }: PoliticianCardProps) {
  if (viewMode === 'list') {
    return (
      <div className="group block">
        <Card
          className={cn(
            'transition-all duration-300',
            'group-hover:shadow-md group-hover:border-primary/50 group-hover:-translate-y-0.5'
          )}
        >
          <CardContent className="p-2">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <ImageWithPlaceholder
                  src={politician.photoUrl}
                  alt={`Photo of ${politician.name.fullName}`}
                  fill
                  className="rounded-sm"
                  sizes="48px"
                  placeholder="user"
                />
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/politicians/${politician.id}`} className="flex-grow min-w-0">
                    <h3 className="font-medium text-sm leading-tight group-hover:text-primary line-clamp-1">
                      {politician.name.fullName}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <PartyLogo party={politician.party} className="w-4 h-4" />
                    <FavouriteButton 
                      politicianId={politician.id}
                      politicianName={politician.name.fullName}
                      variant="ghost"
                      size="sm"
                      showText={false}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                    />
                  </div>
                </div>
                
                <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{politician.constituency}</span>
                  </div>
                  <Badge variant="secondary" className="font-normal text-[10px] px-1.5 py-0.5">
                    {politician.positions.current.position}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Grid view (default) - Compact version
  return (
    <div className="group block">
      <Card
        className={cn(
          'transition-all duration-300 h-full',
          'group-hover:shadow-md group-hover:border-primary/50 group-hover:-translate-y-0.5'
        )}
      >
        <CardContent className="p-1.5 flex flex-col h-full">
            <div className="relative w-full aspect-square mb-1.5">
              <ImageWithPlaceholder
                src={politician.photoUrl}
                alt={`Photo of ${politician.name.fullName}`}
                fill
                className="rounded-sm"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                placeholder="user"
              />
            </div>
            <div className='flex-grow'>
              <div className='flex justify-between items-start gap-1'>
                <Link href={`/politicians/${politician.id}`} className="flex-grow">
                  <h3 className="font-medium text-xs leading-tight group-hover:text-primary line-clamp-2">
                    {politician.name.fullName}
                  </h3>
                </Link>
                <div className="flex-shrink-0">
                  <PartyLogo party={politician.party} className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5 line-clamp-1">
                <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate">{politician.constituency}</span>
              </p>
            </div>
            <div className="mt-1.5 flex items-center justify-between pt-1 border-t">
              <Badge variant="secondary" className="font-normal text-[10px] px-1 py-0.5 line-clamp-1">
                {politician.positions.current.position}
              </Badge>
              <FavouriteButton 
                politicianId={politician.id}
                politicianName={politician.name.fullName}
                variant="ghost"
                size="sm"
                showText={false}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5"
              />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
