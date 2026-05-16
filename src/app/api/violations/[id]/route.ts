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

  if (user.role !== "police" && user.role !== "admin") {
    return NextResponse.json({ error: "Access denied. Police or admin role required." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, notes } = body;

  // Find the violation
  const violation = await db.violation.findUnique({ where: { id: sanitizeString(id) } });
  if (!violation) {
    return NextResponse.json({ error: "Violation not found" }, { status: 404 });
  }

  // Can't update paid violations
  if (violation.status === "paid") {
    return NextResponse.json({ error: "Cannot update a paid violation" }, { status: 400 });
  }

  // Validate status if provided
  if (status && !["pending", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Invalid status. Allowed: pending, cancelled" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = status;
  if (notes !== undefined) updateData.notes = sanitizeString(notes);

  await db.violation.update({
    where: { id: violation.id },
    data: updateData,
  });

  return NextResponse.json({ message: "Updated successfully" });
}
