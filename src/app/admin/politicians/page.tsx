
'use client';

import { useState, useEffect } from 'react';
import { PoliticianService } from '@/lib/politicianService';
import type { Politician } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Loader2,
  User,
  Building,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPoliticiansPage() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPoliticians, setFilteredPoliticians] = useState<Politician[]>([]);

  useEffect(() => {
    loadPoliticians();
  }, []);

  useEffect(() => {
    const filtered = politicians.filter(p => 
      p.name.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.constituency.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPoliticians(filtered);
  }, [searchTerm, politicians]);

  async function loadPoliticians() {
    try {
      setLoading(true);
      const data = await PoliticianService.getAllPoliticians();
      setPoliticians(data);
    } catch (error) {
      console.error('Error loading politicians:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deletePolitician(id: string) {
    if (!confirm('Are you sure you want to delete this politician? This action cannot be undone.')) {
      return;
    }

    try {
      await PoliticianService.deletePolitician(id);
      await loadPoliticians(); // Reload the list
    } catch (error) {
      console.error('Error deleting politician:', error);
      alert('Failed to delete politician. Please try again.');
    }
  }

  if (loading) {
    return (
          <div className="w-full px-6 py-8 h-full overflow-y-auto">
      <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading politicians...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Politicians</h1>
          <p className="text-muted-foreground">Add, edit, and remove politician profiles</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/admin/politicians/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Politician
            </Button>
          </Link>
          <Link href="/admin/politicians/bulk">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Bulk Add
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, party, or constituency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredPoliticians.map((politician) => (
          <Card key={politician.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{politician.name.fullName}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Building className="w-4 h-4" />
                        <span>{politician.party}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{politician.constituency}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {politician.positions.current.position}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{politician.personalDetails.gender}</Badge>
                  <Link href={`/admin/politicians/${politician.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deletePolitician(politician.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPoliticians.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            {searchTerm ? 'No politicians found matching your search.' : 'No politicians found.'}
          </p>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Total: {filteredPoliticians.length} politician{filteredPoliticians.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
