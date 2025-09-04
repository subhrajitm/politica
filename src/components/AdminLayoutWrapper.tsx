'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import AdminProtectedRoute from './AdminProtectedRoute';

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isLoginRoute = pathname === '/admin/login';

  if (isAdminRoute) {
    if (isLoginRoute) {
      // Don't render header/footer for login page
      return <>{children}</>;
    }
    
    // Protect all other admin routes
    return (
      <AdminProtectedRoute>
        {children}
      </AdminProtectedRoute>
    );
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
