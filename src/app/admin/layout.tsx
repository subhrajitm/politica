
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Settings, Home, Plus, LogOut, User } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { LogoIcon } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { AdminAuthService } from '@/lib/adminAuthService';
import { useToast } from '@/hooks/use-toast';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const checkUser = async () => {
      try {
        const user = await AdminAuthService.getCurrentUser();
        
        if (!isMounted) return;
        
        setCurrentUser(user);
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Auth check error:', error);
        setCurrentUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    checkUser();

    // Listen for auth state changes with debouncing
    let authStateTimeout: NodeJS.Timeout;
    const { data: { subscription } } = AdminAuthService.onAuthStateChange((user) => {
      if (!isMounted) return;
      
      // Debounce auth state changes to prevent rapid updates
      clearTimeout(authStateTimeout);
      authStateTimeout = setTimeout(() => {
        if (!isMounted) return;
        
        setCurrentUser(user);
        setLoading(false); // Ensure loading is set to false on auth state change
      }, 100);
    });

    return () => {
      isMounted = false;
      clearTimeout(authStateTimeout);
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await AdminAuthService.logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout properly",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/politicians', label: 'Politicians', icon: Users },
    { href: '/admin/politicians/bulk', label: 'Bulk Add', icon: Plus },
    { href: '/admin/user-management', label: 'User Management', icon: User },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // For login page, don't show sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If not authenticated, redirect to login (this should be handled by AdminProtectedRoute)
  if (!currentUser) {
    return <>{children}</>;
  }

  // Show full admin layout with sidebar for authenticated users
  return (
    <SidebarProvider key="admin-layout">
      <div className="absolute inset-0 flex h-screen bg-muted/40 w-full">
        <Sidebar collapsible="icon" className="hidden lg:block">
          <div className="flex flex-col h-full">
            <div className="h-14 flex items-center px-4 border-b">
               <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold">
                <LogoIcon className="h-6 w-6 text-primary" />
                <span className="group-data-[collapsible=icon]:hidden">Admin</span>
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarMenu className="p-2">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.href)}
                      tooltip={{children: item.label}}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <div className="h-4"></div>
              </SidebarMenu>
            </div>
            <div className="mt-auto p-2 border-t">
              <SidebarMenu>
                {currentUser && (
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip={{children: `Logged in as ${currentUser.email}`}}>
                      <User />
                      <span className="truncate">{currentUser.email}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={{children: 'Back to Site'}}>
                    <Link href="/">
                      <Home />
                       <span>Back to Site</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={handleLogout}
                    tooltip={{children: 'Logout'}}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </div>
        </Sidebar>
        <main className="flex-1 flex flex-col min-w-0 w-full overflow-y-auto h-full">
           {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
