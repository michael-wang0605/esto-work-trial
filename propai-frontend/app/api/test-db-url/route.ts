import { NextResponse } from 'next/server';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  
  return NextResponse.json({
    hasDbUrl: !!dbUrl,
    startsWithPostgres: dbUrl?.startsWith('postgres://') || dbUrl?.startsWith('postgresql://'),
    urlLength: dbUrl?.length || 0,
    firstChars: dbUrl?.substring(0, 20) || 'NOT SET',
    // Don't expose the full URL for security
    urlPreview: dbUrl ? `${dbUrl.substring(0, 15)}...${dbUrl.substring(dbUrl.length - 10)}` : 'NOT SET',
  });
}

