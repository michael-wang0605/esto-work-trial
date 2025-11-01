import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, location, estimatedAssets, companyName, role, additionalInfo } = body;

    // Validate required fields
    if (!name || !email || !location || !estimatedAssets || !companyName || !role) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get current user session if available
    const session = await getServerSession();
    const userId = session?.user?.email ? 
      (await prisma.user.findUnique({ where: { email: session.user.email } }))?.id : 
      null;

    // Check if user already has a beta application
    if (userId) {
      const existingApplication = await prisma.betaApplication.findFirst({
        where: { userId }
      });
      
      if (existingApplication) {
        return NextResponse.json(
          { success: false, error: "You already have a beta application" },
          { status: 400 }
        );
      }
    }

    // Create beta application
    const betaApplication = await prisma.betaApplication.create({
      data: {
        name,
        email,
        location,
        estimatedAssets,
        companyName,
        role,
        additionalInfo,
        userId,
        status: "pending"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Beta application submitted successfully",
      application: betaApplication
    });

  } catch (error) {
    console.error("Beta signup error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession();
    
    // Only allow admin users to view all applications
    if (session?.user?.email !== "esto@gmail.com") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const applications = await prisma.betaApplication.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({
      success: true,
      applications
    });

  } catch (error) {
    console.error("Error fetching beta applications:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
