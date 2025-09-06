
'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, MapPin } from 'lucide-react';
import countries from '../../../..//country_data/country_state.json';

type CountryItem = {
  name: string;
  countryCode: string;
  countryCodeAlpha3?: string;
  phone?: string;
  currency?: string;
  flag?: string;
  symbol?: string;
  stateProvinces?: { name: string }[];
};

type StateItem = {
  name: string;
  country: string;
  countryCode: string;
};

export default function BrowseStatesPage() {
  const [query, setQuery] = useState('');

  // Flatten all states from all countries
  const allStates: StateItem[] = useMemo(() => {
    const states: StateItem[] = [];
    (countries as CountryItem[]).forEach(country => {
      if (country.stateProvinces) {
        country.stateProvinces.forEach(state => {
          states.push({
            name: state.name,
            country: country.name,
            countryCode: country.countryCode
          });
        });
      }
    });
    return states.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Filter states based on search query
  const filteredStates = useMemo(() => {
    if (!query.trim()) return allStates;
    const q = query.toLowerCase();
    return allStates.filter(state => 
      state.name.toLowerCase().includes(q) ||
      state.country.toLowerCase().includes(q)
    );
  }, [allStates, query]);

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-1">Browse by State/Province</h1>
        <p className="text-sm text-muted-foreground">
          Click on a state or province to view its politicians.
        </p>
      </div>

      <div className="mb-4 p-3 bg-card border rounded-lg">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by state/province or country..."
            className="w-full pl-8 text-xs h-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredStates.map((state) => (
          <Link
            key={`${state.countryCode}-${state.name}`}
            href={`/politicians/state/${encodeURIComponent(state.name)}`}
            className="block group"
          >
            <Card className="p-4 h-full transition-all duration-300 group-hover:shadow-lg group-hover:border-primary/50 group-hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="font-semibold group-hover:text-primary">{state.name}</h2>
                  <p className="text-xs text-muted-foreground">{state.country}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filteredStates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No states/provinces found matching your search.</p>
        </div>
      )}
    </div>
  );
}
