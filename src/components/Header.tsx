import Link from 'next/link';
import { Search, ChevronDown, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export default function Header() {
  const navLinks = [
    { name: 'Find Politicians', href: '#' },
    { name: 'Our Team', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Contacts', href: '#' },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            PolitiFind
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-sm font-medium text-gray-600 hover:text-primary">
                {link.name}
              </Link>
            ))}
            <Link href="#" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary">
              All Pages <ChevronDown className="w-4 h-4" />
            </Link>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5 text-gray-600" />
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Contribute
            </Button>
          </div>

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-6 mt-8">
                   <Link href="/" className="text-2xl font-bold text-gray-800">
                      PolitiFind
                    </Link>
                  {navLinks.map((link) => (
                    <Link key={link.name} href={link.href} className="text-lg font-medium text-gray-600 hover:text-primary">
                      {link.name}
                    </Link>
                  ))}
                  <Link href="#" className="flex items-center gap-1 text-lg font-medium text-gray-600 hover:text-primary">
                    All Pages <ChevronDown className="w-5 h-5" />
                  </Link>
                   <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full mt-4">
                    Contribute
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
