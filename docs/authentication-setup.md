# Authentication Setup

This document describes the authentication system implemented in the Politica application.

## Overview

The application now includes user registration and login functionality using Supabase authentication. Users must be signed in to access AI-powered politician summaries.

## Features

### User Authentication
- **Registration**: Users can create new accounts with email and password
- **Login**: Existing users can sign in with their credentials
- **Google OAuth**: Users can sign in with their Google account
- **Logout**: Users can sign out from their account
- **Session Management**: Automatic session handling with persistent login state

### Protected Features
- **AI-Powered Summaries**: Only available to logged-in users
- **User Menu**: Shows user email and logout option when signed in

## Components

### Authentication Components
- `AuthModal`: Modal dialog for login/registration
- `LoginForm`: Form for user sign-in with Google OAuth option
- `RegisterForm`: Form for user registration with Google OAuth option
- `GoogleSignInButton`: Reusable Google OAuth sign-in button
- `UserMenu`: Dropdown menu for authenticated users

### Context and Services
- `AuthContext`: React context for managing authentication state
- `AuthService`: Service class for Supabase authentication operations

## Usage

### For Users
1. Click "Sign In" in the header to open the authentication modal
2. Choose between "Sign In" or "Create Account"
3. **Option A - Google OAuth**: Click "Continue with Google" to sign in with your Google account
4. **Option B - Email/Password**: Fill in your email and password
5. For new accounts, check your email for confirmation link
6. Once signed in, you can access AI-powered summaries

### For Developers
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signIn, signInWithGoogle, signOut } = useAuth();
  
  if (user) {
    return <div>Welcome, {user.email}!</div>;
  }
  
  return (
    <div>
      <button onClick={() => signInWithGoogle()}>
        Sign in with Google
      </button>
    </div>
  );
}
```

## Database Schema

The authentication system uses Supabase's built-in `auth.users` table. The existing `admin_profiles` table references this for admin users.

## Security

- Row Level Security (RLS) is enabled on all tables
- User authentication is handled by Supabase
- AI-powered features are protected behind authentication
- Password requirements: minimum 6 characters

## Google OAuth Setup

### Prerequisites
1. A Google Cloud project
2. Supabase project with authentication enabled

### Google Cloud Console Configuration

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Platform](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Configure Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type
   - Fill in the required fields:
     - App name: Your app name
     - User support email: Your email
     - Developer contact information: Your email
   - Add your domain to "Authorized domains":
     - Add your Supabase project domain: `<PROJECT_ID>.supabase.co`
     - Add your production domain (if applicable)

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth Client ID"
   - Choose "Web application"
   - Add authorized origins:
     - `http://localhost:3000` (for development)
     - Your production domain
   - Add authorized redirect URIs:
     - `https://<PROJECT_ID>.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)

4. **Get Client Credentials**
   - Copy the Client ID and Client Secret
   - You'll need these for Supabase configuration

### Supabase Configuration

1. **Enable Google Provider**
   - Go to your Supabase Dashboard
   - Navigate to "Authentication" > "Providers"
   - Find "Google" and toggle it on
   - Enter your Google Client ID and Client Secret
   - Save the configuration

2. **Configure Redirect URLs**
   - In Supabase Dashboard > "Authentication" > "URL Configuration"
   - Add your callback URL: `http://localhost:3000/auth/callback` (development)
   - Add your production callback URL when deploying

### Environment Variables

Make sure these environment variables are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: The Google OAuth credentials are configured in Supabase Dashboard, not in environment variables.

## Future Enhancements

- Password reset functionality
- Additional social login providers (GitHub, Facebook, etc.)
- User profiles and preferences
- Role-based access control
- Email verification improvements
- Google One Tap integration
- Multi-factor authentication
