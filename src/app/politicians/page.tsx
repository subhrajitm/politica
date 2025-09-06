
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
import { Search, Loader2 } from 'lucide-react';
import AgeSlider from '@/components/AgeSlider';
import { MultiSelectFilter } from '@/components/MultiSelectFilter';

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
      <div className="mb-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-1">Politician Directory</h1>
        <p className="text-sm text-muted-foreground">
          Browse and search for political leaders across India.
        </p>
      </div>

      <div className="mb-4 p-3 bg-card border rounded-lg sticky top-16 z-10 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 items-start">
          <div className="relative md:col-span-2 lg:col-span-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, role, or constituency..."
              className="w-full pl-8 text-xs h-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 md:col-span-2">
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
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Filter by gender" />
              </SelectTrigger>
              <SelectContent>
                {genders.map((gender) => (
                  <SelectItem key={gender} value={gender} className="text-xs">
                    {gender === 'all' ? 'All Genders' : gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
             <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                <SelectItem value="current" className="text-xs">Current</SelectItem>
                <SelectItem value="former" className="text-xs" disabled>Former</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
             <AgeSlider
              value={ageRange}
              onValueChange={setAgeRange}
              min={25}
              max={100}
              step={1}
            />
          </div>
        </div>
      </div>

      {filteredPoliticians.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredPoliticians.map((p) => (
            <PoliticianCard key={p.id} politician={p} />
          ))}
        </div>
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
