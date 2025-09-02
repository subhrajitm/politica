'use client';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { politicians } from '@/lib/data';
import { ArrowRight, Search, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import PoliticianCard from '@/components/PoliticianCard';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const trendingProfiles = politicians.slice(0, 3);

  const teamMembers = [
    {
      name: 'Tamas Bunce',
      role: 'Communication Manager',
      avatar: 'https://picsum.photos/seed/tamas/100/100',
    },
    {
      name: 'Benedikt Safiyulin',
      role: 'Senior Data Analyst',
      avatar: 'https://picsum.photos/seed/benedikt/100/100',
    },
    {
      name: 'Luis Calvillo',
      role: 'Researcher Assistant',
      avatar: 'https://picsum.photos/seed/luis/100/100',
    },
  ];

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
    'Coach',
    'Financial Advisor',
    'Customer Operator',
    'Data Analyst',
    'Dispatcher',
  ];
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/politicians?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/politicians');
    }
  };

  const handleSuggestedSearch = (term: string) => {
     router.push(`/politicians?q=${encodeURIComponent(term)}`);
  }

  return (
    <div className="flex flex-col min-h-full">
      <section className="bg-primary text-primary-foreground py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Find politicians in your area
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
            When you're searching for information about politicians, we've got
            you covered. Find out who represents you.
          </p>
          <div className="flex justify-center mb-8 -space-x-4">
            {politicians.slice(0, 4).map((p) => (
              <Image
                key={p.id}
                src={p.photoUrl}
                alt={p.name}
                width={48}
                height={48}
                className="rounded-full border-2 border-primary-foreground"
                data-ai-hint="politician photo"
              />
            ))}
          </div>
          <div className="max-w-2xl mx-auto bg-white rounded-lg p-2 shadow-lg">
            <form className="flex gap-2" onSubmit={handleSearch}>
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Politician name or role"
                  className="w-full pl-10 border-none focus:ring-0 text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit" className="bg-gray-800 hover:bg-gray-900">
                Search
              </Button>
            </form>
          </div>
          <p className="text-sm mt-4 opacity-80">
            Search for politicians across India
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex justify-center items-center gap-8 text-gray-500 font-semibold">
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
              href="/politicians"
              className="flex items-center gap-2 text-primary font-semibold"
            >
              See all profiles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingProfiles.map((p) => (
               <PoliticianCard key={p.id} politician={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="lg:w-1/2">
              <span className="text-primary font-semibold mb-2 block">
                Recommended Searches
              </span>
              <h2 className="text-3xl font-bold mb-4">
                Explore suggested politician searches
              </h2>
              <p className="text-muted-foreground max-w-md">
                Along with conventional portals and below the line activities,
                organizations and corporate bodies have come to realize that
                they need to invest.
              </p>
            </div>
            <div className="lg:w-1/2 bg-primary text-primary-foreground p-8 rounded-lg">
              <div className="flex flex-wrap gap-3">
                {suggestedSearches.map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    className="bg-white/20 border-white/50 text-white hover:bg-white/30"
                    onClick={() => handleSuggestedSearch(term)}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Team members</h2>
            <Link
              href="#"
              className="flex items-center gap-2 text-primary font-semibold"
            >
              Learn more <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.name} className="p-6 text-center">
                <CardContent className="p-0">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    width={80}
                    height={80}
                    className="rounded-full mx-auto mb-4"
                    data-ai-hint="person photo"
                  />
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {member.role}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
            <Card className="p-8 lg:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <Quote className="text-primary w-8 h-8 mb-4" />
                  <p className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed">
                    Our platform is so easy to use. We've hired about 40-50 different people worldwide in the past two years.
                  </p>
                  <div className="mt-4">
                    <p className="font-semibold">Lubaek Ildiko</p>
                    <p className="text-sm text-muted-foreground">CEO at Example Inc.</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Image src="https://picsum.photos/seed/ceo/120/120" alt="Lubaek Ildiko" width={120} height={120} className="rounded-full" data-ai-hint="person photo" />
                </div>
              </div>
            </Card>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-3xl font-bold">Stay Informed</h2>
              <p className="max-w-xl opacity-90 mt-2">Explore the profiles of political leaders and learn more about their work and contributions to public service.</p>
            </div>
            <Link href="/politicians" passHref>
              <Button size="lg" className="bg-gray-800 hover:bg-gray-900 text-white flex-shrink-0">Explore More Profiles</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
