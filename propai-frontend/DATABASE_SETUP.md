# Database Setup Guide

## Local Development

### 1. Set up environment variables
Create a `.env.local` file in the root directory:

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-local-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 2. Generate Prisma client
```bash
npm run db:generate
```

### 3. Push database schema
```bash
npm run db:push
```

### 4. Start development server
```bash
npm run dev
```

## Production Deployment

### Vercel
- Set environment variables in Vercel dashboard
- Prisma client is generated during build
- Database operations happen at runtime

### Render
- Set environment variables in Render dashboard
- Use PostgreSQL or MySQL instead of SQLite
- Run database migrations on deployment

### Environment Variables for Production
```bash
# Database (use PostgreSQL/MySQL for production)
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and run migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with initial data
npm run db:seed
```

## Important Notes

- **Never commit `.env.local`** to version control
- **Use SQLite only for development** - use PostgreSQL/MySQL for production
- **Prisma client is generated locally** and committed to version control
- **Database operations happen at runtime**, not during build
