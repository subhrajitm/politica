
'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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

function PoliticiansPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [partyFilter, setPartyFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');

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
  
  const filteredPoliticians = useMemo(() => {
    return politicians.filter((p) => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = p.name.toLowerCase().includes(searchLower);
      const positionMatch = p.currentPosition.toLowerCase().includes(searchLower);
      const constituencyMatch = p.constituency.toLowerCase().includes(searchLower);
      
      const partyMatch = partyFilter === 'all' || p.party === partyFilter;

      const constituencyState = p.constituency.split(', ')[1]?.trim();
      const stateMatch = stateFilter === 'all' || constituencyState === stateFilter;
      
      return (nameMatch || positionMatch || constituencyMatch) && partyMatch && stateMatch;
    });
  }, [searchTerm, partyFilter, stateFilter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Politician Directory</h1>
        <p className="text-lg text-muted-foreground">
          Browse and search for political leaders across India.
        </p>
      </div>

      <div className="mb-8 p-4 bg-card border rounded-lg sticky top-20 z-10 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, role, or constituency..."
              className="w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={partyFilter} onValueChange={setPartyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by party" />
            </SelectTrigger>
            <SelectContent>
              {parties.map((party) => (
                <SelectItem key={party} value={party}>
                  {party === 'all' ? 'All Parties' : party}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state === 'all' ? 'All States' : state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredPoliticians.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPoliticians.map((p) => (
            <PoliticianCard key={p.id} politician={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">No politicians found matching your criteria.</p>
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
