
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, Home, Plus } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { LogoIcon } from '@/lib/icons';
import { Button } from '@/components/ui/button';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/politicians', label: 'Politicians', icon: Users },
    { href: '/admin/politicians/bulk', label: 'Bulk Add', icon: Plus },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

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
              </SidebarMenu>
            </div>
            <div className="mt-auto p-2 border-t">
              <SidebarMenu>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={{children: 'Back to Site'}}>
                    <Link href="/">
                      <Home />
                       <span>Back to Site</span>
                    </Link>
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
