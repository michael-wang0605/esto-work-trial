import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// For serverless environments (Vercel), use connection pooling URL
// POSTGRES_PRISMA_URL is optimized for Prisma with connection pooling
// Falls back to DATABASE_URL if POSTGRES_PRISMA_URL is not available
const databaseUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('⚠️ DATABASE_URL or POSTGRES_PRISMA_URL environment variable is not set')
}

// Configure Prisma client with connection pooling for production
const prismaClientOptions: any = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
}

// Override the datasource URL if we have a custom database URL
if (databaseUrl) {
  prismaClientOptions.datasources = {
    db: {
      url: databaseUrl,
    },
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Handle graceful shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}
