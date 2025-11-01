import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

// PUT /api/properties/[id] - Update a property
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if property belongs to user
    const existingProperty = await prisma.property.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!existingProperty) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    const property = await prisma.property.update({
      where: { id: params.id },
      data: {
        name,
        photo: photo || existingProperty.photo,
        phone: phone || existingProperty.phone,
        tenantName: context.tenant_name || "—",
        unit: context.unit || "—",
        address: context.address || "",
        hotline: context.hotline || "+1-555-0100",
        portalUrl: context.portal_url || "https://portal.example.com/login",
        propertyName: context.property_name || name,
        tenantPhone: context.tenant_phone
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
    console.error("Error updating property:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update property" },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id] - Delete a property
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if property belongs to user
    const existingProperty = await prisma.property.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!existingProperty) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    await prisma.property.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: "Property deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete property" },
      { status: 500 }
    );
  }
}
