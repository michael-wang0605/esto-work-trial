import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    const hasPrismaUrl = !!process.env.POSTGRES_PRISMA_URL;
    const dbUrlType = process.env.POSTGRES_PRISMA_URL 
      ? 'POSTGRES_PRISMA_URL (recommended)' 
      : process.env.DATABASE_URL 
        ? 'DATABASE_URL' 
        : 'NOT SET';
    
    const isPostgres = (process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || '').includes('postgres');
    const hasPooling = (process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || '').includes('pgbouncer');
    
    // Test database connection
    const userCount = await prisma.user.count();
    const applicationCount = await prisma.tenantApplication.count();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      diagnostics: {
        dbUrlType,
        hasDatabaseUrl,
        hasPrismaUrl,
        isPostgres,
        hasPooling,
        isProduction: process.env.NODE_ENV === 'production'
      },
      counts: {
        users: userCount,
        applications: applicationCount
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isConnectionError = errorMessage.toLowerCase().includes('connection') || 
                             errorMessage.toLowerCase().includes('connect') ||
                             errorMessage.toLowerCase().includes('timeout') ||
                             errorMessage.toLowerCase().includes('econnrefused');
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: errorMessage,
      isConnectionError,
      diagnostics: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
        dbUrlType: process.env.POSTGRES_PRISMA_URL 
          ? 'POSTGRES_PRISMA_URL' 
          : process.env.DATABASE_URL 
            ? 'DATABASE_URL' 
            : 'NOT SET',
        isPostgres: (process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || '').includes('postgres'),
      },
      suggestion: isConnectionError 
        ? 'Check DATABASE_URL or POSTGRES_PRISMA_URL environment variable. For serverless (Vercel), use POSTGRES_PRISMA_URL with connection pooling.'
        : 'Check database credentials and network access.'
    }, { status: 500 });
  }
}
