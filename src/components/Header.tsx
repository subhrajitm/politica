
import Link from 'next/link';
import { Search, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { LogoIcon } from '@/lib/icons';

export default function Header() {
  const navLinks = [
    { name: 'Find Politicians', href: '/politicians' },
    { name: 'Browse by Role', href: '/browse' },
    { name: 'Browse by State', href: '/browse/states' },
    { name: 'Browse by Map', href: '/browse/map' },
    { name: 'Blog', href: '#' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <LogoIcon className="h-5 w-5 text-primary" />
            PolitiFind
          </Link>

          <nav className="hidden lg:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-xs font-medium text-gray-600 hover:text-primary">
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Search className="h-4 w-4 text-gray-600" />
            </Button>
            <Button size="sm" className="h-8">
              Contribute
            </Button>
          </div>

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader className="text-left">
                   <SheetTitle className="sr-only">Menu</SheetTitle>
                   <SheetDescription className="sr-only">Main navigation menu</SheetDescription>
                   <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-4">
                      <LogoIcon className="h-6 w-6 text-primary" />
                      PolitiFind
                    </Link>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-4">
                  {navLinks.map((link) => (
                    <Link key={link.name} href={link.href} className="text-base font-medium text-gray-600 hover:text-primary">
                      {link.name}
                    </Link>
                  ))}
                   <Button className="w-full mt-4">
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
