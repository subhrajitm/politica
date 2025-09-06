'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Users, Crown, Vote, Building, Grid3X3, List, Eye } from 'lucide-react';
import { PoliticalPartyService } from '@/lib/politicalPartyService';
import { PoliticalParty } from '@/lib/types';
import Pagination from '@/components/Pagination';

export default function PartiesPage() {
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [countries, setCountries] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'compact' | 'table'>('compact');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); // Show 20 items per page by default

  useEffect(() => {
    loadParties();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, countryFilter, typeFilter]);

  const loadParties = async () => {
    try {
      setLoading(true);
      // Use API with pagination for better performance
      const response = await fetch('/api/parties?limit=1000'); // Get more data but still limit it
      if (!response.ok) {
        throw new Error('Failed to fetch parties');
      }
      const result = await response.json();
      const data = result.data || [];
      
      setParties(data);
      
      // Extract unique countries
      const uniqueCountries = [...new Set(data.map(party => party.countryName))].sort();
      setCountries(uniqueCountries);
    } catch (error) {
      console.error('Error loading parties:', error);
      // Fallback to service if API fails
      try {
        const data = await PoliticalPartyService.getAllParties();
        setParties(data);
        const uniqueCountries = [...new Set(data.map(party => party.countryName))].sort();
        setCountries(uniqueCountries);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredParties = useMemo(() => {
    let filtered = parties;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(party =>
        party.name.toLowerCase().includes(query) ||
        party.nameLocal?.toLowerCase().includes(query) ||
        party.ideology?.toLowerCase().includes(query) ||
        party.countryName.toLowerCase().includes(query)
      );
    }

    // Country filter
    if (countryFilter !== 'all') {
      filtered = filtered.filter(party => party.countryName === countryFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      switch (typeFilter) {
        case 'ruling':
          filtered = filtered.filter(party => party.isRulingParty);
          break;
        case 'parliamentary':
          filtered = filtered.filter(party => party.isParliamentary);
          break;
        case 'regional':
          filtered = filtered.filter(party => party.isRegional);
          break;
      }
    }

    return filtered;
  }, [parties, searchQuery, countryFilter, typeFilter]);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredParties.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedParties = filteredParties.slice(startIndex, endIndex);
    
    return {
      displayedParties,
      totalPages,
      totalItems: filteredParties.length,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, filteredParties.length)
    };
  }, [filteredParties, currentPage, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  }, []);

  const getPartyTypeBadges = (party: PoliticalParty) => {
    const badges = [];
    if (party.isRulingParty) badges.push({ label: 'Ruling', variant: 'default' as const });
    if (party.isParliamentary) badges.push({ label: 'Parliamentary', variant: 'secondary' as const });
    if (party.isRegional) badges.push({ label: 'Regional', variant: 'outline' as const });
    return badges;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading political parties...</div>
        </div>
      </div>
    );
  }

  const renderCompactCard = (party: PoliticalParty) => (
    <Link key={party.id} href={`/parties/${party.id}`}>
      <Card className="h-full hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {party.logoUrl && (
              <img
                src={party.logoUrl}
                alt={`${party.name} logo`}
                className="w-10 h-10 rounded-full object-cover border border-muted flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{party.name}</h3>
                  {party.nameLocal && (
                    <p className="text-xs text-muted-foreground truncate">{party.nameLocal}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 ml-2">
                  {getPartyTypeBadges(party).slice(0, 2).map((badge, index) => (
                    <Badge key={index} variant={badge.variant} className="text-xs px-1.5 py-0.5">
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{party.countryName}</span>
                </div>
                {party.ideology && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    {party.ideology}
                  </Badge>
                )}
                {party.currentLeader && (
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate">
                      {party.currentLeader}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const renderTableRow = (party: PoliticalParty) => (
    <tr key={party.id} className="hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <Link href={`/parties/${party.id}`} className="flex items-center space-x-3 group">
          {party.logoUrl && (
            <img
              src={party.logoUrl}
              alt={`${party.name} logo`}
              className="w-8 h-8 rounded-full object-cover border border-muted"
            />
          )}
          <div>
            <div className="font-medium text-sm group-hover:text-primary transition-colors">
              {party.name}
            </div>
            {party.nameLocal && (
              <div className="text-xs text-muted-foreground">{party.nameLocal}</div>
            )}
          </div>
        </Link>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-1">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">{party.countryName}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        {party.ideology && (
          <Badge variant="outline" className="text-xs">
            {party.ideology}
          </Badge>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {getPartyTypeBadges(party).map((badge, index) => (
            <Badge key={index} variant={badge.variant} className="text-xs">
              {badge.label}
            </Badge>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        {party.currentLeader && (
          <div className="text-sm text-muted-foreground truncate max-w-32">
            {party.currentLeader}
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <Link href={`/parties/${party.id}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Eye className="w-4 h-4" />
          </Button>
        </Link>
      </td>
    </tr>
  );

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Political Parties</h1>
            <p className="text-muted-foreground">
              Showing {paginationData.startIndex}-{paginationData.endIndex} of {paginationData.totalItems} parties ({parties.length} total)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-muted-foreground mr-4">View:</div>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'compact' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('compact')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sticky Filters */}
      <div className="sticky top-0 z-10 bg-background border-b pb-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search parties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map(country => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="ruling">Ruling Parties</SelectItem>
              <SelectItem value="parliamentary">Parliamentary Parties</SelectItem>
              <SelectItem value="regional">Regional Parties</SelectItem>
            </SelectContent>
          </Select>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground flex items-center">
            {paginationData.totalItems} results
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-4 py-3 font-medium text-sm">Party</th>
                  <th className="text-left px-4 py-3 font-medium text-sm">Country</th>
                  <th className="text-left px-4 py-3 font-medium text-sm">Ideology</th>
                  <th className="text-left px-4 py-3 font-medium text-sm">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-sm">Leader</th>
                  <th className="text-left px-4 py-3 font-medium text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginationData.displayedParties.map(renderTableRow)}
              </tbody>
            </table>
          </div>
        </Card>
      ) : viewMode === 'compact' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {paginationData.displayedParties.map(renderCompactCard)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginationData.displayedParties.map((party) => (
            <Link key={party.id} href={`/parties/${party.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    {party.logoUrl && (
                      <img
                        src={party.logoUrl}
                        alt={`${party.name} logo`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-muted"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{party.name}</CardTitle>
                      {party.nameLocal && (
                        <CardDescription className="truncate">{party.nameLocal}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{party.countryName}</span>
                    </div>

                    {party.ideology && (
                      <div>
                        <Badge variant="outline">{party.ideology}</Badge>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {getPartyTypeBadges(party).map((badge, index) => (
                        <Badge key={index} variant={badge.variant} className="text-xs">
                          {badge.label}
                        </Badge>
                      ))}
                    </div>

                    {party.currentLeader && (
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground truncate">
                          {party.currentLeader}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {paginationData.totalPages > 1 && (
        <div className="mt-8 border-t pt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={paginationData.totalPages}
            onPageChange={handlePageChange}
            showPageNumbers={true}
            maxVisiblePages={5}
            showFirstLast={true}
            showGoToPage={true}
          />
        </div>
      )}

      {filteredParties.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No parties found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or filters
          </p>
        </div>
      )}
    </div>
  );
}
