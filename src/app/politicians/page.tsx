
'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { differenceInYears } from 'date-fns';
import { politicians } from '@/lib/data';
import PoliticianCard from '@/components/PoliticianCard';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import AgeSlider from '@/components/AgeSlider';

function PoliticiansPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [partyFilter, setPartyFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ageRange, setAgeRange] = useState<[number, number]>([25, 100]);


  const parties = useMemo(() => {
    const allParties = politicians.map((p) => p.party);
    return ['all', ...Array.from(new Set(allParties)).sort()];
  }, []);

  const states = useMemo(() => {
    const allStates = politicians
      .map((p) => {
        const parts = p.constituency.split(', ');
        return parts.length > 1 ? parts[1].trim() : null;
      })
      .filter((s): s is string => s !== null);
    return ['all', ...Array.from(new Set(allStates)).sort()];
  }, []);

  const genders = useMemo(() => {
    const allGenders = politicians.map((p) => p.personalDetails.gender);
    return ['all', ...Array.from(new Set(allGenders)).sort()];
  }, []);
  
  const filteredPoliticians = useMemo(() => {
    return politicians.filter((p) => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = p.name.fullName.toLowerCase().includes(searchLower);
      const positionMatch = p.positions.current.position.toLowerCase().includes(searchLower);
      const constituencyMatch = p.constituency.toLowerCase().includes(searchLower);
      
      const partyMatch = partyFilter === 'all' || p.party === partyFilter;

      const constituencyState = p.constituency.split(', ')[1]?.trim();
      const stateMatch = stateFilter === 'all' || constituencyState === stateFilter;

      const genderMatch = genderFilter === 'all' || p.personalDetails.gender === genderFilter;

      // For now, all are 'current'. This is for future-proofing.
      const statusMatch = statusFilter === 'all' || (statusFilter === 'current' && p.positions.current.position);

      const age = differenceInYears(new Date(), new Date(p.personalDetails.dateOfBirth));
      const ageMatch = age >= ageRange[0] && age <= ageRange[1];

      return (nameMatch || positionMatch || constituencyMatch) && partyMatch && stateMatch && genderMatch && statusMatch && ageMatch;
    });
  }, [searchTerm, partyFilter, stateFilter, genderFilter, statusFilter, ageRange]);

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
            <Select value={partyFilter} onValueChange={setPartyFilter}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Filter by party" />
              </SelectTrigger>
              <SelectContent>
                {parties.map((party) => (
                  <SelectItem key={party} value={party} className="text-xs">
                    {party === 'all' ? 'All Parties' : party}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state} value={state} className="text-xs">
                    {state === 'all' ? 'All States' : state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
