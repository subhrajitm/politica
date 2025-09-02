'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { politicians } from '@/lib/data';
import PoliticianCard from '@/components/PoliticianCard';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedParty, setSelectedParty] = useState('all');

  const states = useMemo(() => {
    const allStates = politicians
      .map((p) => {
        const parts = p.constituency.split(', ');
        return parts.length > 1 ? parts[1].trim() : null;
      })
      .filter((state): state is string => state !== null);
    return ['All States', ...Array.from(new Set(allStates)).sort()];
  }, []);

  const parties = useMemo(() => {
    const allParties = politicians.map((p) => p.party);
    return ['All Parties', ...Array.from(new Set(allParties)).sort()];
  }, []);

  const filteredPoliticians = useMemo(() => {
    return politicians.filter((p) => {
      const state = p.constituency.split(', ')[1]?.trim();
      return (
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedState === 'all' ||
          selectedState === 'All States' ||
          state === selectedState) &&
        (selectedParty === 'all' ||
          selectedParty === 'All Parties' ||
          p.party === selectedParty)
      );
    });
  }, [searchTerm, selectedState, selectedParty]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
          Indian Political Directory
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Search, filter, and learn about leaders across the nation.
        </p>
      </div>

      <Card className="mb-8 p-4 md:p-6 shadow-md">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-1"
            />
            <Select
              value={selectedState}
              onValueChange={(value) =>
                setSelectedState(value === 'All States' ? 'all' : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by State" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedParty}
              onValueChange={(value) =>
                setSelectedParty(value === 'All Parties' ? 'all' : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Party" />
              </SelectTrigger>
              <SelectContent>
                {parties.map((party) => (
                  <SelectItem key={party} value={party}>
                    {party}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredPoliticians.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPoliticians.map((p) => (
            <PoliticianCard key={p.id} politician={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="font-headline text-2xl font-semibold">
            No Politicians Found
          </h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}
