import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../../auth/[...nextauth]/route";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://prop-ai.onrender.com";

// POST /api/applications/[id]/calculate-score - Calculate screening score
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
        property: {
          include: {
            settings: true,
            leases: {
              where: { isActive: true },
              orderBy: { uploadedAt: "desc" },
              take: 1
            }
          }
        }
      }
    });

    if (!application || application.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get property settings or use defaults
    const settings = application.property?.settings;
    const monthly_rent = application.property?.leases?.[0]?.monthlyRent || 0;

    // Call backend to calculate score
    const backendResponse = await fetch(`${BACKEND_URL}/api/tenant-applications/${params.id}/calculate-score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        creditScore: application.creditScore,
        monthlyIncome: application.monthlyIncome,
        monthlyRent: monthly_rent,
        licenseExpiration: application.licenseExpiration?.toISOString(),
        licenseName: application.licenseName,
        applicantName: application.applicantName,
        minCreditScore: settings?.minCreditScore || 600,
        incomeMultiplier: settings?.incomeMultiplier || 3.0,
        minIncomeMultiplier: settings?.minIncomeMultiplier || 2.5
      })
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      throw new Error(`Backend error: ${errorText}`);
    }

    const scoreResult = await backendResponse.json();

    // Update application with score and status
    const updated = await prisma.tenantApplication.update({
      where: { id: params.id },
      data: {
        screeningScore: scoreResult.score,
        status: scoreResult.status,
        screeningNotes: scoreResult.notes
      }
    });

    // If auto-approved (green), send scheduling email
    if (scoreResult.autoApproved) {
      try {
        await fetch(`${BACKEND_URL}/api/tenant-applications/${params.id}/send-scheduling-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            applicantName: application.applicantName,
            applicantEmail: application.applicantEmail,
            userId: session.user.id
          })
        });
      } catch (emailError) {
        console.error("Error sending scheduling email:", emailError);
        // Don't fail the whole request if email fails
      }
    } else if (scoreResult.status === "rejected") {
      // If rejected, send rejection email
      try {
        await fetch(`${BACKEND_URL}/api/tenant-applications/${params.id}/send-rejection-email`, {
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
      } catch (emailError) {
        console.error("Error sending rejection email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      application: updated,
      score: scoreResult.score,
      status: scoreResult.status,
      notes: scoreResult.notes,
      autoApproved: scoreResult.autoApproved
    });
  } catch (error) {
    console.error("Error calculating score:", error);
    return NextResponse.json(
      { error: "Failed to calculate score", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

