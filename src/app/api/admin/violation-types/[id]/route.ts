import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { sanitizeString } from "@/lib/validation";

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

  const violationType = await db.violationType.findUnique({ where: { id: sanitizedId } });
  if (!violationType) {
    return NextResponse.json({ error: "Violation type not found" }, { status: 404 });
  }

  const body = await request.json();
  const { name, description, fineAmount, isActive } = body;

  const updateData: Record<string, unknown> = {};

  if (name !== undefined) {
    const sanitizedName = sanitizeString(name);
    if (!sanitizedName) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    // Check for duplicate name (excluding current)
    const duplicate = await db.violationType.findFirst({
      where: { name: sanitizedName, id: { not: sanitizedId } },
    });
    if (duplicate) {
      return NextResponse.json({ error: "Violation type with this name already exists" }, { status: 409 });
    }
    updateData.name = sanitizedName;
  }

  if (description !== undefined) {
    updateData.description = description ? sanitizeString(description) : null;
  }

  if (fineAmount !== undefined) {
    if (typeof fineAmount !== "number" || fineAmount < 0) {
      return NextResponse.json({ error: "Invalid fine amount" }, { status: 400 });
    }
    updateData.fineAmount = fineAmount;
  }

  if (isActive !== undefined) {
    updateData.isActive = isActive;
  }

  await db.violationType.update({
    where: { id: sanitizedId },
    data: updateData,
  });

  return NextResponse.json({ message: "Updated successfully" });
}

export async function DELETE(
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

  const violationType = await db.violationType.findUnique({ where: { id: sanitizedId } });
  if (!violationType) {
    return NextResponse.json({ error: "Violation type not found" }, { status: 404 });
  }

  // Soft delete - set isActive to false
  await db.violationType.update({
    where: { id: sanitizedId },
    data: { isActive: false },
  });

  return NextResponse.json({ message: "Deactivated successfully" });
}
