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

    if (user.role !== "citizen") {
      return NextResponse.json({ error: "Access denied. Citizen role required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";

    // Get all vehicles owned by the citizen
    const vehicles = await db.vehicle.findMany({
      where: { ownerId: user.id },
      select: { id: true },
    });

    const vehicleIds = vehicles.map((v) => v.id);

    if (vehicleIds.length === 0) {
      return NextResponse.json({ violations: [] });
    }

    const where: Record<string, unknown> = {
      vehicleId: { in: vehicleIds },
    };

    if (status && ["pending", "paid", "cancelled"].includes(status)) {
      where.status = status;
    }

    const violations = await db.violation.findMany({
      where,
      include: {
        violationType: { select: { id: true, name: true, fineAmount: true } },
        vehicle: { select: { registrationNumber: true } },
        officer: { select: { id: true, name: true } },
        payment: { select: { id: true, receiptNumber: true, paymentDate: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ violations });
  } catch (error) {
    console.error("[ViolationsMy] error:", error);
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 });
  }
}
