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
        <Link href={`/politicians/${politician.id}`} className="block">
          <Card
            className={cn(
              'transition-all duration-300 overflow-hidden',
              'group-hover:shadow-xl group-hover:-translate-y-1'
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                  <ImageWithPlaceholder
                    src={politician.photoUrl}
                    alt={`Photo of ${politician.name.fullName}`}
                    fill
                    className="rounded-full"
                    sizes="56px"
                    placeholder="user"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-base leading-tight group-hover:text-primary line-clamp-1">
                    {politician.name.fullName}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {politician.positions.current.position}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center bg-primary/10 p-2 rounded-md">
                <span className="text-primary font-semibold text-xs">
                  {politician.party}
                </span>
                <span className="text-xs text-gray-500">
                  {politician.constituency.split(',')[1] || politician.constituency}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    );
  }

  // Grid view (default) - Homepage style
  return (
    <div className="group block">
      <Link href={`/politicians/${politician.id}`} className="block">
        <Card
          className={cn(
            'transition-all duration-300 h-full overflow-hidden',
            'group-hover:shadow-xl group-hover:-translate-y-1'
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                <ImageWithPlaceholder
                  src={politician.photoUrl}
                  alt={`Photo of ${politician.name.fullName}`}
                  fill
                  className="rounded-full"
                  sizes="56px"
                  placeholder="user"
                />
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="font-bold text-base leading-tight group-hover:text-primary line-clamp-2">
                  {politician.name.fullName}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {politician.positions.current.position}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center bg-primary/10 p-2 rounded-md">
              <span className="text-primary font-semibold text-xs">
                {politician.party}
              </span>
              <span className="text-xs text-gray-500">
                {politician.constituency.split(',')[1] || politician.constituency}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
