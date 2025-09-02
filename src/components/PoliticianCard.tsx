import Link from 'next/link';
import Image from 'next/image';
import type { Politician } from '@/lib/data';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PartyLogo } from './PartyLogo';

type PoliticianCardProps = {
  politician: Politician;
};

export default function PoliticianCard({ politician }: PoliticianCardProps) {
  return (
    <Link href={`/politicians/${politician.id}`} className="group">
      <Card className="h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative w-full aspect-[4/3]">
            <Image
              src={politician.photoUrl}
              alt={`Photo of ${politician.name}`}
              fill
              className="object-cover rounded-t-lg"
              data-ai-hint="politician portrait"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="font-headline text-lg mb-2 leading-tight">
              {politician.name}
            </CardTitle>
            <PartyLogo party={politician.party} className="w-7 h-7 shrink-0" />
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {politician.currentPosition}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Badge variant="secondary" className="font-normal">
            {politician.constituency}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
