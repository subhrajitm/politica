'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminAuthService, AdminUser } from '@/lib/adminAuthService';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AdminProtectedRoute({ 
  children, 
  fallback 
}: AdminProtectedRouteProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        console.log('AdminProtectedRoute: Starting auth check...');
        
        // Add timeout to prevent infinite loading
        const authPromise = AdminAuthService.getCurrentUser();
        const timeoutPromise = new Promise<null>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Auth check timeout')), 15000); // 15 second timeout
        });
        
        const currentUser = await Promise.race([authPromise, timeoutPromise]);
        console.log('AdminProtectedRoute: Auth check result:', currentUser);
        
        if (!isMounted) return;
        
        setUser(currentUser);
        
        if (!currentUser) {
          console.log('AdminProtectedRoute: No user found, redirecting to login');
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('AdminProtectedRoute: Auth check error:', error);
        
        if (!isMounted) return;
        
        setUser(null);
        
        // Handle different types of errors
        if (error instanceof Error) {
          if (error.message.includes('Auth check timeout')) {
            console.log('AdminProtectedRoute: Auth check timed out, redirecting to login');
          } else if (error.message.includes('Auth session missing')) {
            console.log('AdminProtectedRoute: Session missing, redirecting to login');
          } else {
            console.log('AdminProtectedRoute: Unexpected error, redirecting to login');
          }
        }
        
        router.push('/admin/login');
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = AdminAuthService.onAuthStateChange((user) => {
      console.log('AdminProtectedRoute: Auth state changed:', user);
      if (!isMounted) return;
      
      setUser(user);
      if (!user) {
        router.push('/admin/login');
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You need to be logged in to access this page.</p>
          <button
            onClick={() => router.push('/admin/login')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Only render children after authentication is confirmed
  return <>{children}</>;
}
