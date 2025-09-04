import { supabase } from './supabase';
import { createClient } from './supabase-server';

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
 * Server-side auth check with proper error handling
 */
export async function getServerUser(): Promise<AuthResult> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    return {
      user,
      session: null,
      error
    };
  } catch (error) {
    console.error('Server auth error:', error);
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
