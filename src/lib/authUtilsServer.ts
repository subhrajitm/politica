import { createClient } from './supabase-server';

/**
 * Server-side authentication utilities
 * These functions can only be used in server components or API routes
 */

export interface AuthResult {
  user: any | null;
  session: any | null;
  error: any | null;
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
 * Server-side session check with proper error handling
 */
export async function getServerSession(): Promise<AuthResult> {
  try {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    return {
      user: session?.user || null,
      session,
      error
    };
  } catch (error) {
    console.error('Server session error:', error);
    return {
      user: null,
      session: null,
      error
    };
  }
}
