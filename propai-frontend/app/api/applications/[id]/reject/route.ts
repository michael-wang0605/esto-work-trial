import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../../auth/[...nextauth]/route";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://prop-ai.onrender.com";

// POST /api/applications/[id]/reject - Reject application and send decline email
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
      where: { id: params.id },
      include: {
        property: true
      }
    });

    if (!application || application.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update application status
    const updated = await prisma.tenantApplication.update({
      where: { id: params.id },
      data: {
        status: "rejected",
        screeningScore: "red"
      }
    });

    // Send rejection email via backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/tenant-applications/${params.id}/send-rejection-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        applicantName: application.applicantName,
        applicantEmail: application.applicantEmail,
        propertyName: application.property?.name || "the property"
      })
    });

    const emailResult = await backendResponse.json();

    return NextResponse.json({
      success: true,
      application: updated,
      emailSent: emailResult.emailSent || false
    });
  } catch (error) {
    console.error("Error rejecting application:", error);
    return NextResponse.json(
      { error: "Failed to reject application" },
      { status: 500 }
    );
  }
}

