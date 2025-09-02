import Link from 'next/link';
import Image from 'next/image';
import type { Politician } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PartyLogo } from './PartyLogo';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

type PoliticianCardProps = {
  politician: Politician;
};

export default function PoliticianCard({ politician }: PoliticianCardProps) {
  return (
    <Link href={`/politicians/${politician.id}`} className="group block">
      <Card
        className={cn(
          'transition-all duration-300',
          'group-hover:shadow-md group-hover:border-primary/50 group-hover:-translate-y-0.5'
        )}
      >
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0">
              <Image
                src={politician.photoUrl}
                alt={`Photo of ${politician.name}`}
                fill
                className="object-cover rounded-md"
                sizes="(max-width: 768px) 64px, 80px"
                data-ai-hint="politician portrait"
              />
            </div>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1 items-center">
              <div className="md:col-span-1">
                <h3 className="font-headline font-semibold text-lg leading-tight group-hover:text-primary">
                  {politician.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {politician.currentPosition}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground md:col-span-1">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{politician.constituency}</span>
              </div>

              <div className="flex items-center justify-start md:justify-end gap-3 pt-2 md:pt-0 md:col-span-1">
                <PartyLogo party={politician.party} className="w-8 h-8" />
                <Badge variant="secondary" className="truncate hidden sm:inline-flex">
                  {politician.party}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
