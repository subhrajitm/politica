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
  const [authError, setAuthError] = useState<string | null>(null);
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
          timeoutId = setTimeout(() => reject(new Error('Auth check timeout')), 5000); // 5 second timeout
        });
        
        const currentUser = await Promise.race([authPromise, timeoutPromise]);
        console.log('AdminProtectedRoute: Auth check result:', currentUser);
        
        if (!isMounted) return;
        
        setUser(currentUser);
        setAuthError(null);
        
        if (!currentUser) {
          console.log('AdminProtectedRoute: No user found, redirecting to login');
          // Use replace instead of push to prevent back button issues
          router.replace('/admin/login');
        }
      } catch (error) {
        console.error('AdminProtectedRoute: Auth check error:', error);
        
        if (!isMounted) return;
        
        setUser(null);
        
        // Handle different types of errors
        if (error instanceof Error) {
          if (error.message.includes('Auth check timeout')) {
            console.log('AdminProtectedRoute: Auth check timed out, showing retry option');
            setAuthError('Authentication check timed out. Please try again.');
            return;
          } else if (error.message.includes('Auth session missing')) {
            console.log('AdminProtectedRoute: Session missing, redirecting to login');
            setAuthError(null);
          } else {
            console.log('AdminProtectedRoute: Unexpected error, redirecting to login');
            setAuthError(null);
          }
        }
        
        // Only redirect to login if it's not a timeout
        if (!error || !(error instanceof Error) || !error.message.includes('Auth check timeout')) {
          router.replace('/admin/login');
        }
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
      setAuthError(null);
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

  const retryAuth = () => {
    setLoading(true);
    setAuthError(null);
    // Re-run the auth check
    window.location.reload();
  };

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
          {authError ? (
            <>
              <p className="text-muted-foreground mb-4">{authError}</p>
              <div className="space-x-4">
                <button
                  onClick={retryAuth}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Retry
                </button>
                <button
                  onClick={() => router.replace('/admin/login')}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                >
                  Go to Login
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">You need to be logged in to access this page.</p>
              <button
                onClick={() => router.replace('/admin/login')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Go to Login
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Only render children after authentication is confirmed
  return <>{children}</>;
}
