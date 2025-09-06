'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, ArrowLeft } from 'lucide-react';
import countries from '../../../../../country_data/country_state.json';
import { useState, useEffect } from 'react';
import { PoliticianService } from '@/lib/politicianService';
import type { Politician } from '@/lib/types';
import { extractStateFromConstituency } from '@/lib/constituencyMapping';

type CountryItem = {
  name: string;
  countryCode: string;
  flag?: string;
  stateProvinces?: { name: string }[];
};

type StateWithPoliticians = {
  name: string;
  politicianCount: number;
  politicians: Politician[];
};

export default function CountryStatesPage() {
  const params = useParams();
  const code = String(params?.code || '').toUpperCase();
  const all = countries as CountryItem[];
  const country = all.find(c => c.countryCode.toUpperCase() === code);
  
  const [statesWithPoliticians, setStatesWithPoliticians] = useState<StateWithPoliticians[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPoliticians() {
      if (!country) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const politicians = await PoliticianService.getAllPoliticians();
        const states = country.stateProvinces || [];
        
        // Group politicians by state using improved matching
        const stateMap = new Map<string, Politician[]>();
        
        politicians.forEach(politician => {
          const state = extractStateFromConstituency(politician.constituency, politician.personalDetails.nationality);
          if (state) {
            if (!stateMap.has(state)) {
              stateMap.set(state, []);
            }
            stateMap.get(state)!.push(politician);
          }
        });
        
        // Create state data with politician counts
        const statesData: StateWithPoliticians[] = states.map(state => ({
          name: state.name,
          politicianCount: stateMap.get(state.name)?.length || 0,
          politicians: stateMap.get(state.name) || []
        }));
        
        // Sort by politician count (descending) then by name
        statesData.sort((a, b) => {
          if (b.politicianCount !== a.politicianCount) {
            return b.politicianCount - a.politicianCount;
          }
          return a.name.localeCompare(b.name);
        });
        
        setStatesWithPoliticians(statesData);
      } catch (err) {
        console.error('Error loading politicians:', err);
        setError('Failed to load politician data');
      } finally {
        setLoading(false);
      }
    }
    
    loadPoliticians();
  }, [country]);

  if (!country) {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Country not found</h1>
          <Link href="/browse/countries" className="text-primary underline">Back to countries</Link>
        </div>
      </div>
    );
  }

  const totalPoliticians = statesWithPoliticians.reduce((sum, state) => sum + state.politicianCount, 0);

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/browse/countries">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to countries
            </Button>
          </Link>
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{country.name}</h1>
          <p className="text-sm text-muted-foreground mb-4">
            States and provinces with political representation
          </p>
          
          {!loading && (
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{statesWithPoliticians.length} states/provinces</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{totalPoliticians} politicians</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading politician data...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      ) : statesWithPoliticians.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {statesWithPoliticians.map((state) => (
            <Link
              key={state.name}
              href={`/browse/countries/${code.toLowerCase()}/states/${encodeURIComponent(state.name)}`}
              className="block group"
            >
              <Card className="p-4 h-full transition-all duration-300 group-hover:shadow-lg group-hover:border-primary/50 group-hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold group-hover:text-primary text-lg">{state.name}</h2>
                  <Badge variant={state.politicianCount > 0 ? "default" : "secondary"} className="text-xs">
                    {state.politicianCount}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {state.politicianCount === 0 
                      ? "No politicians found" 
                      : state.politicianCount === 1 
                        ? "1 politician" 
                        : `${state.politicianCount} politicians`
                    }
                  </p>
                  
                  {state.politicianCount > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <p className="truncate">Click to view all politicians</p>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No states/provinces found for this country.</p>
        </div>
      )}
    </div>
  );
}


