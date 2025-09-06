'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Users, Grid3X3, List, Eye } from 'lucide-react';
import countries from '../../../../../../../country_data/country_state.json';
import { useState, useEffect } from 'react';
import { PoliticianService } from '@/lib/politicianService';
import type { Politician } from '@/lib/types';
import { extractStateFromConstituency } from '@/lib/constituencyMapping';
import PoliticianCard from '@/components/PoliticianCard';
import ImageWithPlaceholder from '@/components/ImageWithPlaceholder';
import { PartyLogo } from '@/components/PartyLogo';
import FavouriteButton from '@/components/FavouriteButton';
import { differenceInYears } from 'date-fns';

type CountryItem = {
  name: string;
  countryCode: string;
  flag?: string;
  stateProvinces?: { name: string }[];
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

export default function StatePoliticiansPage() {
  const params = useParams();
  const countryCode = String(params?.code || '').toUpperCase();
  const stateName = decodeURIComponent(String(params?.state || ''));
  
  const all = countries as CountryItem[];
  const country = all.find(c => c.countryCode.toUpperCase() === countryCode);
  
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');

  useEffect(() => {
    async function loadPoliticians() {
      try {
        setLoading(true);
        setError(null);
        
        const allPoliticians = await PoliticianService.getAllPoliticians();
        
        // Filter politicians by state using improved matching
        let statePoliticians: Politician[];
        
        if (stateName === 'Other') {
          // For "Other" category, show politicians from this country that are not mapped to any state
          statePoliticians = allPoliticians.filter(politician => {
            const state = extractStateFromConstituency(politician.constituency, politician.personalDetails.nationality);
            const politicianCountry = politician.personalDetails.nationality;
            return !state && politicianCountry && isPoliticianFromCountry(politicianCountry, country?.name || '');
          });
        } else {
          // Normal case: filter by state
          statePoliticians = allPoliticians.filter(politician => {
            const state = extractStateFromConstituency(politician.constituency, politician.personalDetails.nationality);
            return state === stateName;
          });
        }
        
        setPoliticians(statePoliticians);
      } catch (err) {
        console.error('Error loading politicians:', err);
        setError('Failed to load politician data');
      } finally {
        setLoading(false);
      }
    }
    
    loadPoliticians();
  }, [stateName]);

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

  // Compact tile component for list view
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
              {politician.constituency.split(',')[0] || politician.constituency}
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

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/browse/countries/${countryCode.toLowerCase()}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to {country.name}
            </Button>
          </Link>
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {stateName === 'Other' ? 'Other Politicians' : stateName}
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            {stateName === 'Other' 
              ? `Political leaders from ${country?.name} not associated with specific states`
              : `Political leaders from ${stateName}, ${country?.name}`
            }
          </p>
          
          {!loading && (
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{politicians.length} {politicians.length === 1 ? 'politician' : 'politicians'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading politicians...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      ) : politicians.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{politicians.length} politicians</span>
            </div>
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

          {viewMode === 'table' ? (
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
                    {politicians.map((p) => (
                      <PoliticianTableRow key={p.id} politician={p} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {politicians.map((p) => (
                <PoliticianCard key={p.id} politician={p} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {politicians.map((p) => (
                <PoliticianCompactTile key={p.id} politician={p} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No politicians found for {stateName}.</p>
        </div>
      )}
    </div>
  );
}
