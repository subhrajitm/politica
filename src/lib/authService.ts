import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthUser extends User {
  // Add any custom user properties here if needed
}

export interface AuthState {
  user: AuthUser | null
  session: Session | null
  loading: boolean
}

export class AuthService {
  static async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  static async signInWithGoogle() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
    const redirectTo = siteUrl ? `${siteUrl}/auth/callback` : undefined

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })
    return { data, error }
  }

  static async signInWithGoogleIdToken(token: string, nonce?: string) {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token,
      nonce,
    })
    return { data, error }
  }

  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      return { user, error }
    } catch (error) {
      console.error('Error getting current user:', error)
      return { user: null, error }
    }
  }

  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      return { session, error }
    } catch (error) {
      console.error('Error getting current session:', error)
      return { session: null, error }
    }
  }

  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  // Forgot password
  static async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/reset-password`,
    })
    return { data, error }
  }

  // Update password
  static async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    return { data, error }
  }

  // Resend email confirmation
  static async resendConfirmation(email: string) {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
      }
    })
    return { data, error }
  }

  // Verify OTP for email
  static async verifyEmailOtp(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    })
    return { data, error }
  }

  // Verify OTP for phone
  static async verifyPhoneOtp(phone: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    })
    return { data, error }
  }

  // Sign in with magic link
  static async signInWithMagicLink(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
      }
    })
    return { data, error }
  }
}
