import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (user.role !== "police" && user.role !== "admin") {
      return NextResponse.json({ error: "Access denied. Police or admin role required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const citizenId = searchParams.get("citizenId");

    if (!citizenId) {
      return NextResponse.json({ error: "citizenId query parameter is required" }, { status: 400 });
    }

    const citizen = await db.user.findUnique({
      where: { citizenId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        nid: true,
        citizenId: true,
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

    if (!citizen || citizen.role !== "citizen") {
      return NextResponse.json({ error: "Citizen not found" }, { status: 404 });
    }

    // Get violations for this citizen's vehicles
    const vehicleIds = citizen.vehicles.map((v) => v.id);
    const violations = await db.violation.findMany({
      where: { vehicleId: { in: vehicleIds } },
      include: {
        violationType: { select: { name: true, fineAmount: true } },
        officer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      citizen,
      violations: violations.map((v) => ({
        id: v.id,
        registrationNumber: citizen.vehicles.find((veh) => veh.id === v.vehicleId)?.registrationNumber,
        violationTypeName: v.violationType.name,
        fineAmount: v.fineAmount,
        status: v.status,
        location: v.location,
        dateTime: v.dateTime,
        officerName: v.officer.name,
      })),
    });
  } catch (error) {
    console.error("[Citizens] error:", error);
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 });
  }
}
