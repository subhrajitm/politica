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
          'transition-all duration-300 h-full',
          'group-hover:shadow-lg group-hover:border-primary/50 group-hover:-translate-y-1'
        )}
      >
        <CardContent className="p-3 flex flex-col h-full">
            <div className="relative w-full aspect-[4/3] mb-3">
              <Image
                src={politician.photoUrl}
                alt={`Photo of ${politician.name}`}
                fill
                className="object-cover rounded-md"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                data-ai-hint="politician portrait"
              />
            </div>
            <div className='flex-grow'>
              <div className='flex justify-between items-start gap-2'>
                <h3 className="font-semibold text-base leading-tight group-hover:text-primary flex-grow">
                  {politician.name}
                </h3>
                <div className="flex-shrink-0">
                  <PartyLogo party={politician.party} className="w-7 h-7" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {politician.constituency}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between pt-3 border-t">
              <Badge variant="secondary" className="font-normal text-xs">{politician.currentPosition}</Badge>
            </div>
        </CardContent>
      </Card>
    </Link>
  );
}
