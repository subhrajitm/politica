/**
 * Mobile Navigation Component with touch gestures
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  Heart, 
  Map, 
  User, 
  Menu, 
  X,
  ChevronLeft,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useIsMobile, useDeviceType } from '@/hooks/use-mobile';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { useAuth } from '@/contexts/AuthContext';
import { useFavourites } from '@/contexts/FavouritesContext';

const navigationItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/browse', label: 'Browse', icon: Search },
  { href: '/browse/map', label: 'Map', icon: Map },
  { href: '/favourites', label: 'Favourites', icon: Heart },
];

export function MobileNavigation() {
  const isMobile = useIsMobile();
  const deviceType = useDeviceType();
  const pathname = usePathname();
  const { user } = useAuth();
  const { favourites } = useFavourites();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Don't render on desktop or admin pages
  if (!isMobile || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.href === '/favourites' && favourites.length > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                    >
                      {favourites.length > 9 ? '9+' : favourites.length}
                    </Badge>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Menu Button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex flex-col items-center justify-center p-2 rounded-lg"
              >
                <Menu className="h-5 w-5" />
                <span className="text-xs mt-1 font-medium">Menu</span>
              </Button>
            </SheetTrigger>
            <MobileMenu onClose={() => setIsMenuOpen(false)} />
          </Sheet>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="h-20" />
    </>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const menuRef = useTouchGestures({
    onSwipeRight: onClose,
  });

  const menuItems = [
    ...(user ? [
      { href: '/profile', label: 'Profile', icon: User },
      { href: '/settings', label: 'Settings', icon: Settings },
    ] : []),
    { href: '/contact', label: 'Contact', icon: null },
    { href: '/contribute', label: 'Contribute', icon: null },
  ];

  return (
    <SheetContent 
      ref={menuRef}
      side="right" 
      className="w-80 p-0"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* User Section */}
        {user && (
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-sm">{user.email}</div>
                <div className="text-xs text-gray-500">Signed in</div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="flex-1 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {Icon && <Icon className="h-5 w-5" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          {user ? (
            <Button
              variant="outline"
              onClick={() => {
                signOut();
                onClose();
              }}
              className="w-full"
            >
              Sign Out
            </Button>
          ) : (
            <div className="space-y-2">
              <Link href="/auth/login" onClick={onClose}>
                <Button className="w-full">Sign In</Button>
              </Link>
              <Link href="/auth/register" onClick={onClose}>
                <Button variant="outline" className="w-full">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </SheetContent>
  );
}

export function MobileHeader({ 
  title, 
  showBack = false, 
  onBack,
  actions 
}: {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 safe-area-pt">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}