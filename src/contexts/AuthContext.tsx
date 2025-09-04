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
  signOut: () => Promise<{ error: any }>
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

    let isMounted = true

    // Get initial session with timeout
    const initAuth = async () => {
      try {
        const { session, error } = await AuthService.getCurrentSession()
        
        if (!isMounted) return

        if (error) {
          console.error('Error getting session:', error)
          // Don't set user/session on error, but still stop loading
        } else {
          setSession(session)
          setUser(session?.user as AuthUser || null)
        }
        setLoading(false)
      } catch (error) {
        if (!isMounted) return
        console.error('Error in getCurrentSession:', error)
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes with error handling
    let subscription: any = null
    try {
      const { data: { subscription: authSubscription } } = AuthService.onAuthStateChange((event, session) => {
        if (!isMounted) return
        
        console.log('Auth state change:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user as AuthUser || null)
        setLoading(false)
      })
      subscription = authSubscription
    } catch (error) {
      console.error('Error setting up auth state change listener:', error)
      setLoading(false)
    }

    return () => {
      isMounted = false
      subscription?.unsubscribe()
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

  const signOut = async () => {
    return await AuthService.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGoogleIdToken,
    signOut,
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
