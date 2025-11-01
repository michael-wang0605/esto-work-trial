import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { uploadFileToStorage, extractTextFromPDF } from '@/lib/documentService';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const propertyId = formData.get('propertyId') as string;

    if (!file || !propertyId) {
      return NextResponse.json({ error: 'File and propertyId are required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.' }, { status: 400 });
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

    // Upload file to storage (you'll need to implement this)
    const fileUrl = await uploadFileToStorage(file, `leases/${propertyId}`);

    // Extract text from document for AI processing
    const extractedText = await extractTextFromPDF(file);

    // Create lease record
    const lease = await prisma.lease.create({
      data: {
        propertyId,
        fileName: file.name,
        originalName: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: session.user.id,
        // AI processing will be done asynchronously
      }
    });

    // Process document with AI asynchronously
    processDocumentWithAI(lease.id, extractedText);

    return NextResponse.json({ 
      success: true, 
      lease: {
        id: lease.id,
        fileName: lease.fileName,
        uploadedAt: lease.uploadedAt
      }
    });

  } catch (error) {
    console.error('Error uploading lease:', error);
    return NextResponse.json({ error: 'Failed to upload lease' }, { status: 500 });
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

    const leases = await prisma.lease.findMany({
      where: {
        propertyId
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    return NextResponse.json({ leases });

  } catch (error) {
    console.error('Error fetching leases:', error);
    return NextResponse.json({ error: 'Failed to fetch leases' }, { status: 500 });
  }
}

// Process document with AI asynchronously
async function processDocumentWithAI(leaseId: string, extractedText: string) {
  try {
    // Call AI service to summarize and extract key terms
    const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ai/process-lease`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: extractedText,
        leaseId
      })
    });

    if (aiResponse.ok) {
      const result = await aiResponse.json();
      
      // Update lease with AI results
      await prisma.lease.update({
        where: { id: leaseId },
        data: {
          summary: result.summary,
          keyTerms: result.keyTerms,
          startDate: result.startDate ? new Date(result.startDate) : null,
          endDate: result.endDate ? new Date(result.endDate) : null,
          monthlyRent: result.monthlyRent,
          securityDeposit: result.securityDeposit
        }
      });
    }
  } catch (error) {
    console.error('Error processing document with AI:', error);
  }
}
