import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  created_at: string;
  last_login?: string;
}

export interface LoginResponse {
  user: AdminUser;
  session: any;
}

export class AdminAuthService {
  // You can add specific admin emails here, or we can check the admin_profiles table
  private static readonly ADMIN_EMAILS = [
    'admin@ournation.com',
    'superadmin@ournation.com',
    // Add more admin emails as needed
  ];

  static async login(email: string, password: string): Promise<LoginResponse> {
    // Use Supabase Auth for login first
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password,
    });

    if (error) {
      throw new Error(error.message || 'Login failed');
    }

    if (!data.user) {
      throw new Error('Login failed - no user returned');
    }

    // Check if user is an admin (either in hardcoded list or in admin_profiles table)
    const isAdmin = await this.isUserAdmin(data.user);
    if (!isAdmin) {
      // Sign out the user since they're not an admin
      await supabase.auth.signOut();
      throw new Error('Access denied. Admin privileges required.');
    }

    // Get or create admin user profile
    const adminUser = await this.getOrCreateAdminUser(data.user);

    return {
      user: adminUser,
      session: data.session,
    };
  }

  private static async isUserAdmin(user: User): Promise<boolean> {
    // First check if email is in hardcoded admin list
    if (this.ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
      console.log('AdminAuthService: User is in hardcoded admin list');
      return true;
    }

    // Then check if user exists in admin_profiles table
    try {
      console.log('AdminAuthService: Checking admin_profiles table...');
      const { data: adminProfile, error } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log('AdminAuthService: Error checking admin_profiles:', error.message);
        // If table doesn't exist or other error, fall back to hardcoded list only
        return false;
      }

      const isAdmin = !!adminProfile;
      console.log('AdminAuthService: Admin check result:', isAdmin);
      return isAdmin;
    } catch (error) {
      console.error('AdminAuthService: Error checking admin status:', error);
      return false;
    }
  }

  private static async getOrCreateAdminUser(supabaseUser: User): Promise<AdminUser> {
    try {
      console.log('AdminAuthService: Getting or creating admin user...');
      
      // Try to get existing admin user from database
      const { data: existingUser, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (existingUser && !error) {
        console.log('AdminAuthService: Found existing admin user');
        return {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          created_at: existingUser.created_at,
          last_login: existingUser.last_login,
        };
      }

      console.log('AdminAuthService: Creating new admin user...');
      
      // Create new admin user if doesn't exist
      const newUser = {
        id: supabaseUser.id,
        email: supabaseUser.email?.toLowerCase() || '',
        name: supabaseUser.email?.split('@')[0] || 'Admin',
        role: supabaseUser.email?.toLowerCase() === 'superadmin@ournation.com' ? 'super_admin' : 'admin',
      };

      const { data: createdUser, error: createError } = await supabase
        .from('admin_profiles')
        .insert([newUser])
        .select()
        .single();

      if (createError) {
        console.error('AdminAuthService: Error creating admin user:', createError);
        // Fallback to in-memory user if database fails
        return {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.email?.split('@')[0] || 'Admin',
          role: supabaseUser.email?.toLowerCase() === 'superadmin@ournation.com' ? 'super_admin' : 'admin',
          created_at: new Date().toISOString(),
        };
      }

      console.log('AdminAuthService: Successfully created admin user');
      return {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role,
        created_at: createdUser.created_at,
      };
    } catch (error) {
      console.error('AdminAuthService: Error in getOrCreateAdminUser:', error);
      // Fallback to in-memory user if database fails
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.email?.split('@')[0] || 'Admin',
        role: supabaseUser.email?.toLowerCase() === 'superadmin@ournation.com' ? 'super_admin' : 'admin',
        created_at: new Date().toISOString(),
      };
    }
  }

  private static async updateLastLogin(userId: string): Promise<void> {
    try {
      await supabase
        .from('admin_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw error for this non-critical operation
    }
  }

  static async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during logout:', error);
    }
  }

  static async getCurrentUser(): Promise<AdminUser | null> {
    try {
      console.log('AdminAuthService: Getting current user...');
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('AdminAuthService: Not in browser environment, skipping auth check');
        return null;
      }
      
      // Get session and user in parallel
      const [sessionResult, userResult] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getUser()
      ]);
      
      const { data: { session }, error: sessionError } = sessionResult;
      const { data: { user }, error: userError } = userResult;
      
      if (sessionError || userError) {
        console.error('AdminAuthService: Error getting session/user:', sessionError || userError);
        return null;
      }
      
      if (!session || !user) {
        console.log('AdminAuthService: No session or user found');
        return null;
      }

      console.log('AdminAuthService: User found:', user.email);

      // Check if user is an admin (optimized check)
      const isAdmin = await this.isUserAdmin(user);
      if (!isAdmin) {
        console.log('AdminAuthService: User is not an admin');
        return null;
      }

      console.log('AdminAuthService: User is admin, getting profile...');

      // Get admin user profile with timeout
      const profilePromise = supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
      });

      try {
        const { data: adminUser, error: adminError } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as any;

        if (adminError) {
          console.log('AdminAuthService: No admin profile found, creating one...', adminError.message);
          // If no admin profile exists, create one
          return await this.getOrCreateAdminUser(user);
        }

        if (!adminUser) {
          console.log('AdminAuthService: Admin profile is null, creating one...');
          return await this.getOrCreateAdminUser(user);
        }

        console.log('AdminAuthService: Admin profile found:', adminUser.email);

        return {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          created_at: adminUser.created_at,
          last_login: adminUser.last_login,
        };
      } catch (profileError) {
        console.log('AdminAuthService: Profile fetch failed, creating one...', profileError);
        return await this.getOrCreateAdminUser(user);
      }
    } catch (error) {
      console.error('AdminAuthService: Error getting current user:', error);
      return null;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  static async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  }

  static onAuthStateChange(callback: (user: AdminUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const adminUser = await this.getCurrentUser();
        callback(adminUser);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    });
  }
}
