import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

// GET /api/applications - Get all tenant applications for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {
      userId
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { applicantName: { contains: search, mode: "insensitive" } },
        { applicantEmail: { contains: search, mode: "insensitive" } }
      ];
    }

    const applications = await prisma.tenantApplication.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      },
      orderBy: {
        receivedAt: "desc"
      }
    });

    return NextResponse.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    
    // Provide more detailed error information
    let errorMessage = "Failed to fetch applications";
    let errorDetails = null;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for common Prisma connection errors
      if (error.message.includes("connection") || error.message.includes("connect")) {
        errorMessage = "Failed to connect to database. Please check your DATABASE_URL configuration.";
        errorDetails = process.env.NODE_ENV === "development" 
          ? error.message 
          : "Database connection failed. Check environment variables.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Database connection timed out. The database may be unavailable.";
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        type: "database_error"
      },
      { status: 500 }
    );
  }
}

// POST /api/applications - Create a new tenant application (manually)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      propertyId,
      applicantName,
      applicantEmail,
      applicantPhone,
      emailSubject,
      emailBody,
      creditScore,
      monthlyIncome,
      annualIncome,
      screeningScore,
      status
    } = body;

    if (!applicantName || !applicantEmail) {
      return NextResponse.json(
        { error: "Applicant name and email are required" },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;
    const application = await prisma.tenantApplication.create({
      data: {
        userId,
        propertyId: propertyId || null,
        applicantName,
        applicantEmail,
        applicantPhone: applicantPhone || null,
        emailSubject: emailSubject || null,
        emailBody: emailBody || null,
        creditScore: creditScore || null,
        monthlyIncome: monthlyIncome || null,
        annualIncome: annualIncome || null,
        screeningScore: screeningScore || null,
        status: status || "pending",
        receivedAt: new Date()
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      application
    });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}

