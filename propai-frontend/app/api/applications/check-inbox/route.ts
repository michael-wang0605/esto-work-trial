import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://prop-ai.onrender.com";

/**
 * Check Agentmail inbox for new messages
 * This triggers the backend to monitor inbox and process new emails
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user ID from database (session.user.id may not be typed correctly)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Call backend to check inbox, passing the user ID so applications are created with the correct user
    const response = await fetch(`${BACKEND_URL}/api/agentmail/check-inbox`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id, // Pass user ID to backend so applications match logged-in user
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: data.message || "Inbox check initiated",
    });
  } catch (error) {
    console.error("Error checking inbox:", error);
    return NextResponse.json(
      {
        error: "Failed to check inbox",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

