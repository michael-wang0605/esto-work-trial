import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Public endpoint - no authentication required for backend access

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const propertyId = searchParams.get('propertyId');

    if (!phone && !propertyId) {
      return NextResponse.json(
        { error: 'Phone number or property ID is required' },
        { status: 400 }
      );
    }

    let whereClause: any = {};
    
    if (propertyId) {
      whereClause.propertyId = propertyId;
    } else if (phone) {
      // Find property by phone number
      const property = await prisma.property.findFirst({
        where: { tenantPhone: phone }
      });
      
      if (property) {
        whereClause.propertyId = property.id;
      } else {
        return NextResponse.json({ leases: [] });
      }
    }

    // Get active leases for the property
    const leases = await prisma.lease.findMany({
      where: {
        ...whereClause,
        isActive: true
      },
      select: {
        id: true,
        summary: true,
        keyTerms: true,
        monthlyRent: true,
        securityDeposit: true,
        startDate: true,
        endDate: true,
        originalName: true
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    // Format lease information for AI context
    const leaseContext = leases.map(lease => ({
      fileName: lease.originalName,
      summary: lease.summary || 'No summary available',
      keyTerms: lease.keyTerms || 'No key terms extracted',
      monthlyRent: lease.monthlyRent,
      securityDeposit: lease.securityDeposit,
      startDate: lease.startDate,
      endDate: lease.endDate
    }));

    return NextResponse.json({ 
      leases: leaseContext,
      count: leaseContext.length 
    });

  } catch (error) {
    console.error('Error fetching lease context:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lease context' },
      { status: 500 }
    );
  }
}
