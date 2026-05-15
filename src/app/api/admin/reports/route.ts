import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { sanitizeString } from "@/lib/validation";

export async function GET(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "daily"; // daily, weekly, monthly
  const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const sanitizedType = sanitizeString(type);
  const sanitizedDate = sanitizeString(dateParam);

  // Calculate date range based on type
  const startDate = new Date(sanitizedDate);
  if (isNaN(startDate.getTime())) {
    return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
  }

  let endDate: Date;
  switch (sanitizedType) {
    case "weekly":
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
      break;
    case "monthly":
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case "daily":
    default:
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      break;
  }

  // Get violations in the period
  const violations = await db.violation.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
    },
    include: {
      violationType: { select: { name: true } },
      payment: { select: { amount: true, status: true } },
    },
  });

  // Calculate aggregates
  const totalViolations = violations.length;
  const totalRevenue = violations
    .filter((v) => v.status === "paid")
    .reduce((sum, v) => sum + v.fineAmount, 0);

  // Breakdown by violation type
  const typeBreakdown: Record<string, { count: number; revenue: number }> = {};
  for (const v of violations) {
    const typeName = v.violationType.name;
    if (!typeBreakdown[typeName]) {
      typeBreakdown[typeName] = { count: 0, revenue: 0 };
    }
    typeBreakdown[typeName].count++;
    if (v.status === "paid") {
      typeBreakdown[typeName].revenue += v.fineAmount;
    }
  }

  // Breakdown by status
  const statusBreakdown: Record<string, number> = {};
  for (const v of violations) {
    statusBreakdown[v.status] = (statusBreakdown[v.status] || 0) + 1;
  }

  // Top locations
  const locationBreakdown: Record<string, number> = {};
  for (const v of violations) {
    if (v.location) {
      locationBreakdown[v.location] = (locationBreakdown[v.location] || 0) + 1;
    }
  }

  const topLocations = Object.entries(locationBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([location, count]) => ({ location, count }));

  return NextResponse.json({
    period: {
      type: sanitizedType,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    totalViolations,
    totalRevenue,
    typeBreakdown,
    statusBreakdown,
    topLocations,
  });
}
