'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PoliticianService } from '@/lib/politicianService';
import type { Politician } from '@/lib/types';
import PoliticianCard from '@/components/PoliticianCard';
import { Input } from '@/components/ui/input';
import { Search, ArrowLeft, Grid3X3, List, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PartyLogo } from '@/components/PartyLogo';
import FavouriteButton from '@/components/FavouriteButton';
import ImageWithPlaceholder from '@/components/ImageWithPlaceholder';
import Pagination from '@/components/Pagination';
import Link from 'next/link';

export default function StatePoliticiansPage() {
  const params = useParams();
  const router = useRouter();
  const stateName = String(params?.state || '');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(24);

  // Load politicians from the state
  useEffect(() => {
    async function loadPoliticians() {
      try {
        setLoading(true);
        setError(null);
        
        const allPoliticians = await PoliticianService.getAllPoliticians();
        
        // Filter by state (constituency contains the state name)
        const statePoliticians = allPoliticians.filter(p => {
          const constituency = p.constituency.toLowerCase();
          const state = stateName.toLowerCase();
          
          // Check if constituency contains the state name
          return constituency.includes(state) || 
                 constituency.includes(state.replace(/\s+/g, '')) ||
                 constituency.includes(state.replace(/\s+/g, '-'));
        });
        
        setPoliticians(statePoliticians);
      } catch (err) {
        console.error('Error loading politicians:', err);
        setError('Failed to load politicians. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (stateName) {
      loadPoliticians();
    }
  }, [stateName]);

  // Filter politicians based on search term
  const filteredPoliticians = useMemo(() => {
    if (!searchTerm.trim()) return politicians;
    
    const searchLower = searchTerm.toLowerCase();
    return politicians.filter(p => 
      p.name.fullName.toLowerCase().includes(searchLower) ||
      p.positions.current.position.toLowerCase().includes(searchLower) ||
      p.party.toLowerCase().includes(searchLower) ||
      p.constituency.toLowerCase().includes(searchLower)
    );
  }, [politicians, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPoliticians.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPoliticians = filteredPoliticians.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading politicians...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Politicians from {stateName}</h1>
            <p className="text-muted-foreground">
              {filteredPoliticians.length} politician{filteredPoliticians.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search politicians..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results */}
      {filteredPoliticians.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
              {paginatedPoliticians.map((politician) => (
                <PoliticianCard key={politician.id} politician={politician} />
              ))}
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              {paginatedPoliticians.map((politician) => (
                <Card key={politician.id} className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <ImageWithPlaceholder
                        src={politician.photoUrl}
                        alt={`Photo of ${politician.name.fullName}`}
                        fill
                        className="rounded-full"
                        sizes="64px"
                        placeholder="user"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Link href={`/politicians/${politician.id}`} className="font-semibold hover:text-primary">
                          {politician.name.fullName}
                        </Link>
                        <PartyLogo party={politician.party} className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{politician.positions.current.position}</p>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{politician.constituency}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FavouriteButton 
                        politicianId={politician.id}
                        politicianName={politician.name.fullName}
                        variant="ghost"
                        size="sm"
                        showText={false}
                      />
                      <Link href={`/politicians/${politician.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                showPageNumbers={true}
                maxVisiblePages={5}
                showFirstLast={true}
                showGoToPage={true}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            {searchTerm ? 'No politicians found matching your search.' : `No politicians found for ${stateName}.`}
          </p>
          {searchTerm && (
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm('')}
              className="mt-4"
            >
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
