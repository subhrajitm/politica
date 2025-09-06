'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Users, Crown, Vote, Building } from 'lucide-react';
import { PoliticalPartyService } from '@/lib/politicalPartyService';
import { PoliticalParty } from '@/lib/types';

export default function PartiesPage() {
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [filteredParties, setFilteredParties] = useState<PoliticalParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    loadParties();
  }, []);

  useEffect(() => {
    filterParties();
  }, [parties, searchQuery, countryFilter, typeFilter]);

  const loadParties = async () => {
    try {
      setLoading(true);
      const data = await PoliticalPartyService.getAllParties();
      setParties(data);
      
      // Extract unique countries
      const uniqueCountries = [...new Set(data.map(party => party.countryName))].sort();
      setCountries(uniqueCountries);
    } catch (error) {
      console.error('Error loading parties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterParties = () => {
    let filtered = parties;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(party =>
        party.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        party.nameLocal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        party.ideology?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        party.countryName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Country filter
    if (countryFilter !== 'all') {
      filtered = filtered.filter(party => party.countryName === countryFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      switch (typeFilter) {
        case 'ruling':
          filtered = filtered.filter(party => party.isRulingParty);
          break;
        case 'parliamentary':
          filtered = filtered.filter(party => party.isParliamentary);
          break;
        case 'regional':
          filtered = filtered.filter(party => party.isRegional);
          break;
      }
    }

    setFilteredParties(filtered);
  };

  const getPartyTypeBadges = (party: PoliticalParty) => {
    const badges = [];
    if (party.isRulingParty) badges.push({ label: 'Ruling', variant: 'default' as const });
    if (party.isParliamentary) badges.push({ label: 'Parliamentary', variant: 'secondary' as const });
    if (party.isRegional) badges.push({ label: 'Regional', variant: 'outline' as const });
    return badges;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading political parties...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Political Parties</h1>
        <p className="text-muted-foreground text-lg">
          Explore political parties from around the world
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search parties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ruling">Ruling Parties</SelectItem>
                <SelectItem value="parliamentary">Parliamentary Parties</SelectItem>
                <SelectItem value="regional">Regional Parties</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground flex items-center">
              {filteredParties.length} of {parties.length} parties
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParties.map((party) => (
          <Link key={party.id} href={`/parties/${party.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  {party.logoUrl && (
                    <img
                      src={party.logoUrl}
                      alt={`${party.name} logo`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-muted"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{party.name}</CardTitle>
                    {party.nameLocal && (
                      <CardDescription className="truncate">{party.nameLocal}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{party.countryName}</span>
                  </div>

                  {party.ideology && (
                    <div>
                      <Badge variant="outline">{party.ideology}</Badge>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {getPartyTypeBadges(party).map((badge, index) => (
                      <Badge key={index} variant={badge.variant} className="text-xs">
                        {badge.label}
                      </Badge>
                    ))}
                  </div>

                  {party.currentLeader && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Leader: {party.currentLeader}
                      </span>
                    </div>
                  )}

                  {party.foundedYear && (
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Founded: {party.foundedYear}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredParties.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No parties found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or filters
          </p>
        </div>
      )}
    </div>
  );
}
