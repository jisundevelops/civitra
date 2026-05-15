import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { sanitizeString } from "@/lib/validation";

export async function GET(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const userProfile = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      nid: true,
      role: true,
      isActive: true,
      createdAt: true,
      vehicles: {
        select: {
          id: true,
          registrationNumber: true,
          vehicleType: true,
          createdAt: true,
        },
      },
    },
  });

  if (!userProfile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: userProfile });
}

export async function PUT(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json();
  const { name, phone, nid } = body;

  const updateData: Record<string, unknown> = {};

  if (name !== undefined) {
    const sanitizedName = sanitizeString(name);
    if (!sanitizedName) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    updateData.name = sanitizedName;
  }

  if (phone !== undefined) {
    updateData.phone = phone ? phone.trim() : null;
  }

  if (nid !== undefined) {
    updateData.nid = nid ? sanitizeString(nid) : null;
  }

  // Cannot change role or email through this endpoint
  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      nid: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ message: "Profile updated", user: updatedUser });
}
