
import Link from 'next/link';
import { Menu, LayoutDashboard, LogIn, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { useSettings } from '@/hooks/use-settings';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './auth/AuthModal';
import UserMenu from './auth/UserMenu';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { siteName } = useSettings();
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const router = useRouter();

  const handleAdminClick = () => {
    if (user) {
      router.push('/admin/dashboard');
    } else {
      setAuthModalOpen(true);
    }
  };
  
  const navLinks = [
    { name: 'Find Politicians', href: '/politicians' },
    { name: 'Political Parties', href: '/parties' },
    { name: 'Browse by Country', href: '/browse/countries' },
    { name: 'Browse by Map', href: '/browse/map' },
  ];

  const userNavLinks = [
    { name: 'My Favourites', href: '/favourites', icon: Heart },
  ];

  return (
    <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-lg font-bold text-gray-800">
            ournation.co
          </Link>

          <nav className="hidden lg:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-xs font-medium text-gray-600 hover:text-primary">
                {link.name}
              </Link>
            ))}
            {!loading && user && userNavLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-xs font-medium text-gray-600 hover:text-primary flex items-center gap-1">
                <link.icon className="w-3 h-3" />
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-1">
             <button 
               className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
               onClick={handleAdminClick}
               title={!loading && user ? "Admin Dashboard" : "Sign in to access admin"}
             >
                <LayoutDashboard className="h-4 w-4 text-gray-600" />
            </button>
            {!loading && user ? (
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
            <Button size="sm" className="h-8" asChild>
              <Link href="/contribute">Contribute</Link>
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
                   <Link href="/" className="text-xl font-bold text-gray-800 mb-4">
                      ournation.co
                    </Link>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-4">
                  {navLinks.map((link) => (
                    <Link key={link.name} href={link.href} className="text-base font-medium text-gray-600 hover:text-primary">
                      {link.name}
                    </Link>
                  ))}
                  {!loading && user && userNavLinks.map((link) => (
                    <Link key={link.name} href={link.href} className="text-base font-medium text-gray-600 hover:text-primary flex items-center gap-2">
                      <link.icon className="w-4 h-4" />
                      {link.name}
                    </Link>
                  ))}
                   <button 
                     onClick={handleAdminClick}
                     className="text-base font-medium text-gray-600 hover:text-primary text-left"
                   >
                    Dashboard
                  </button>
                                     <Link href="/contact" className="text-base font-medium text-gray-600 hover:text-primary">
                    Contact
                  </Link>
                  {!loading && user ? (
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
                   <Button className="w-full mt-2" asChild>
                    <Link href="/contribute">Contribute</Link>
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
