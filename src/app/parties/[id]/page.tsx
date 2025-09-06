import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Globe, MapPin, Users, Calendar, Building, Crown, Vote } from 'lucide-react';
import { PoliticalPartyService } from '@/lib/politicalPartyService';
import { PoliticalParty } from '@/lib/types';
import Link from 'next/link';

interface PartyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PartyDetailPage({ params }: PartyDetailPageProps) {
  const { id: partyId } = await params;
  
  let party: PoliticalParty | null = null;

  try {
    party = await PoliticalPartyService.getPartyById(partyId);
    if (!party) {
      notFound();
    }
  } catch (err) {
    console.error('Error loading party:', err);
    notFound();
  }

  const getPartyTypeBadges = (party: PoliticalParty) => {
    const badges = [];
    if (party.isRulingParty) badges.push({ label: 'Ruling Party', variant: 'default' as const, icon: Crown });
    if (party.isParliamentary) badges.push({ label: 'Parliamentary', variant: 'secondary' as const, icon: Building });
    if (party.isRegional) badges.push({ label: 'Regional', variant: 'outline' as const, icon: MapPin });
    return badges;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" asChild>
          <Link href="/parties">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            {party.logoUrl && (
              <img
                src={party.logoUrl}
                alt={`${party.name} logo`}
                className="w-16 h-16 rounded-full object-cover border-2 border-muted"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{party.name}</h1>
              {party.nameLocal && (
                <p className="text-lg text-muted-foreground">{party.nameLocal}</p>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{party.countryName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Party Type Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Party Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {getPartyTypeBadges(party).map((badge, index) => (
                  <Badge key={index} variant={badge.variant} className="flex items-center space-x-1">
                    <badge.icon className="w-3 h-3" />
                    <span>{badge.label}</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {party.description && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {party.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Electoral Performance */}
          {party.electoralPerformance && party.electoralPerformance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Vote className="w-5 h-5" />
                  <span>Electoral Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {party.electoralPerformance.map((election, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{election.election}</h4>
                        <span className="text-sm text-muted-foreground">{election.year}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Votes:</span>
                          <p className="font-medium">{election.votes || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Percentage:</span>
                          <p className="font-medium">{election.percentage || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Seats:</span>
                          <p className="font-medium">{election.seats || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Result:</span>
                          <p className="font-medium">{election.result || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {party.ideology && (
                <div className="flex items-start space-x-3">
                  <Building className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Ideology</p>
                    <p className="text-sm text-muted-foreground">{party.ideology}</p>
                  </div>
                </div>
              )}
              
              {party.politicalPosition && (
                <div className="flex items-start space-x-3">
                  <Users className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Political Position</p>
                    <p className="text-sm text-muted-foreground">{party.politicalPosition}</p>
                  </div>
                </div>
              )}
              
              {party.foundedYear && (
                <div className="flex items-start space-x-3">
                  <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Founded</p>
                    <p className="text-sm text-muted-foreground">{party.foundedYear}</p>
                  </div>
                </div>
              )}
              
              {party.currentLeader && (
                <div className="flex items-start space-x-3">
                  <Crown className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Current Leader</p>
                    <p className="text-sm text-muted-foreground">{party.currentLeader}</p>
                  </div>
                </div>
              )}
              
              {party.membershipCount && (
                <div className="flex items-start space-x-3">
                  <Users className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Membership</p>
                    <p className="text-sm text-muted-foreground">{party.membershipCount.toLocaleString()} members</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{party.countryName}</p>
                  {party.regionState && (
                    <p className="text-sm text-muted-foreground">{party.regionState}</p>
                  )}
                  {party.headquarters && (
                    <p className="text-sm text-muted-foreground mt-1">{party.headquarters}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media & Website */}
          <Card>
            <CardHeader>
              <CardTitle>Online Presence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {party.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={party.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Official Website
                  </a>
                </div>
              )}
              
              {party.socialMedia && (
                <>
                  {party.socialMedia.twitter && (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">𝕏</span>
                      </div>
                      <a
                        href={`https://twitter.com/${party.socialMedia.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        @{party.socialMedia.twitter}
                      </a>
                    </div>
                  )}
                  
                  {party.socialMedia.facebook && (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">f</span>
                      </div>
                      <a
                        href={`https://facebook.com/${party.socialMedia.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {party.socialMedia.facebook}
                      </a>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}