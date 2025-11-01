import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import { DEMO_PROPERTIES } from "@/lib/demoProperties";

// GET /api/properties - Get all properties for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { properties: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // If user has no properties, create demo properties
    if (user.properties.length === 0) {
      const demoProperties = await Promise.all(
        DEMO_PROPERTIES.map(demo => 
          prisma.property.create({
            data: {
              name: demo.name,
              photo: demo.photo,
              phone: demo.phone,
              tenantName: demo.context.tenant_name,
              unit: demo.context.unit,
              address: demo.context.address,
              hotline: demo.context.hotline,
              portalUrl: demo.context.portal_url,
              propertyName: demo.context.property_name,
              tenantPhone: demo.context.tenant_phone,
              userId: user.id
            }
          })
        )
      );

      // Convert demo properties to frontend format
      const properties = demoProperties.map(prop => ({
        id: prop.id,
        name: prop.name,
        photo: prop.photo,
        phone: prop.phone,
        context: {
          tenant_name: prop.tenantName,
          unit: prop.unit,
          address: prop.address,
          hotline: prop.hotline,
          portal_url: prop.portalUrl,
          property_name: prop.propertyName,
          tenant_phone: prop.tenantPhone
        }
      }));

      return NextResponse.json({
        success: true,
        properties
      });
    }

    // Convert database properties to frontend format
    const properties = user.properties.map(prop => ({
      id: prop.id,
      name: prop.name,
      photo: prop.photo,
      phone: prop.phone,
      context: {
        tenant_name: prop.tenantName,
        unit: prop.unit,
        address: prop.address,
        hotline: prop.hotline,
        portal_url: prop.portalUrl,
        property_name: prop.propertyName,
        tenant_phone: prop.tenantPhone
      }
    }));

    return NextResponse.json({
      success: true,
      properties
    });

  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create a new property
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, photo, phone, context } = await request.json();

    if (!name || !context) {
      return NextResponse.json(
        { success: false, error: "Name and context are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        properties: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has approved beta application by both userId and email
    const approvedBetaApplication = await prisma.betaApplication.findFirst({
      where: { 
        OR: [
          { userId: user.id },
          { email: user.email }
        ],
        status: 'approved'
      }
    });

    const hasApprovedBeta = !!approvedBetaApplication;
    
    // For non-approved users, enforce property limit (2 demo + 1 additional = 3 total)
    if (!hasApprovedBeta) {
      const totalProperties = user.properties.length;
      const maxProperties = 3; // 2 demo + 1 additional
      
      if (totalProperties >= maxProperties) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Property limit reached. You can only add 1 additional property beyond the demo properties. Please apply for beta access to add more properties.",
            limitReached: true
          },
          { status: 403 }
        );
      }
    }

    const property = await prisma.property.create({
      data: {
        name,
        photo: photo || "https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1600&auto=format&fit=crop",
        phone: phone || "+10000000000",
        tenantName: context.tenant_name || "—",
        unit: context.unit || "—",
        address: context.address || "",
        hotline: context.hotline || "+1-555-0100",
        portalUrl: context.portal_url || "https://portal.example.com/login",
        propertyName: context.property_name || name,
        tenantPhone: context.tenant_phone,
        userId: user.id
      }
    });

    // Return in frontend format
    const propertyResponse = {
      id: property.id,
      name: property.name,
      photo: property.photo,
      phone: property.phone,
      context: {
        tenant_name: property.tenantName,
        unit: property.unit,
        address: property.address,
        hotline: property.hotline,
        portal_url: property.portalUrl,
        property_name: property.propertyName,
        tenant_phone: property.tenantPhone
      }
    };

    return NextResponse.json({
      success: true,
      property: propertyResponse
    });

  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create property" },
      { status: 500 }
    );
  }
}
