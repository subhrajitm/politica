'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import countries from '../../../../../country_data/country_state.json';

type CountryItem = {
  name: string;
  countryCode: string;
  flag?: string;
  stateProvinces?: { name: string }[];
};

export default function CountryStatesPage() {
  const params = useParams();
  const code = String(params?.code || '').toUpperCase();
  const all = countries as CountryItem[];
  const country = all.find(c => c.countryCode.toUpperCase() === code);

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

  const states = country.stateProvinces || [];

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-1">{country.name}</h1>
        <p className="text-sm text-muted-foreground">States and provinces</p>
      </div>

      {states.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {states.map((s) => (
            <Link
              key={s.name}
              href={`/politicians?state=${encodeURIComponent(s.name)}`}
              className="block group"
            >
              <Card className="p-4 h-full transition-all duration-300 group-hover:shadow-lg group-hover:border-primary/50 group-hover:-translate-y-0.5">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="font-semibold group-hover:text-primary">{s.name}</h2>
                    <p className="text-xs text-muted-foreground">View politicians in this state</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-sm text-muted-foreground">No states/provinces listed.</div>
      )}

      <div className="text-center mt-6">
        <Link href="/browse/countries" className="text-primary underline text-sm">Back to countries</Link>
      </div>
    </div>
  );
}


