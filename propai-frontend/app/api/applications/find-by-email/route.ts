import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

const APPLICATION_SERVICE_TOKEN = process.env.APPLICATION_SERVICE_TOKEN || "";

// POST /api/applications/find-by-email - Find application by email (internal service call)
export async function POST(request: NextRequest) {
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
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "email is required" },
        { status: 400 }
      );
    }

    // Find most recent application with this email that is awaiting tenant response
    const application = await prisma.tenantApplication.findFirst({
      where: {
        applicantEmail: email,
        status: {
          in: ["approved", "awaiting_tenant"]
        }
      },
      orderBy: {
        receivedAt: "desc"
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      application
    });
  } catch (error) {
    console.error("Error finding application by email:", error);
    return NextResponse.json(
      { error: "Failed to find application", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

