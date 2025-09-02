import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';

import { politicians } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PartyLogo } from '@/components/PartyLogo';
import AISummary from './AISummary';

export function generateStaticParams() {
  return politicians.map((p) => ({
    id: p.id,
  }));
}

export default function PoliticianPage({ params }: { params: { id: string } }) {
  const politician = politicians.find((p) => p.id === params.id);

  if (!politician) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Link
        href="/politicians"
        className="inline-flex items-center gap-2 text-primary mb-4 hover:underline text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Politicians</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="p-0">
              <div className="relative w-full aspect-square">
                <Image
                  src={politician.photoUrl}
                  alt={`Photo of ${politician.name}`}
                  fill
                  className="object-cover"
                  priority
                  data-ai-hint="politician portrait"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <h1 className="text-xl font-bold">
                  {politician.name}
                </h1>
                <PartyLogo party={politician.party} className="w-8 h-8" />
              </div>
              <p className="text-muted-foreground text-sm">
                {politician.currentPosition}
              </p>
              <Separator className="my-3" />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{politician.constituency}</span>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span>{politician.educationalBackground}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={`mailto:${politician.contact.email}`}
                    className="text-primary hover:underline"
                  >
                    {politician.contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{politician.contact.phone}</span>
                </div>
              </div>
              <Badge className="mt-3 w-full justify-center" variant="outline">
                {politician.party}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Briefcase className="w-5 h-5" />
                Work History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {politician.workHistory.map((item, index) => (
                  <div key={index} className="relative pl-5">
                    <div className="absolute left-0 top-1 h-full border-l-2 border-border"></div>
                    <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-primary"></div>
                    <p className="font-semibold text-sm">{item.position}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.tenure}
                    </p>
                    <p className="mt-1 text-sm">{item.contributions}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">AI-Powered Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <AISummary politician={politician} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
