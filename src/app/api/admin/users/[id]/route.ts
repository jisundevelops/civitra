import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { sanitizeString, validateEmail } from "@/lib/validation";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
  }

  const { id } = await params;
  const sanitizedId = sanitizeString(id);

  const body = await request.json();
  const { name, email, phone, isActive } = body;

  // Find the user to update
  const targetUser = await db.user.findUnique({ where: { id: sanitizedId } });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};

  if (name !== undefined) {
    const sanitizedName = sanitizeString(name);
    if (!sanitizedName) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    updateData.name = sanitizedName;
  }

  if (email !== undefined) {
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }
    const sanitizedEmail = email.trim().toLowerCase();
    // Check if new email is already taken by another user
    if (sanitizedEmail !== targetUser.email) {
      const emailExists = await db.user.findUnique({ where: { email: sanitizedEmail } });
      if (emailExists) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }
    updateData.email = sanitizedEmail;
  }

  if (phone !== undefined) {
    updateData.phone = phone ? phone.trim() : null;
  }

  if (isActive !== undefined) {
    // Cannot deactivate the last admin
    if (isActive === false && targetUser.role === "admin") {
      const adminCount = await db.user.count({ where: { role: "admin", isActive: true } });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot deactivate the last admin user" },
          { status: 400 }
        );
      }
    }
    updateData.isActive = isActive;
  }

  const updatedUser = await db.user.update({
    where: { id: sanitizedId },
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

  return NextResponse.json({ message: "User updated successfully", user: updatedUser });
}
