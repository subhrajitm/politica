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
import { List, Search } from 'lucide-react';

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
    <div className="bg-muted/30 min-h-full">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
            Indian Political Directory
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive and impartial guide to the leaders shaping India.
            Search, filter, and learn about politicians across the nation.
          </p>
        </div>

        <Card className="mb-8 p-4 shadow-sm sticky top-[calc(theme(height.16)+1px)] z-10">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:w-auto md:flex">
                <Select
                  value={selectedState}
                  onValueChange={(value) =>
                    setSelectedState(value === 'All States' ? 'all' : value)
                  }
                >
                  <SelectTrigger className="w-full md:w-[200px]">
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
                  <SelectTrigger className="w-full md:w-[240px]">
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
            </div>
          </CardContent>
        </Card>

        {filteredPoliticians.length > 0 ? (
          <div className="space-y-4">
            {filteredPoliticians.map((p) => (
              <PoliticianCard key={p.id} politician={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-lg bg-card border border-dashed">
            <List className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-headline text-2xl font-semibold">
              No Politicians Found
            </h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
