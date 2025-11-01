import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

const APPLICATION_SERVICE_TOKEN = process.env.APPLICATION_SERVICE_TOKEN || "";

// POST /api/applications/[id]/update-status - Update application status (internal service call)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify service token for internal API calls
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    if (token !== APPLICATION_SERVICE_TOKEN) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "status is required" },
        { status: 400 }
      );
    }

    // Update application status
    const updated = await prisma.tenantApplication.update({
      where: { id: params.id },
      data: { status }
    });

    return NextResponse.json({
      success: true,
      application: updated
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { error: "Failed to update status", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

