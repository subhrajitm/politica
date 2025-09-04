'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminAuthService, AdminUser } from '@/lib/adminAuthService';
import { debugLoadingState } from '@/lib/loadingDebug';

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
    let forceLoadingTimeout: NodeJS.Timeout;
    
    const checkAuth = async () => {
      try {
        console.log('AdminProtectedRoute: Starting auth check...');
        
        // Add timeout to prevent infinite loading
        const authPromise = AdminAuthService.getCurrentUser();
        const timeoutPromise = new Promise<null>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Auth check timeout')), 8000); // Reduced to 8 seconds
        });
        
        const currentUser = await Promise.race([authPromise, timeoutPromise]);
        
        if (!isMounted) return;
        
        console.log('AdminProtectedRoute: Auth check result:', currentUser);
        
        setUser(currentUser);
        debugLoadingState('AdminProtectedRoute', false, 'Auth check completed');
        
        if (!currentUser) {
          console.log('AdminProtectedRoute: No user found, redirecting to login');
          router.push('/admin/login');
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error('AdminProtectedRoute: Auth check error:', error);
        setUser(null);
        debugLoadingState('AdminProtectedRoute', false, 'Auth check failed');
        router.push('/admin/login');
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setLoading(false);
          debugLoadingState('AdminProtectedRoute', false, 'Finally block');
        }
      }
    };

    checkAuth();

    // Force loading to false after 15 seconds as a safety net
    forceLoadingTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('AdminProtectedRoute: Force setting loading to false after 15 seconds');
        setLoading(false);
        debugLoadingState('AdminProtectedRoute', false, 'Force timeout');
      }
    }, 15000);

    // Listen for auth state changes with debouncing
    let authStateTimeout: NodeJS.Timeout;
    const { data: { subscription } } = AdminAuthService.onAuthStateChange((user) => {
      if (!isMounted) return;
      
      console.log('AdminProtectedRoute: Auth state changed:', user);
      
      // Debounce auth state changes to prevent rapid updates
      clearTimeout(authStateTimeout);
      authStateTimeout = setTimeout(() => {
        if (!isMounted) return;
        
        setUser(user);
        setLoading(false); // Ensure loading is set to false on auth state change
        debugLoadingState('AdminProtectedRoute', false, 'Auth state change');
        
        if (!user) {
          router.push('/admin/login');
        }
      }, 100);
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      clearTimeout(authStateTimeout);
      clearTimeout(forceLoadingTimeout);
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

  return <>{children}</>;
}
