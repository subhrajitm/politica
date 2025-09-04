# Authentication Setup

This document describes the authentication system implemented in the Politica application.

## Overview

The application now includes user registration and login functionality using Supabase authentication. Users must be signed in to access AI-powered politician summaries.

## Features

### User Authentication
- **Registration**: Users can create new accounts with email and password
- **Login**: Existing users can sign in with their credentials
- **Logout**: Users can sign out from their account
- **Session Management**: Automatic session handling with persistent login state

### Protected Features
- **AI-Powered Summaries**: Only available to logged-in users
- **User Menu**: Shows user email and logout option when signed in

## Components

### Authentication Components
- `AuthModal`: Modal dialog for login/registration
- `LoginForm`: Form for user sign-in
- `RegisterForm`: Form for user registration
- `UserMenu`: Dropdown menu for authenticated users

### Context and Services
- `AuthContext`: React context for managing authentication state
- `AuthService`: Service class for Supabase authentication operations

## Usage

### For Users
1. Click "Sign In" in the header to open the authentication modal
2. Choose between "Sign In" or "Create Account"
3. Fill in your email and password
4. For new accounts, check your email for confirmation link
5. Once signed in, you can access AI-powered summaries

### For Developers
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signIn, signOut } = useAuth();
  
  if (user) {
    return <div>Welcome, {user.email}!</div>;
  }
  
  return <div>Please sign in</div>;
}
```

## Database Schema

The authentication system uses Supabase's built-in `auth.users` table. The existing `admin_profiles` table references this for admin users.

## Security

- Row Level Security (RLS) is enabled on all tables
- User authentication is handled by Supabase
- AI-powered features are protected behind authentication
- Password requirements: minimum 6 characters

## Environment Variables

Make sure these environment variables are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Future Enhancements

- Password reset functionality
- Social login (Google, GitHub, etc.)
- User profiles and preferences
- Role-based access control
- Email verification improvements
