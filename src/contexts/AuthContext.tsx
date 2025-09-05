'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService, type AuthUser } from '@/lib/authService'
import type { Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signInWithGoogle: () => Promise<{ data: any; error: any }>
  signInWithGoogleIdToken: (token: string, nonce?: string) => Promise<{ data: any; error: any }>
  signInWithMagicLink: (email: string) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ data: any; error: any }>
  updatePassword: (newPassword: string) => Promise<{ data: any; error: any }>
  resendConfirmation: (email: string) => Promise<{ data: any; error: any }>
  verifyEmailOtp: (email: string, token: string) => Promise<{ data: any; error: any }>
  verifyPhoneOtp: (phone: string, token: string) => Promise<{ data: any; error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run auth checks in browser environment
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    // Get initial session
    AuthService.getCurrentSession().then(({ session, error }) => {
      if (error) {
        console.error('Error getting session:', error)
      } else {
        setSession(session)
        setUser(session?.user as AuthUser || null)
      }
      setLoading(false)
    }).catch((error) => {
      console.error('Error in getCurrentSession:', error)
      setLoading(false)
    })

    // Listen for auth changes
    try {
      const { data: { subscription } } = AuthService.onAuthStateChange((event, session) => {
        setSession(session)
        setUser(session?.user as AuthUser || null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Error setting up auth state change listener:', error)
      setLoading(false)
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    return await AuthService.signUp(email, password)
  }

  const signIn = async (email: string, password: string) => {
    return await AuthService.signIn(email, password)
  }

  const signInWithGoogle = async () => {
    return await AuthService.signInWithGoogle()
  }

  const signInWithGoogleIdToken = async (token: string, nonce?: string) => {
    return await AuthService.signInWithGoogleIdToken(token, nonce)
  }

  const signInWithMagicLink = async (email: string) => {
    return await AuthService.signInWithMagicLink(email)
  }

  const signOut = async () => {
    return await AuthService.signOut()
  }

  const resetPassword = async (email: string) => {
    return await AuthService.resetPassword(email)
  }

  const updatePassword = async (newPassword: string) => {
    return await AuthService.updatePassword(newPassword)
  }

  const resendConfirmation = async (email: string) => {
    return await AuthService.resendConfirmation(email)
  }

  const verifyEmailOtp = async (email: string, token: string) => {
    return await AuthService.verifyEmailOtp(email, token)
  }

  const verifyPhoneOtp = async (phone: string, token: string) => {
    return await AuthService.verifyPhoneOtp(phone, token)
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGoogleIdToken,
    signInWithMagicLink,
    signOut,
    resetPassword,
    updatePassword,
    resendConfirmation,
    verifyEmailOtp,
    verifyPhoneOtp,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
