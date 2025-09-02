
'use client';

import Link from 'next/link';
import { politicians } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { useMemo } from 'react';

export default function BrowseStatesPage() {
  const states = useMemo(() => {
    const allStates = politicians
      .map((p) => {
        const parts = p.constituency.split(', ');
        return parts.length > 1 ? parts[1].trim() : null;
      })
      .filter((s): s is string => s !== null);
    
    const stateCounts = allStates.reduce((acc, state) => {
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stateCounts).sort((a, b) => b[1] - a[1]);
  }, []);

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-1">Browse by State</h1>
        <p className="text-sm text-muted-foreground">
          Discover political leaders based on their state.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {states.map(([state, count]) => (
          <Link
            key={state}
            href={`/politicians?state=${encodeURIComponent(state)}`}
            className="block group"
          >
            <Card className="p-4 h-full transition-all duration-300 group-hover:shadow-lg group-hover:border-primary/50 group-hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div >
                  <h2 className="font-semibold group-hover:text-primary">{state}</h2>
                  <p className="text-xs text-muted-foreground">{count} representative{count > 1 ? 's' : ''}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
