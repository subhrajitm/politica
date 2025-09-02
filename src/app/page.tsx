'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { politicians, Politician } from '@/lib/data';
import { ArrowRight, Search, Quote, Briefcase, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  
  const trendingProfiles = politicians.slice(0, 4);

  const suggestedSearches = [
    'Senator',
    'Project Manager',
    'Sales',
    'Developer',
    'Personal Assistant',
    'Board member',
    'HR Assistant',
    'Entrepreneur',
    'Director',
    'IT Support',
    'Governor',
    'Financial Advisor',
  ];
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to handle search will be added later
  };

  const handleSuggestedSearch = (term: string) => {
    // Logic to handle search will be added later
  };


  return (
    <div className="flex flex-col min-h-full">
      <section className="bg-gradient-to-br from-primary via-purple-600 to-indigo-600 text-primary-foreground relative">
        <div className="absolute inset-0 bg-[url(/grain.svg)] bg-repeat opacity-20 mix-blend-screen"></div>
        <div className="container mx-auto text-center py-20 lg:py-32 px-4 relative">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Find Politicians In Your Area
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
            Discover who represents you and get information on over 14 million public officials worldwide.
          </p>
          <div className="flex justify-center mb-8 -space-x-4">
            {politicians.slice(0, 4).map((p) => (
              <Image
                key={p.id}
                src={p.photoUrl}
                alt={p.name}
                width={48}
                height={48}
                className="rounded-full border-2 border-primary-foreground/80"
                data-ai-hint="politician photo"
              />
            ))}
          </div>
          <div
            className="max-w-2xl mx-auto relative"
          >
            <div className="bg-white rounded-lg p-2 shadow-lg">
              <form className="flex gap-2" onSubmit={handleSearch}>
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Politician name or role"
                    className="w-full pl-10 border-none focus:ring-0 text-gray-900"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">
                  Search
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-background border-b">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-gray-500 font-semibold">
            <span>Capitol Hill</span>
            <span>StateGov</span>
            <span>GovTrack</span>
            <span>USA.gov</span>
            <span>OpenSecrets</span>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Trending Profiles</h2>
            <Link
              href="#"
              className="flex items-center gap-2 text-primary font-semibold"
            >
              See all profiles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProfiles.map((p) => (
               <Card key={p.id} className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                 <CardContent className="p-6">
                   <div className="flex items-center gap-4 mb-4">
                     <Image
                        src={p.photoUrl}
                        alt={p.name}
                        width={64}
                        height={64}
                        className="rounded-full"
                        data-ai-hint="politician photo"
                      />
                      <div>
                        <h3 className="font-bold text-lg">{p.currentPosition}</h3>
                        <p className="text-sm text-muted-foreground">{p.constituency}</p>
                      </div>
                   </div>
                   <div className="flex justify-between items-center bg-green-50 p-4 rounded-md">
                     <span className="text-green-700 font-bold text-lg">$197,300</span>
                     <span className="text-sm text-gray-500">Avg. salary</span>
                   </div>
                 </CardContent>
               </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <Card className="p-8 lg:p-12 border-none shadow-none bg-muted/50">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="lg:w-1/2">
                <span className="text-primary font-semibold mb-2 block text-sm">
                  POPULAR SEARCHES
                </span>
                <h2 className="text-3xl font-bold mb-4">
                  Explore Suggested Searches
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Find your next representative by exploring popular roles and positions. We've compiled a list of common searches to get you started.
                </p>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex flex-wrap gap-3">
                    {suggestedSearches.map((term) => (
                      <Button
                        key={term}
                        variant="outline"
                        className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                        onClick={() => handleSuggestedSearch(term)}
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="p-8 lg:p-12 border-none bg-transparent shadow-none">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <Quote className="text-primary w-8 h-8 mb-4 transform -scale-x-100" />
                <p className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed">
                  Our platform is so easy to use. We've been able to connect with dozens of representatives in the past year.
                </p>
                <div className="mt-6">
                  <p className="font-semibold">Lubaek Ildiko</p>
                  <p className="text-sm text-muted-foreground">
                    CEO at Example Inc.
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Image
                  src="https://picsum.photos/seed/lubaek/150/150"
                  alt="Lubaek Ildiko"
                  width={150}
                  height={150}
                  className="rounded-full"
                  data-ai-hint="person illustration"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="pb-16 pt-8">
        <div className="container mx-auto px-4">
            <div className="bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground rounded-lg p-8 lg:p-12">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                <div>
                  <h2 className="text-3xl font-bold">Ready to Get Involved?</h2>
                  <p className="max-w-xl opacity-90 mt-2">
                    Contribute to our platform and help us keep the directory accurate and up-to-date for everyone.
                  </p>
                </div>
                <Link href="#" passHref>
                  <Button
                    size="lg"
                    className="bg-white hover:bg-gray-100 text-primary flex-shrink-0"
                  >
                    Contribute Now
                  </Button>
                </Link>
              </div>
            </div>
        </div>
      </section>
    </div>
  );
}
