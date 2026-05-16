import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
    }

    const [
      totalViolations,
      pendingViolations,
      paidViolations,
      totalRevenueResult,
      totalCitizens,
      totalPolice,
      recentViolations,
    ] = await Promise.all([
      db.violation.count(),
      db.violation.count({ where: { status: "pending" } }),
      db.violation.count({ where: { status: "paid" } }),
      db.payment.aggregate({ _sum: { amount: true } }),
      db.user.count({ where: { role: "citizen", isActive: true } }),
      db.user.count({ where: { role: "police", isActive: true } }),
      db.violation.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          vehicle: { select: { registrationNumber: true } },
          violationType: { select: { name: true } },
          officer: { select: { name: true } },
        },
      }),
    ]);

    const totalRevenue = totalRevenueResult._sum.amount || 0;

    const formattedRecent = recentViolations.map((v) => ({
      id: v.id,
      registrationNumber: v.vehicle.registrationNumber,
      violationType: v.violationType.name,
      officerName: v.officer.name,
      fineAmount: v.fineAmount,
      status: v.status,
      location: v.location,
      createdAt: v.createdAt,
    }));

    return NextResponse.json({
      totalViolations,
      pendingViolations,
      paidViolations,
      totalRevenue,
      totalCitizens,
      totalPolice,
      recentViolations: formattedRecent,
    });
  } catch (error) {
    console.error("[AdminStats] error:", error);
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 });
  }
}
