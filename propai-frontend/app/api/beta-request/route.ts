import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, location, estimatedAssets, companyName, role, additionalInfo, userId } = body;

    // Validate required fields
    if (!name || !email || !location || !estimatedAssets || !companyName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already has a pending or approved application
    const existingApplication = await prisma.betaApplication.findFirst({
      where: {
        OR: [
          { email: email },
          { userId: userId }
        ]
      }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You already have a beta application' },
        { status: 400 }
      );
    }

    // Create beta application
    const application = await prisma.betaApplication.create({
      data: {
        name,
        email,
        location,
        estimatedAssets,
        companyName,
        role,
        additionalInfo,
        userId: userId || null,
        status: 'pending'
      }
    });

    return NextResponse.json({ 
      success: true, 
      applicationId: application.id,
      message: 'Beta application submitted successfully' 
    });

  } catch (error) {
    console.error('Beta request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit beta application' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Get user's beta application status - check both userId and email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user?.email) {
      return NextResponse.json({
        hasApplication: false,
        application: null,
        isApproved: false
      });
    }

    // Check for approved applications by both userId and email
    const approvedApplication = await prisma.betaApplication.findFirst({
      where: { 
        OR: [
          { userId: userId },
          { email: user.email }
        ],
        status: 'approved'
      }
    });

    // Get any application (for reference)
    const application = await prisma.betaApplication.findFirst({
      where: { 
        OR: [
          { userId: userId },
          { email: user.email }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('Beta status check:', {
      userId,
      email: user.email,
      hasApproved: !!approvedApplication,
      approvedApplication: approvedApplication?.id
    });

    return NextResponse.json({
      hasApplication: !!application,
      application: application,
      isApproved: !!approvedApplication
    });

  } catch (error) {
    console.error('Beta status error:', error);
    return NextResponse.json(
      { error: 'Failed to get beta status' },
      { status: 500 }
    );
  }
}
