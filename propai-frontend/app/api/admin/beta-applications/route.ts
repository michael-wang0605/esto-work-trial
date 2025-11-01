import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    
    // Only allow admin users to view all applications
    if (session?.user?.email !== "esto@gmail.com") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all beta applications
    const applications = await prisma.betaApplication.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ applications });

  } catch (error) {
    console.error('Admin beta applications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch beta applications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    
    // Only allow admin users to update applications
    if (session?.user?.email !== "esto@gmail.com") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { applicationId, action, userId } = body;

    if (!applicationId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Update application status
      await prisma.betaApplication.update({
        where: { id: applicationId },
        data: { status: 'approved' }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Application approved successfully' 
      });

    } else if (action === 'reject') {
      // Update application status
      await prisma.betaApplication.update({
        where: { id: applicationId },
        data: { status: 'rejected' }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Application rejected' 
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Admin beta application update error:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
