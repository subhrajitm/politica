'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, ArrowLeft, Search, Filter } from 'lucide-react';
import countries from '../../../../../country_data/country_state.json';
import { useState, useEffect, useMemo } from 'react';
import { PoliticianService } from '@/lib/politicianService';
import type { Politician } from '@/lib/types';
import { extractStateFromConstituency } from '@/lib/constituencyMapping';
import PoliticianCard from '@/components/PoliticianCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

// Helper function to check if a politician's nationality matches a country
function isPoliticianFromCountry(nationality: string, countryName: string): boolean {
  const nationalityLower = nationality.toLowerCase();
  const countryLower = countryName.toLowerCase();
  
  // Direct match
  if (nationalityLower === countryLower) {
    return true;
  }
  
  // Special mappings for common nationality-to-country conversions
  const nationalityToCountryMap: Record<string, string> = {
    'nepali': 'nepal',
    'indian': 'india',
    'american': 'united states',
    'british': 'united kingdom',
    'canadian': 'canada',
    'australian': 'australia',
    'chinese': 'china',
    'japanese': 'japan',
    'german': 'germany',
    'french': 'france',
    'italian': 'italy',
    'spanish': 'spain',
    'russian': 'russia',
    'brazilian': 'brazil',
    'mexican': 'mexico',
    'south african': 'south africa'
  };
  
  const mappedCountry = nationalityToCountryMap[nationalityLower];
  if (mappedCountry && mappedCountry === countryLower) {
    return true;
  }
  
  return false;
}

export default function CountryStatesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = String(params?.code || '').toUpperCase();
  const all = countries as CountryItem[];
  const country = all.find(c => c.countryCode.toUpperCase() === code);
  
  const [statesWithPoliticians, setStatesWithPoliticians] = useState<StateWithPoliticians[]>([]);
  const [allPoliticians, setAllPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    async function loadPoliticians() {
      if (!country) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const politicians = await PoliticianService.getAllPoliticians();
        const states = country.stateProvinces || [];
        
        // Store all politicians for filtering
        setAllPoliticians(politicians);
        
        // Group politicians by state using improved matching
        const stateMap = new Map<string, Politician[]>();
        const unmappedPoliticians: Politician[] = [];
        
        politicians.forEach(politician => {
          const state = extractStateFromConstituency(politician.constituency, politician.personalDetails.nationality);
          if (state) {
            if (!stateMap.has(state)) {
              stateMap.set(state, []);
            }
            stateMap.get(state)!.push(politician);
          } else {
            // Check if politician belongs to this country (by nationality or other criteria)
            const politicianCountry = politician.personalDetails.nationality;
            if (politicianCountry && isPoliticianFromCountry(politicianCountry, country.name)) {
              unmappedPoliticians.push(politician);
            }
          }
        });
        
        // Create state data with politician counts
        let statesData: StateWithPoliticians[] = states.map(state => ({
          name: state.name,
          politicianCount: stateMap.get(state.name)?.length || 0,
          politicians: stateMap.get(state.name) || []
        }));
        
        // Add unmapped politicians as a special "Other" category if there are any
        if (unmappedPoliticians.length > 0) {
          statesData.push({
            name: 'Other',
            politicianCount: unmappedPoliticians.length,
            politicians: unmappedPoliticians
          });
        }
        
        // Sort by politician count (descending) then by name
        statesData.sort((a, b) => {
          if (b.politicianCount !== a.politicianCount) {
            return b.politicianCount - a.politicianCount;
          }
          return a.name.localeCompare(b.name);
        });
        
        setStatesWithPoliticians(statesData);
        
        // Set initial selected state (first state with politicians, or first state)
        const firstStateWithPoliticians = statesData.find(state => state.politicianCount > 0);
        if (firstStateWithPoliticians) {
          setSelectedState(firstStateWithPoliticians.name);
        } else if (statesData.length > 0) {
          setSelectedState(statesData[0].name);
        }
      } catch (err) {
        console.error('Error loading politicians:', err);
        setError('Failed to load politician data');
      } finally {
        setLoading(false);
      }
    }
    
    loadPoliticians();
  }, [country]);

  // Filter politicians based on selected state and search term
  const filteredPoliticians = useMemo(() => {
    if (!selectedState) return [];
    
    const selectedStateData = statesWithPoliticians.find(state => state.name === selectedState);
    if (!selectedStateData) return [];
    
    let politicians = selectedStateData.politicians;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      politicians = politicians.filter(politician => 
        politician.name.fullName.toLowerCase().includes(searchLower) ||
        politician.party.toLowerCase().includes(searchLower) ||
        politician.positions.current.position.toLowerCase().includes(searchLower)
      );
    }
    
    return politicians;
  }, [selectedState, statesWithPoliticians, searchTerm]);

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
    <div className="container mx-auto px-4 py-2">
      {/* Compact Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <Link href="/browse/countries">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to countries
            </Button>
          </Link>
          
          {!loading && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{statesWithPoliticians.length} states</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{totalPoliticians} politicians</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">{country.name}</h1>
          <p className="text-xs text-muted-foreground">
            Browse politicians by state and province
          </p>
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
        <div className="flex gap-6 h-[calc(100vh-140px)]">
          {/* Sidebar - States */}
          <div className="w-80 flex-shrink-0">
            <Card className="h-full p-4">
              <div className="mb-3">
                <h2 className="font-semibold text-base mb-1">States & Provinces</h2>
                <p className="text-xs text-muted-foreground">
                  Select a state to view its politicians
                </p>
              </div>
              
              <div className="space-y-2 overflow-y-auto max-h-[calc(100%-80px)]">
                {statesWithPoliticians.map((state) => (
                  <button
                    key={state.name}
                    onClick={() => setSelectedState(state.name)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      selectedState === state.name
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{state.name}</h3>
                        <p className="text-xs opacity-75">
                          {state.politicianCount === 0 
                            ? "No politicians" 
                            : state.politicianCount === 1 
                              ? "1 politician" 
                              : `${state.politicianCount} politicians`
                          }
                        </p>
                      </div>
                      <Badge 
                        variant={state.politicianCount > 0 ? "secondary" : "outline"} 
                        className="text-xs"
                      >
                        {state.politicianCount}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content - Politicians */}
          <div className="flex-1 min-w-0">
            <Card className="h-full p-4">
              {selectedState ? (
                <div className="h-full flex flex-col">
                  {/* Header with search and filters */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h2 className="text-lg font-semibold">{selectedState}</h2>
                        <p className="text-xs text-muted-foreground">
                          {filteredPoliticians.length} politician{filteredPoliticians.length !== 1 ? 's' : ''}
                          {searchTerm && ` matching "${searchTerm}"`}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select value={viewMode} onValueChange={(value: 'grid' | 'list') => setViewMode(value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grid">Grid</SelectItem>
                            <SelectItem value="list">List</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search politicians..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-8 text-sm"
                      />
                    </div>
                  </div>

                  {/* Politicians List */}
                  <div className="flex-1 overflow-y-auto">
                    {filteredPoliticians.length > 0 ? (
                      <div className={
                        viewMode === 'grid' 
                          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                          : "space-y-4"
                      }>
                        {filteredPoliticians.map((politician) => (
                          <PoliticianCard
                            key={politician.id}
                            politician={politician}
                            viewMode={viewMode}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          {searchTerm ? 'No politicians found' : 'No politicians in this state'}
                        </h3>
                        <p className="text-muted-foreground">
                          {searchTerm 
                            ? `No politicians match "${searchTerm}" in ${selectedState}`
                            : `There are no politicians associated with ${selectedState}`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a State</h3>
                  <p className="text-muted-foreground">
                    Choose a state or province from the sidebar to view its politicians
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No states/provinces found for this country.</p>
        </div>
      )}
    </div>
  );
}


