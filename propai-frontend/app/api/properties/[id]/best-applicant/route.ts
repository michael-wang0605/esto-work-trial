import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://prop-ai.onrender.com";

// POST /api/properties/[id]/best-applicant - Find best applicant for a property
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

    const body = await request.json();
    const { propertyRent, applicationIds, allProperties } = body;

    // If "all" is requested, we'll query all applications for the user
    const backendPropertyId = params.id === "all" ? null : params.id;

    // Call backend to find best applicant
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/properties/${backendPropertyId || "all"}/best-applicant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          propertyRent: propertyRent,
          applicationIds: applicationIds, // Send IDs of currently displayed applications
          allProperties: allProperties || params.id === "all", // Flag for all properties
        }),
      }
    );

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      throw new Error(`Backend error: ${errorText}`);
    }

    const result = await backendResponse.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error finding best applicant:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Failed to find best applicant" 
      },
      { status: 500 }
    );
  }
}

