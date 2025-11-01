import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../../auth/[...nextauth]/route";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://prop-ai.onrender.com";
const APPLICATION_SERVICE_TOKEN = process.env.APPLICATION_SERVICE_TOKEN || "";

// POST /api/applications/[id]/schedule - Schedule a property showing
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Support both session auth (user) and service token (backend)
    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    let isServiceCall = false;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (token === APPLICATION_SERVICE_TOKEN) {
        isServiceCall = true;
      }
    }

    if (!isServiceCall) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
      userId = session.user.id;
    }

    const application = await prisma.tenantApplication.findUnique({
      where: { id: params.id },
      include: {
        property: {
          include: {
            settings: true
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // For service calls, skip user ownership check
    if (!isServiceCall && application.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { scheduledDate, scheduledTime } = body;

    if (!scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: "scheduledDate and scheduledTime are required" },
        { status: 400 }
      );
    }

    // Simply update the application with scheduling details (no calendar event creation)
    const updated = await prisma.tenantApplication.update({
      where: { id: params.id },
      data: {
        status: "scheduled",
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        showingConfirmed: true
      }
    });

    return NextResponse.json({
      success: true,
      application: updated
    });
  } catch (error) {
    console.error("Error scheduling showing:", error);
    return NextResponse.json(
      { error: "Failed to schedule showing", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

