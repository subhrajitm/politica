'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Globe, MapPin, Users, Calendar, Building, Crown, Vote } from 'lucide-react';
import { PoliticalPartyService } from '@/lib/politicalPartyService';
import { PoliticalParty } from '@/lib/types';

export default function PartyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const partyId = params.id as string;
  
  const [party, setParty] = useState<PoliticalParty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadParty();
  }, [partyId]);

  const loadParty = async () => {
    try {
      setLoading(true);
      const data = await PoliticalPartyService.getPartyById(partyId);
      if (data) {
        setParty(data);
      } else {
        setError('Political party not found');
      }
    } catch (err) {
      console.error('Error loading party:', err);
      setError('Failed to load political party');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading political party...</div>
        </div>
      </div>
    );
  }

  if (error || !party) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Party Not Found</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getPartyTypeBadges = () => {
    const badges = [];
    if (party.isRulingParty) badges.push({ label: 'Ruling Party', variant: 'default' as const, icon: Crown });
    if (party.isParliamentary) badges.push({ label: 'Parliamentary', variant: 'secondary' as const, icon: Vote });
    if (party.isRegional) badges.push({ label: 'Regional Party', variant: 'outline' as const, icon: MapPin });
    return badges;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
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
                {getPartyTypeBadges().map((badge, index) => (
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
                <CardTitle>Electoral Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {party.electoralPerformance.map((election, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">{election.election}</div>
                        <div className="text-sm text-muted-foreground">{election.year}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant={election.result === 'Won' ? 'default' : 'secondary'}>
                          {election.result}
                        </Badge>
                        {election.percentage && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {election.percentage}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {party.ideology && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{party.ideology}</Badge>
                </div>
              )}
              
              {party.politicalPosition && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Position:</span>
                  <Badge variant="secondary">{party.politicalPosition}</Badge>
                </div>
              )}

              {party.foundedYear && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Founded: {party.foundedYear}</span>
                </div>
              )}

              {party.currentLeader && (
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Leader: {party.currentLeader}</span>
                </div>
              )}

              {party.membershipCount && (
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Members: {party.membershipCount.toLocaleString()}</span>
                </div>
              )}

              {party.headquarters && (
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{party.headquarters}</span>
                </div>
              )}

              {party.regionState && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Region: {party.regionState}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle>Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {party.website && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(party.website, '_blank')}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Official Website
                </Button>
              )}

              {party.socialMedia && (
                <div className="space-y-2">
                  {party.socialMedia.twitter && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => window.open(`https://twitter.com/${party.socialMedia.twitter}`, '_blank')}
                    >
                      <span className="mr-2">🐦</span>
                      Twitter
                    </Button>
                  )}
                  {party.socialMedia.facebook && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => window.open(`https://facebook.com/${party.socialMedia.facebook}`, '_blank')}
                    >
                      <span className="mr-2">📘</span>
                      Facebook
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
