'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, Globe, Building, Users, Crown, MapPin, Upload } from 'lucide-react';
import { PoliticalPartyService } from '@/lib/politicalPartyService';
import { PoliticalParty } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export default function AdminPartiesPage() {
  const router = useRouter();
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [filteredParties, setFilteredParties] = useState<PoliticalParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    loadParties();
  }, []);

  useEffect(() => {
    filterParties();
  }, [parties, searchQuery, countryFilter, typeFilter]);

  const loadParties = async () => {
    try {
      setLoading(true);
      const data = await PoliticalPartyService.getAllParties();
      setParties(data);
      
      // Extract unique countries
      const uniqueCountries = [...new Set(data.map(party => party.countryName))].sort();
      setCountries(uniqueCountries);
    } catch (error) {
      console.error('Error loading parties:', error);
      toast({
        title: 'Error',
        description: 'Failed to load political parties',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterParties = () => {
    let filtered = parties;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(party =>
        party.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        party.nameLocal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        party.ideology?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        party.countryName.toLowerCase().includes(searchQuery.toLowerCase())
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

    setFilteredParties(filtered);
  };

  const handleDeleteParty = async (partyId: string) => {
    try {
      await PoliticalPartyService.deleteParty(partyId);
      setParties(parties.filter(party => party.id !== partyId));
      toast({
        title: 'Success',
        description: 'Political party deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting party:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete political party',
        variant: 'destructive',
      });
    }
  };

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

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Political Parties</h1>
          <p className="text-muted-foreground">
            Manage political parties from around the world
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => router.push('/admin/parties/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Party
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/parties/bulk')}
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search parties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
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
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ruling">Ruling Parties</SelectItem>
                <SelectItem value="parliamentary">Parliamentary Parties</SelectItem>
                <SelectItem value="regional">Regional Parties</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground flex items-center">
              {filteredParties.length} of {parties.length} parties
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Political Parties ({filteredParties.length})</CardTitle>
          <CardDescription>
            Click on a party to view details or edit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Ideology</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Leader</TableHead>
                  <TableHead>Founded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParties.map((party) => (
                  <TableRow key={party.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {party.logoUrl && (
                          <img
                            src={party.logoUrl}
                            alt={`${party.name} logo`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{party.name}</div>
                          {party.nameLocal && (
                            <div className="text-sm text-muted-foreground">
                              {party.nameLocal}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{party.countryName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {party.ideology && (
                        <Badge variant="outline">{party.ideology}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getPartyTypeBadges(party).map((badge, index) => (
                          <Badge key={index} variant={badge.variant}>
                            {badge.label}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {party.currentLeader && (
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{party.currentLeader}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {party.foundedYear && (
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span>{party.foundedYear}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/parties/${party.id}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Political Party</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{party.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteParty(party.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
