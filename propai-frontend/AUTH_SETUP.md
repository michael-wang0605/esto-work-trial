# Authentication Setup Guide

## Overview
Your ten8Link app now has a complete authentication system integrated with NextAuth.js, featuring:
- Google OAuth sign-in
- Email-based passwordless authentication
- Beautiful UI that matches your landing page design

## Required Environment Variables
Create a `.env.local` file in your `propai-frontend` directory with:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (for Google sign-in)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Provider (for email sign-in)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

## Setup Steps

### 1. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret to your `.env.local`

### 2. Email Provider Setup (Gmail Example)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this app password in `EMAIL_SERVER_PASSWORD`

### 3. NextAuth Secret
Generate a random secret:
```bash
openssl rand -base64 32
```

## Features

### Landing Page Integration
- **Sign in button** in navbar links to `/auth`
- **LoginCTA component** links to `/auth?next=/preview`
- Consistent design language with your main page

### Authentication Flow
1. **Google Sign-in**: One-click authentication with Google account
2. **Email Sign-in**: Passwordless authentication via email link
3. **Verification**: Users see a beautiful verification page after requesting email link
4. **Redirects**: Proper callback handling with `next` parameter support

### UI Components
- **Auth Page** (`/auth`): Main sign-in page with Google and email options
- **Verify Request Page** (`/auth/verify-request`): Email verification confirmation
- **SessionProvider**: Wraps your app for authentication state management

## Usage

### Sign In
Users can access authentication via:
- Navbar "Sign in" button → `/auth`
- Landing page CTA buttons → `/auth?next=/preview`

### Authentication State
Use NextAuth hooks in your components:
```tsx
import { useSession, signIn, signOut } from "next-auth/react";

// Check if user is signed in
const { data: session, status } = useSession();

// Sign in/out
<button onClick={() => signIn()}>Sign In</button>
<button onClick={() => signOut()}>Sign Out</button>
```

## Next Steps
1. Set up your environment variables
2. Test Google OAuth flow
3. Configure email provider
4. Add protected routes using `useSession()`
5. Customize authentication callbacks as needed

## Troubleshooting
- **Google OAuth errors**: Check redirect URIs and API enablement
- **Email errors**: Verify SMTP settings and app passwords
- **Session issues**: Ensure `SessionProvider` wraps your app
- **Build errors**: Check that all imports are correct
