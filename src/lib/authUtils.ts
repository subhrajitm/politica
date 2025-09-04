import { supabase } from './supabase';

/**
 * Utility functions for handling authentication across client and server
 */

export interface AuthResult {
  user: any | null;
  session: any | null;
  error: any | null;
}

/**
 * Get current user with proper error handling and timeout
 */
export async function getCurrentUserWithTimeout(timeoutMs: number = 5000): Promise<AuthResult> {
  try {
    const authPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise<AuthResult>((_, reject) => {
      setTimeout(() => reject(new Error('Auth timeout')), timeoutMs);
    });

    const { data: { user }, error } = await Promise.race([authPromise, timeoutPromise]);
    
    return {
      user,
      session: null,
      error
    };
  } catch (error) {
    console.error('Auth timeout or error:', error);
    return {
      user: null,
      session: null,
      error
    };
  }
}

/**
 * Get current session with proper error handling and timeout
 */
export async function getCurrentSessionWithTimeout(timeoutMs: number = 5000): Promise<AuthResult> {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return {
        user: null,
        session: null,
        error: new Error('Not in browser environment')
      };
    }

    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise<AuthResult>((_, reject) => {
      setTimeout(() => reject(new Error('Session timeout')), timeoutMs);
    });

    const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
    
    return {
      user: session?.user || null,
      session,
      error
    };
  } catch (error) {
    console.error('Session timeout or error:', error);
    return {
      user: null,
      session: null,
      error
    };
  }
}

/**
 * Safely initialize auth session with proper error handling
 */
export async function initializeAuthSession(): Promise<AuthResult> {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return {
        user: null,
        session: null,
        error: new Error('Not in browser environment')
      };
    }

    // First try to get existing session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return {
        user: null,
        session: null,
        error: sessionError
      };
    }

    // If no session, try to get user (this might trigger session refresh)
    if (!session) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('User error:', userError);
        return {
          user: null,
          session: null,
          error: userError
        };
      }

      return {
        user,
        session: null,
        error: null
      };
    }

    return {
      user: session.user,
      session,
      error: null
    };
  } catch (error) {
    console.error('Auth initialization error:', error);
    return {
      user: null,
      session: null,
      error
    };
  }
}


/**
 * Check if user is admin with timeout
 */
export async function isUserAdminWithTimeout(user: any, timeoutMs: number = 5000): Promise<boolean> {
  try {
    const adminEmails = ['admin@politifind.com', 'superadmin@politifind.com'];
    
    // Check hardcoded emails first (fast)
    if (adminEmails.includes(user.email?.toLowerCase() || '')) {
      return true;
    }

    // Check database with timeout
    const dbCheckPromise = supabase
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    const timeoutPromise = new Promise<any>((_, reject) => {
      setTimeout(() => reject(new Error('Admin check timeout')), timeoutMs);
    });

    const { data, error } = await Promise.race([dbCheckPromise, timeoutPromise]);
    
    return !error && !!data;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

/**
 * Debounced auth state change handler to prevent multiple rapid calls
 */
export function createDebouncedAuthHandler(
  callback: (user: any, session: any) => void,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout;
  
  return (event: string, session: any) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(session?.user || null, session);
    }, delay);
  };
}

/**
 * Clear auth session and reset to clean state
 */
export async function clearAuthSession(): Promise<void> {
  try {
    if (typeof window === 'undefined') return;
    
    // Clear localStorage auth tokens
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('supabase') || key.includes('auth') || key.includes('politica-auth')
    );
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear sessionStorage auth tokens
    const sessionAuthKeys = Object.keys(sessionStorage).filter(key => 
      key.includes('supabase') || key.includes('auth') || key.includes('politica-auth')
    );
    
    sessionAuthKeys.forEach(key => {
      sessionStorage.removeItem(key);
    });
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    console.log('Auth session cleared successfully');
  } catch (error) {
    console.error('Error clearing auth session:', error);
  }
}

/**
 * Recover from auth session errors by clearing and reinitializing
 */
export async function recoverFromAuthError(): Promise<AuthResult> {
  try {
    console.log('Attempting to recover from auth error...');
    
    // Clear corrupted session
    await clearAuthSession();
    
    // Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try to reinitialize
    return await initializeAuthSession();
  } catch (error) {
    console.error('Error during auth recovery:', error);
    return {
      user: null,
      session: null,
      error
    };
  }
}
