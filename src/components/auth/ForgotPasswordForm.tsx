'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ForgotPasswordFormProps {
  onBack: () => void
  onSuccess?: () => void
}

export default function ForgotPasswordForm({ onBack, onSuccess }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { resetPassword } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const { error } = await resetPassword(email)
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to send reset email. Please try again.',
          variant: 'destructive',
        })
      } else {
        setSuccess(true)
        toast({
          title: 'Reset email sent',
          description: 'Please check your email for password reset instructions.',
        })
        onSuccess?.()
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We've sent a password reset link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              If you don't see the email, check your spam folder or try again.
            </AlertDescription>
          </Alert>
          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(false)
                setEmail('')
              }}
              className="w-full"
            >
              Send another email
            </Button>
            <Button
              variant="ghost"
              onClick={onBack}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !email}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset email...
              </>
            ) : (
              'Send reset email'
            )}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full"
            disabled={loading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
