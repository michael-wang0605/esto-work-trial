import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://prop-ai.onrender.com";

// POST /api/applications/[id]/background-check - Run background check for an application
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

    // Call backend to run background check
    const backendResponse = await fetch(`${BACKEND_URL}/api/tenant-applications/${params.id}/background-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        applicantName: application.applicantName,
        applicantEmail: application.applicantEmail,
        applicantPhone: application.applicantPhone,
        licenseNumber: application.licenseNumber,
        licenseDOB: application.licenseDOB?.toISOString(),
        employerName: application.employerName,
        creditScore: application.creditScore
      })
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      throw new Error(`Backend error: ${errorText}`);
    }

    const { backgroundCheck } = await backendResponse.json();

    // Update application with background check results
    const updated = await prisma.tenantApplication.update({
      where: { id: params.id },
      data: {
        backgroundCheckResult: backgroundCheck as any,
        backgroundCheckCompletedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      application: updated,
      backgroundCheck
    });
  } catch (error) {
    console.error("Error running background check:", error);
    return NextResponse.json(
      { error: "Failed to run background check", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

