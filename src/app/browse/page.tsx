'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { Politician } from '@/lib/types';
import { PoliticianService } from '@/lib/politicianService';
import PoliticianCard from '@/components/PoliticianCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase } from 'lucide-react';

export default function BrowsePage() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoliticians = async () => {
      try {
        const data = await PoliticianService.getAllPoliticians();
        setPoliticians(data);
      } catch (error) {
        console.error('Error fetching politicians:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoliticians();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const groupedByPosition: { [key: string]: Politician[] } = {};

  politicians.forEach((p) => {
    const position = p.positions.current.position;
    if (!groupedByPosition[position]) {
      groupedByPosition[position] = [];
    }
    groupedByPosition[position].push(p);
  });

  const sortedGroups = Object.entries(groupedByPosition).sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-1">Browse by Role</h1>
        <p className="text-sm text-muted-foreground">
          Discover political leaders based on their current positions.
        </p>
      </div>

      <div className="space-y-6">
        {sortedGroups.map(([position, members]) => (
          <Card key={position}>
            <CardHeader className="p-4">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <span>{position}</span>
                </div>
                <Badge variant="secondary">{members.length} member{members.length > 1 ? 's' : ''}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {members.map((p) => (
                  <PoliticianCard key={p.id} politician={p} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
