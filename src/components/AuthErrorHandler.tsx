'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { recoverFromAuthError, clearAuthSession } from '@/lib/authUtils';

interface AuthErrorHandlerProps {
  children: React.ReactNode;
}

export default function AuthErrorHandler({ children }: AuthErrorHandlerProps) {
  const router = useRouter();

  useEffect(() => {
    // Global error handler for auth session errors
    const handleAuthError = (event: ErrorEvent) => {
      const error = event.error;
      
      // Check if it's an auth session error
      if (error?.message?.includes('AuthSessionMissingError') || 
          error?.message?.includes('Auth session missing') ||
          error?.name === 'AuthSessionMissingError') {
        
        console.error('Detected auth session error:', error);
        
        // Prevent the error from propagating
        event.preventDefault();
        
        // Show user-friendly message
        const shouldRecover = window.confirm(
          'Authentication session error detected. Would you like to clear your session and try again?'
        );
        
        if (shouldRecover) {
          // Clear session and redirect to home
          clearAuthSession().then(() => {
            router.push('/');
            window.location.reload();
          });
        }
      }
    };

    // Add global error listener
    window.addEventListener('error', handleAuthError);
    
    // Also listen for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      if (error?.message?.includes('AuthSessionMissingError') || 
          error?.message?.includes('Auth session missing') ||
          error?.name === 'AuthSessionMissingError') {
        
        console.error('Detected auth session promise rejection:', error);
        event.preventDefault();
        
        const shouldRecover = window.confirm(
          'Authentication session error detected. Would you like to clear your session and try again?'
        );
        
        if (shouldRecover) {
          clearAuthSession().then(() => {
            router.push('/');
            window.location.reload();
          });
        }
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleAuthError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [router]);

  return <>{children}</>;
}
