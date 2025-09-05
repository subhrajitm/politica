'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const [isValidSession, setIsValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    // Check if user is authenticated and has a valid session
    if (!loading) {
      if (user) {
        setIsValidSession(true)
      } else {
        // Check if there are auth parameters in the URL (from email link)
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          // User came from email link, session will be set by middleware
          setIsValidSession(true)
        } else {
          // No valid session or auth parameters
          router.push('/auth/auth-code-error?reason=invalid_reset_link')
        }
      }
      setCheckingSession(false)
    }
  }, [user, loading, searchParams, router])

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Verifying your session...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                Please request a new password reset link from the sign-in page.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <ResetPasswordForm />
    </div>
  )
}
