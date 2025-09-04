
import Link from 'next/link';
import { Search, Menu, LayoutDashboard, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { LogoIcon } from '@/lib/icons';
import { useSettings } from '@/hooks/use-settings';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './auth/AuthModal';
import UserMenu from './auth/UserMenu';
import { useState } from 'react';

export default function Header() {
  const { siteName } = useSettings();
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  const navLinks = [
    { name: 'Find Politicians', href: '/politicians' },
    { name: 'Browse by Role', href: '/browse' },
    { name: 'Browse by Country', href: '/browse/countries' },
    { name: 'Browse by Map', href: '/browse/map' },
  ];

  return (
    <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <LogoIcon className="h-5 w-5 text-primary" />
            {siteName || 'PolitiFind'}
          </Link>

          <nav className="hidden lg:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-xs font-medium text-gray-600 hover:text-primary">
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-1">
             <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <Link href="/admin/dashboard">
                <LayoutDashboard className="h-4 w-4 text-gray-600" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Search className="h-4 w-4 text-gray-600" />
            </Button>
            {user ? (
              <UserMenu />
            ) : (
              <Button 
                size="sm" 
                className="h-8"
                onClick={() => setAuthModalOpen(true)}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
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
                      {siteName || 'PolitiFind'}
                    </Link>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-4">
                  {navLinks.map((link) => (
                    <Link key={link.name} href={link.href} className="text-base font-medium text-gray-600 hover:text-primary">
                      {link.name}
                    </Link>
                  ))}
                   <Link href="/admin/dashboard" className="text-base font-medium text-gray-600 hover:text-primary">
                    Dashboard
                  </Link>
                                     <Link href="/contact" className="text-base font-medium text-gray-600 hover:text-primary">
                    Contact
                  </Link>
                  {user ? (
                    <div className="mt-4">
                      <div className="text-sm text-muted-foreground mb-2">
                        Signed in as {user.email}
                      </div>
                      <UserMenu />
                    </div>
                  ) : (
                    <Button 
                      className="w-full mt-4"
                      onClick={() => setAuthModalOpen(true)}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  )}
                   <Button className="w-full mt-2">
                    Contribute
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        defaultMode="login"
      />
    </header>
  );
}
