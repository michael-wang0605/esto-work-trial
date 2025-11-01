import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://prop-ai.onrender.com";

// POST /api/applications/[id]/process - Process documents for an application
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const application = await prisma.tenantApplication.findUnique({
      where: { id: params.id }
    });

    if (!application || application.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Call backend to process documents
    const backendResponse = await fetch(`${BACKEND_URL}/api/tenant-applications/process-documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        applicationId: params.id,
        driversLicenseUrl: application.driversLicenseUrl,
        payStubUrls: application.payStubUrls,
        creditScoreUrl: application.creditScoreUrl
      })
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      throw new Error(`Backend error: ${errorText}`);
    }

    const { extractedData } = await backendResponse.json();

    // Update application with extracted data
    const updated = await prisma.tenantApplication.update({
      where: { id: params.id },
      data: {
        licenseName: extractedData.licenseName,
        licenseDOB: extractedData.licenseDOB ? new Date(extractedData.licenseDOB) : null,
        licenseExpiration: extractedData.licenseExpiration ? new Date(extractedData.licenseExpiration) : null,
        licenseNumber: extractedData.licenseNumber,
        employerName: extractedData.employerName,
        monthlyIncome: extractedData.monthlyIncome,
        annualIncome: extractedData.annualIncome,
        payFrequency: extractedData.payFrequency,
        creditScore: extractedData.creditScore,
        creditScoreDate: extractedData.creditScoreDate ? new Date(extractedData.creditScoreDate) : null
      }
    });

    return NextResponse.json({
      success: true,
      application: updated,
      extractedData
    });
  } catch (error) {
    console.error("Error processing documents:", error);
    return NextResponse.json(
      { error: "Failed to process documents", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

