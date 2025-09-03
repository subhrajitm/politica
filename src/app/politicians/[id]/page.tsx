
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
  User,
  Cake,
  Globe,
  Languages,
  Users,
  Building,
  Award,
  BookOpen,
  Vote,
  ClipboardList,
  Facebook,
  Twitter,
  Landmark,
} from 'lucide-react';
import { differenceInYears } from 'date-fns';

import { PoliticianService } from '@/lib/politicianService';
import type { Politician } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PartyLogo } from '@/components/PartyLogo';
import AISummary from './AISummary';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import PoliticianTracker from './PoliticianTracker';

function InfoItem({ icon: Icon, label, value, href }: { icon: React.ElementType, label: string, value: React.ReactNode, href?: string }) {
  const content = (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-muted-foreground mt-1" />
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{content}</a>;
  }
  return content;
}

export default async function PoliticianPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const politician = await PoliticianService.getPoliticianById(id);

  if (!politician) {
    notFound();
  }

  const age = differenceInYears(new Date(), new Date(politician.personalDetails.dateOfBirth));

  return (
    <>
    <PoliticianTracker politicianId={politician.id} />
    <div className="container mx-auto px-4 py-4 max-w-6xl">
      <Link
        href="/politicians"
        className="inline-flex items-center gap-2 text-primary mb-3 hover:underline text-xs"
      >
        <ArrowLeft className="w-3 h-3" />
        <span>Back to All Politicians</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <aside className="lg:col-span-1 space-y-4 lg:sticky lg:top-20 self-start">
          <Card className="overflow-hidden">
            <div className="relative w-full aspect-square">
              <Image
                src={politician.photoUrl}
                alt={`Photo of ${politician.name.fullName}`}
                fill
                className="object-cover"
                priority
                data-ai-hint="politician portrait"
              />
            </div>
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <h1 className="text-lg font-bold flex-1">
                  {politician.name.fullName}
                </h1>
                <PartyLogo party={politician.party} className="w-7 h-7" />
              </div>
              <p className="text-muted-foreground text-xs">
                {politician.positions.current.position}
              </p>
               <Badge className="mt-2" variant="outline">
                {politician.party}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-base">Contact</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
               <InfoItem icon={Mail} label="Email" value={politician.contact.email} href={`mailto:${politician.contact.email}`} />
               <InfoItem icon={Phone} label="Phone" value={politician.contact.phone} />
               <InfoItem icon={MapPin} label="Address" value={politician.contact.address} />
               {politician.socialMedia.twitter && <InfoItem icon={Twitter} label="Twitter" value={politician.socialMedia.twitter.split('/').pop()} href={politician.socialMedia.twitter} />}
               {politician.socialMedia.facebook && <InfoItem icon={Facebook} label="Facebook" value="Official Page" href={politician.socialMedia.facebook} />}
            </CardContent>
          </Card>
        </aside>

        <main className="lg:col-span-3 space-y-4">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="career">Career Path</TabsTrigger>
              <TabsTrigger value="policy">Policy & Stances</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="w-5 h-5" />
                            Personal Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <InfoItem icon={User} label="Full Name" value={politician.name.fullName} />
                        <InfoItem icon={Cake} label="Age" value={`${age} (Born ${new Date(politician.personalDetails.dateOfBirth).toLocaleDateString('en-GB')})`} />
                        <InfoItem icon={MapPin} label="Place of Birth" value={politician.personalDetails.placeOfBirth} />
                        <InfoItem icon={Users} label="Gender" value={politician.personalDetails.gender} />
                        <InfoItem icon={Globe} label="Nationality" value={politician.personalDetails.nationality} />
                        <InfoItem icon={Languages} label="Languages" value={politician.personalDetails.languages.join(', ')} />
                        {politician.name.aliases && <InfoItem icon={User} label="Aliases" value={politician.name.aliases.join(', ')} />}
                        {politician.family.spouse && <InfoItem icon={Users} label="Spouse" value={politician.family.spouse} />}
                        {politician.family.children && <InfoItem icon={Users} label="Children" value={politician.family.children.join(', ')} />}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <GraduationCap className="w-5 h-5" />
                            Education
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {politician.education.map((edu, index) => (
                           <InfoItem 
                                key={index} 
                                icon={Building} 
                                label={edu.degree} 
                                value={`${edu.institution}${edu.year ? `, ${edu.year}` : ''}`} 
                            />
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="career" className="space-y-4">
               <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Landmark className="w-5 h-5" />
                            Current Position
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                         <InfoItem icon={Briefcase} label="Position" value={politician.positions.current.position} />
                         <InfoItem icon={MapPin} label="Constituency" value={politician.constituency} />
                         <InfoItem icon={Cake} label="Assumed Office" value={new Date(politician.positions.current.assumedOffice).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                         {politician.positions.current.committees && <InfoItem icon={Users} label="Committees" value={politician.positions.current.committees.join(', ')} />}
                    </CardContent>
                </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Briefcase className="w-5 h-5" />
                    Work History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {politician.positions.history.map((item, index) => (
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
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Vote className="w-5 h-5" />
                    Electoral History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {politician.electoralHistory.map((e, index) => (
                            <div key={index} className="flex justify-between items-center bg-muted/50 p-2 rounded-md">
                                <p className="font-semibold text-sm">{e.election}</p>
                                <Badge variant={e.result.startsWith('Won') ? 'default': 'destructive'}>{e.result}</Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="policy" className="space-y-4">
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <ClipboardList className="w-5 h-5" />
                        Policy Stances
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                         {politician.policyStances.map((policy, index) => (
                            <InfoItem 
                                key={index} 
                                icon={BookOpen} 
                                label={policy.issue} 
                                value={policy.stance} 
                            />
                        ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                    <CardTitle className="text-lg">AI-Powered Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <AISummary politician={politician} />
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
    </>
  );
}
