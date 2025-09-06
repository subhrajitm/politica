
'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { differenceInYears } from 'date-fns';
import { PoliticianService } from '@/lib/politicianService';
import { PoliticalPartyService } from '@/lib/politicalPartyService';
import type { Politician, PoliticalParty } from '@/lib/types';
import PoliticianCard from '@/components/PoliticianCard';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Loader2, Grid3X3, List, MapPin, Eye } from 'lucide-react';
import AgeSlider from '@/components/AgeSlider';
import { MultiSelectFilter } from '@/components/MultiSelectFilter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PartyLogo } from '@/components/PartyLogo';
import FavouriteButton from '@/components/FavouriteButton';
import ImageWithPlaceholder from '@/components/ImageWithPlaceholder';
import Link from 'next/link';

function PoliticiansPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialState = searchParams.get('state') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [partyFilter, setPartyFilter] = useState<string[]>([]);
  const [stateFilter, setStateFilter] = useState<string[]>(initialState ? [initialState] : []);
  const [genderFilter, setGenderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ageRange, setAgeRange] = useState<[number, number]>([25, 100]);
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');

  useEffect(() => {
    const stateParam = searchParams.get('state');
    if (stateParam) {
      setStateFilter([stateParam]);
    }
  }, [searchParams]);

  // Load politicians and parties from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [politiciansData, partiesData] = await Promise.all([
          PoliticianService.getAllPoliticians(),
          PoliticalPartyService.getAllParties()
        ]);
        setPoliticians(politiciansData);
        setParties(partiesData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const availableParties = useMemo(() => {
    // Get unique parties from both database and politician data
    const dbParties = parties.map(p => p.name);
    const politicianParties = politicians.map(p => p.party);
    const allParties = [...new Set([...dbParties, ...politicianParties])];
    return allParties.sort();
  }, [parties, politicians]);

  const states = useMemo(() => {
    const allStates = politicians
      .map((p) => {
        const parts = p.constituency.split(', ');
        return parts.length > 1 ? parts[1].trim() : null;
      })
      .filter((s): s is string => s !== null);
    return [...Array.from(new Set(allStates))].sort();
  }, [politicians]);

  const genders = useMemo(() => {
    const allGenders = politicians.map((p) => p.personalDetails.gender);
    return ['all', ...Array.from(new Set(allGenders)).sort()];
  }, [politicians]);
  
  const filteredPoliticians = useMemo(() => {
    return politicians.filter((p) => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = p.name.fullName.toLowerCase().includes(searchLower);
      const positionMatch = p.positions.current.position.toLowerCase().includes(searchLower);
      const constituencyMatch = p.constituency.toLowerCase().includes(searchLower);
      
      const partyMatch = partyFilter.length === 0 || partyFilter.includes(p.party);

      const constituencyState = p.constituency.split(', ')[1]?.trim();
      const stateMatch = stateFilter.length === 0 || (constituencyState && stateFilter.includes(constituencyState));

      const genderMatch = genderFilter === 'all' || p.personalDetails.gender === genderFilter;

      // For now, all are 'current'. This is for future-proofing.
      const statusMatch = statusFilter === 'all' || (statusFilter === 'current' && p.positions.current.position);

      const age = differenceInYears(new Date(), new Date(p.personalDetails.dateOfBirth));
      const ageMatch = age >= ageRange[0] && age <= ageRange[1];

      return (nameMatch || positionMatch || constituencyMatch) && partyMatch && stateMatch && genderMatch && statusMatch && ageMatch;
    });
  }, [politicians, searchTerm, partyFilter, stateFilter, genderFilter, statusFilter, ageRange]);

  // Compact tile component matching homepage design
  const PoliticianCompactTile = ({ politician }: { politician: Politician }) => (
    <Link href={`/politicians/${politician.id}`} className="block">
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
              <ImageWithPlaceholder
                src={politician.photoUrl}
                alt={politician.name.fullName}
                fill
                className="rounded-full"
                placeholder="user"
              />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {politician.name.fullName}
              </h3>
              <p className="text-xs text-muted-foreground">
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
  );

  // Table row component
  const PoliticianTableRow = ({ politician }: { politician: Politician }) => (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <Link href={`/politicians/${politician.id}`} className="flex items-center space-x-3 group">
          <div className="relative w-8 h-8 flex-shrink-0">
            <ImageWithPlaceholder
              src={politician.photoUrl}
              alt={politician.name.fullName}
              width={32}
              height={32}
              className="w-full h-full rounded-full border border-muted"
              placeholder="user"
            />
          </div>
          <div>
            <div className="font-medium text-sm group-hover:text-primary transition-colors">
              {politician.name.fullName}
            </div>
            <div className="text-xs text-muted-foreground">
              {politician.personalDetails.gender} • {differenceInYears(new Date(), new Date(politician.personalDetails.dateOfBirth))} years
            </div>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <PartyLogo party={politician.party} className="w-4 h-4" />
          <span className="text-sm">{politician.party}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-1">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">{politician.constituency}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant="secondary" className="text-xs">
          {politician.positions.current.position}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <FavouriteButton 
            politicianId={politician.id}
            politicianName={politician.name.fullName}
            variant="ghost"
            size="sm"
            showText={false}
            className="h-6 w-6"
          />
          <Link href={`/politicians/${politician.id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading politicians...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="text-center py-12">
          <p className="text-lg text-destructive">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Politician Directory</h1>
          <p className="text-sm text-muted-foreground">
            Browse and search for political leaders across India.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{filteredPoliticians.length} politicians</span>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-l-none"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-4 p-2 bg-card border rounded-lg sticky top-16 z-10 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 items-start">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, role, or constituency..."
              className="w-full pl-8 text-xs h-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <MultiSelectFilter
            title="Party"
            options={availableParties.map(p => ({ label: p, value: p }))}
            selectedValues={partyFilter}
            onValueChange={setPartyFilter}
          />
          <MultiSelectFilter
            title="State"
            options={states.map(s => ({ label: s, value: s }))}
            selectedValues={stateFilter}
            onValueChange={setStateFilter}
          />
          <div className="grid grid-cols-2 gap-2">
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                {genders.map((gender) => (
                  <SelectItem key={gender} value={gender} className="text-xs">
                    {gender === 'all' ? 'All' : gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All</SelectItem>
                <SelectItem value="current" className="text-xs">Current</SelectItem>
                <SelectItem value="former" className="text-xs" disabled>Former</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-2">
          <AgeSlider
            value={ageRange}
            onValueChange={setAgeRange}
            min={25}
            max={100}
            step={1}
          />
        </div>
      </div>

      {filteredPoliticians.length > 0 ? (
        viewMode === 'table' ? (
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-sm">Politician</th>
                    <th className="text-left px-4 py-3 font-medium text-sm">Party</th>
                    <th className="text-left px-4 py-3 font-medium text-sm">Constituency</th>
                    <th className="text-left px-4 py-3 font-medium text-sm">Position</th>
                    <th className="text-left px-4 py-3 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPoliticians.map((p) => (
                    <PoliticianTableRow key={p.id} politician={p} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {filteredPoliticians.map((p) => (
              <PoliticianCard key={p.id} politician={p} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredPoliticians.map((p) => (
              <PoliticianCompactTile key={p.id} politician={p} />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No politicians found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}


export default function PoliticiansPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PoliticiansPageContent />
    </Suspense>
  );
}
