import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId, address } = await request.json();

    if (!propertyId || !address) {
      return NextResponse.json({ error: 'Property ID and address are required' }, { status: 400 });
    }

    // Check if property belongs to user
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        userId: session.user.id
      }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found or access denied' }, { status: 404 });
    }

    // Check if context already exists
    const existingContext = await prisma.propertyContext.findUnique({
      where: { propertyId }
    });

    if (existingContext) {
      return NextResponse.json({ 
        message: 'Property context already exists',
        context: existingContext
      });
    }

    // Call backend to collect property context using Gemini
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://prop-ai.onrender.com';
    console.log('Calling backend URL:', `${backendUrl}/api/ai/collect-property-context`);
    
    const backendResponse = await fetch(`${backendUrl}/api/ai/collect-property-context`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        propertyId
      })
    });

    console.log('Backend response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend error:', errorText);
      throw new Error(`Failed to collect property context from AI: ${backendResponse.status} - ${errorText}`);
    }

    const contextData = await backendResponse.json();
    console.log('Context data received:', contextData);

    // Save context to database
    const propertyContext = await prisma.propertyContext.create({
      data: {
        propertyId,
        ...contextData,
        aiModel: 'gemini-2.0-flash',
        lastUpdated: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      context: propertyContext 
    });

  } catch (error) {
    console.error('Error collecting property context:', error);
    return NextResponse.json({ error: 'Failed to collect property context' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    // Check if property belongs to user
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        userId: session.user.id
      }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found or access denied' }, { status: 404 });
    }

    const context = await prisma.propertyContext.findUnique({
      where: { propertyId }
    });

    return NextResponse.json({ context });

  } catch (error) {
    console.error('Error fetching property context:', error);
    return NextResponse.json({ error: 'Failed to fetch property context' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId, ...updateData } = await request.json();

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    // Check if property belongs to user
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        userId: session.user.id
      }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found or access denied' }, { status: 404 });
    }

    const context = await prisma.propertyContext.upsert({
      where: { propertyId },
      update: {
        ...updateData,
        lastUpdated: new Date()
      },
      create: {
        propertyId,
        ...updateData,
        aiModel: 'manual-update',
        lastUpdated: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      context 
    });

  } catch (error) {
    console.error('Error updating property context:', error);
    return NextResponse.json({ error: 'Failed to update property context' }, { status: 500 });
  }
}
