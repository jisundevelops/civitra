import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { sanitizeString } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Any authenticated user can view violation types (for dropdown usage)
    const violationTypes = await db.violationType.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ violationTypes });
  } catch (error) {
    console.error("[ViolationTypes] error:", error);
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, fineAmount } = body;

    const sanitizedName = sanitizeString(name);
    if (!sanitizedName) {
      return NextResponse.json({ error: "Violation type name is required" }, { status: 400 });
    }

    if (fineAmount === undefined || fineAmount === null || typeof fineAmount !== "number" || fineAmount < 0) {
      return NextResponse.json({ error: "Valid fine amount is required" }, { status: 400 });
    }

    // Check for duplicate name
    const existing = await db.violationType.findFirst({ where: { name: sanitizedName } });
    if (existing) {
      return NextResponse.json({ error: "Violation type with this name already exists" }, { status: 409 });
    }

    const violationType = await db.violationType.create({
      data: {
        name: sanitizedName,
        description: description ? sanitizeString(description) : null,
        fineAmount,
      },
    });

    return NextResponse.json(
      { message: "Violation type created", id: violationType.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ViolationTypes] error:", error);
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 });
  }
}
