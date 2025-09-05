'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, Mail, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface MagicLinkFormProps {
  onBack: () => void
  onSuccess?: () => void
}

export default function MagicLinkForm({ onBack, onSuccess }: MagicLinkFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signInWithMagicLink } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const { error } = await signInWithMagicLink(email)
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to send magic link. Please try again.',
          variant: 'destructive',
        })
      } else {
        setSuccess(true)
        toast({
          title: 'Magic link sent',
          description: 'Please check your email for the sign-in link.',
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
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We've sent a magic link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Click the link in your email to sign in. The link will expire in 1 hour.
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
              Send another link
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
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle>Sign in with magic link</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a secure link to sign in.
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
                Sending magic link...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Send magic link
              </>
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
