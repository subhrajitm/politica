'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Globe, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import countries from '../../../../country_data/country_state.json';

type CountryItem = {
  name: string;
  countryCode: string;
  countryCodeAlpha3?: string;
  phone?: string;
  currency?: string;
  flag?: string;
  symbol?: string;
  stateProvinces?: { name: string }[];
};

export default function BrowseCountriesPage() {
  const [query, setQuery] = useState('');
  const countryList = useMemo(() => {
    const list = (countries as CountryItem[]).slice().sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(c => {
      const inName = c.name.toLowerCase().includes(q);
      const inCode = c.countryCode.toLowerCase().includes(q) || (c.countryCodeAlpha3?.toLowerCase().includes(q) ?? false);
      const inStates = (c.stateProvinces || []).some(s => s.name.toLowerCase().includes(q));
      return inName || inCode || inStates;
    });
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-1">Browse by Country</h1>
        <p className="text-sm text-muted-foreground">
          Explore countries and their states/provinces.
        </p>
      </div>

      <div className="mb-4 p-3 bg-card border rounded-lg">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by country, code, or state/province..."
            className="w-full pl-8 text-xs h-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {countryList.map((country) => {
          const statesCount = country.stateProvinces?.length ?? 0;
          return (
            <Link
              key={country.countryCode + country.name}
              href={`/browse/countries/${country.countryCode.toLowerCase()}`}
              className="block group"
            >
              <Card className="p-4 h-full transition-all duration-300 group-hover:shadow-lg group-hover:border-primary/50 group-hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  {country.flag ? (
                    <Image
                      src={country.flag}
                      alt={`${country.name} flag`}
                      width={24}
                      height={16}
                      className="rounded border"
                    />
                  ) : (
                    <Globe className="w-5 h-5 text-primary" />
                  )}
                  <div>
                    <h2 className="font-semibold group-hover:text-primary">{country.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {statesCount} {statesCount === 1 ? 'state/province' : 'states/provinces'}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


