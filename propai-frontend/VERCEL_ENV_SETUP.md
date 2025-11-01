# Vercel Environment Variables Setup

## Required Environment Variables for Vercel

Add these environment variables in your Vercel dashboard:

### 1. NextAuth Configuration
```
NEXTAUTH_URL=https://ten8link.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
```

### 2. Google OAuth
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Database
```
DATABASE_URL=your-postgresql-connection-string
```

## How to Add Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project (ten8link)
3. Go to Settings → Environment Variables
4. Add each variable above
5. Make sure to set them for "Production", "Preview", and "Development"
6. Redeploy your application

## Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `https://ten8link.vercel.app/api/auth/callback/google`
7. Copy Client ID and Client Secret to Vercel environment variables

## Database Setup

Make sure your PostgreSQL database is accessible from Vercel and the connection string is correct.

## After Adding Environment Variables

1. Go to Vercel dashboard
2. Click "Redeploy" on your latest deployment
3. Test the Google OAuth login

## Troubleshooting

- **401 Unauthorized**: Check that all environment variables are set correctly
- **Google OAuth errors**: Verify redirect URIs match your Vercel domain
- **Database errors**: Ensure DATABASE_URL is correct and database is accessible
