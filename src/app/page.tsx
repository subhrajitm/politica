'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import ImageWithPlaceholder from '@/components/ImageWithPlaceholder';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Politician } from '@/lib/types';
import { PoliticianService } from '@/lib/politicianService';
import { ArrowRight, Search, Quote, History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Politician[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Politician[]>([]);
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const trendingProfiles = politicians.slice(0, 12); // Show max 3 rows (4 columns × 3 rows = 12 profiles)

  const suggestedSearches = [
    'Prime Minister',
    'Chief Minister',
    'Minister of Defence',
    'Minister of Home Affairs',
    'Member of Parliament',
    'Lok Sabha',
    'Rajya Sabha',
    'Uttar Pradesh',
    'Maharashtra',
    'Odisha',
    'Kerala',
    'West Bengal',
  ];
  
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

  useEffect(() => {
    try {
      const viewedIds: string[] = JSON.parse(
        localStorage.getItem('recentlyViewed') || '[]'
      );
      if (viewedIds.length > 0 && politicians.length > 0) {
        const viewedPoliticians = politicians.filter((p) =>
          viewedIds.includes(p.id)
        );
        // Sort them in the order they were viewed
        const sorted = viewedIds
          .map((id) => viewedPoliticians.find((p) => p.id === id))
          .filter((p): p is Politician => !!p);
        setRecentlyViewed(sorted);
      }
    } catch (error) {
        console.error("Failed to parse recently viewed from localStorage", error);
        localStorage.removeItem('recentlyViewed');
    }
  }, [politicians]);

  useEffect(() => {
    if (searchTerm.trim().length > 1 && politicians.length > 0) {
      const filtered = politicians.filter(
        (p) =>
          p.name.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.positions.current.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.constituency.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, politicians]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchContainerRef]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/politicians?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSuggestedSearch = (term: string) => {
    router.push(`/politicians?q=${encodeURIComponent(term)}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="container mx-auto text-center py-16">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <section className="bg-gradient-to-br from-primary via-purple-600 to-indigo-600 text-primary-foreground relative">
        <div className="absolute inset-0 bg-repeat opacity-20 mix-blend-screen"></div>
        <div className="container mx-auto text-center py-16 lg:py-24 px-4 relative">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Who Speaks for You?
          </h1>
          <p className="text-lg max-w-3xl mx-auto mb-6">
          Navigate our all-inclusive directory to find the leaders responsible for representing you, wherever you are.
          </p>
          <div className="flex justify-center mb-6 -space-x-4">
            {politicians.slice(0, 5).map((p) => (
              <ImageWithPlaceholder
                key={p.id}
                src={p.photoUrl}
                alt={p.name.fullName}
                width={40}
                height={40}
                className="rounded-full border-2 border-primary-foreground/80"
                placeholder="user"
              />
            ))}
          </div>
          <div
            className="max-w-2xl mx-auto relative"
            ref={searchContainerRef}
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
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                >
                  Search
                </Button>
              </form>
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-10 text-left overflow-hidden">
                <ul>
                  {suggestions.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/politicians/${p.id}`}
                        className="flex items-center gap-4 p-3 hover:bg-gray-100"
                        onClick={() => setShowSuggestions(false)}
                      >
                        <ImageWithPlaceholder
                          src={p.photoUrl}
                          alt={p.name.fullName}
                          width={40}
                          height={40}
                          className="rounded-full"
                          placeholder="user"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {p.name.fullName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {p.positions.current.position}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-8 bg-background border-b">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 text-gray-500 text-sm font-semibold">
            <span>Parliament of India</span>
            <span>Election Commission</span>
            <span>MyNeta</span>
            <span>PRS India</span>
            <span>Data.gov.in</span>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Trending Profiles</h2>
            <Link
              href="/politicians"
              className="flex items-center gap-2 text-primary font-semibold text-sm"
            >
              See all profiles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:grid-rows-3">
            {trendingProfiles.map((p) => (
              <Link key={p.id} href={`/politicians/${p.id}`} className="block">
                <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                        <ImageWithPlaceholder
                          src={p.photoUrl}
                          alt={p.name.fullName}
                          fill
                          className="rounded-full"
                          placeholder="user"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-base">
                          {p.name.fullName}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {p.positions.current.position}
                        </p>
                      </div>
                    </div>
                     <div className="flex justify-between items-center bg-primary/10 p-2 rounded-md">
                      <span className="text-primary font-semibold text-xs">
                        {p.party}
                      </span>
                      <span className="text-xs text-gray-500">
                        {p.constituency.split(',')[1]}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {recentlyViewed.length > 0 && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <History className="w-6 h-6" />
              Recently Viewed
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:grid-rows-1">
              {recentlyViewed.slice(0, 4).map((p) => (
                <Link key={p.id} href={`/politicians/${p.id}`} className="block">
                  <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                          <ImageWithPlaceholder
                            src={p.photoUrl}
                            alt={p.name.fullName}
                            fill
                            className="rounded-full"
                            placeholder="user"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-base">
                            {p.name.fullName}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {p.positions.current.position}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center bg-primary/10 p-2 rounded-md">
                        <span className="text-primary font-semibold text-xs">
                          {p.party}
                        </span>
                        <span className="text-xs text-gray-500">
                          {p.constituency.split(',')[1]}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <Card className="p-6 lg:p-8 border-none shadow-none bg-muted/50">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="lg:w-1/2">
                <span className="text-primary font-semibold mb-2 block text-xs">
                  POPULAR SEARCHES
                </span>
                <h2 className="text-2xl font-bold mb-3">
                  Explore Suggested Searches
                </h2>
                <p className="text-muted-foreground text-sm max-w-md">
                  Find your next representative by exploring popular roles and
                  constituencies. We've compiled a list of common searches to get
                  you started.
                </p>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    {suggestedSearches.map((term) => (
                      <Button
                        key={term}
                        variant="outline"
                        size="sm"
                        className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 text-xs"
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

      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card className="p-6 lg:p-8 border-none bg-transparent shadow-none">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <Quote className="text-primary w-6 h-6 mb-3 transform -scale-x-100" />
                <p className="text-lg md:text-xl font-medium text-gray-800 leading-relaxed">
                  This platform is an invaluable resource for understanding the political landscape. It's incredibly easy to use and informative.
                </p>
                <div className="mt-4">
                  <p className="font-semibold text-sm">Priya Sharma</p>
                  <p className="text-xs text-muted-foreground">
                    Political Analyst
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <ImageWithPlaceholder
                  src="/user.png"
                  alt="Priya Sharma"
                  width={120}
                  height={120}
                  className="rounded-full"
                  placeholder="user"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="pb-12 pt-6">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground rounded-lg p-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
              <div>
                <h2 className="text-2xl font-bold">Ready to Get Involved?</h2>
                <p className="max-w-xl opacity-90 mt-2 text-sm">
                  Contribute to our platform and help us keep the directory
                  accurate and up-to-date for everyone.
                </p>
              </div>
              <Link href="/contribute" passHref>
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

    