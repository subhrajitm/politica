'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import MagicLinkForm from './MagicLinkForm'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultMode?: 'login' | 'register' | 'forgot-password' | 'magic-link'
}

export default function AuthModal({ open, onOpenChange, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password' | 'magic-link'>(defaultMode)

  const handleSuccess = () => {
    onOpenChange(false)
  }

  const switchToLogin = () => setMode('login')
  const switchToRegister = () => setMode('register')
  const switchToForgotPassword = () => setMode('forgot-password')
  const switchToMagicLink = () => setMode('magic-link')

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Sign In'
      case 'register': return 'Create Account'
      case 'forgot-password': return 'Reset Password'
      case 'magic-link': return 'Magic Link'
      default: return 'Authentication'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>
        {mode === 'login' && (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={switchToRegister}
            onForgotPassword={switchToForgotPassword}
            onMagicLink={switchToMagicLink}
          />
        )}
        {mode === 'register' && (
          <RegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={switchToLogin}
          />
        )}
        {mode === 'forgot-password' && (
          <ForgotPasswordForm
            onBack={switchToLogin}
            onSuccess={handleSuccess}
          />
        )}
        {mode === 'magic-link' && (
          <MagicLinkForm
            onBack={switchToLogin}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
