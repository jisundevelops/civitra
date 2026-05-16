import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { sanitizeString } from "@/lib/validation";

export async function GET(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (user.role !== "police" && user.role !== "admin") {
    return NextResponse.json({ error: "Access denied. Police or admin role required." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  // Police can only see their own violations; admin sees all
  if (user.role === "police") {
    where.officerId = user.id;
  }

  if (status && ["pending", "paid", "cancelled"].includes(status)) {
    where.status = status;
  }

  if (search) {
    const sanitizedSearch = sanitizeString(search);
    where.OR = [
      { location: { contains: sanitizedSearch } },
      { notes: { contains: sanitizedSearch } },
      { vehicle: { registrationNumber: { contains: sanitizedSearch } } },
      { violationType: { name: { contains: sanitizedSearch } } },
      { officer: { name: { contains: sanitizedSearch } } },
    ];
  }

  const [violations, total] = await Promise.all([
    db.violation.findMany({
      where,
      include: {
        vehicle: { include: { owner: { select: { id: true, name: true, email: true } } } },
        violationType: { select: { id: true, name: true, fineAmount: true } },
        officer: { select: { id: true, name: true, email: true } },
        payment: { select: { id: true, receiptNumber: true, paymentDate: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.violation.count({ where }),
  ]);

  return NextResponse.json({
    violations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (user.role !== "police" && user.role !== "admin") {
    return NextResponse.json({ error: "Access denied. Police or admin role required." }, { status: 403 });
  }

  const body = await request.json();
  const { registration_number, violation_type_id, location, notes } = body;

  if (!registration_number) {
    return NextResponse.json({ error: "Vehicle registration number is required" }, { status: 400 });
  }

  if (!violation_type_id) {
    return NextResponse.json({ error: "Violation type is required" }, { status: 400 });
  }

  // Find vehicle by registration number
  const vehicle = await db.vehicle.findUnique({
    where: { registrationNumber: sanitizeString(registration_number).toUpperCase() },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found with this registration number" }, { status: 404 });
  }

  // Get violation type and fine amount
  const violationType = await db.violationType.findUnique({
    where: { id: sanitizeString(violation_type_id) },
  });

  if (!violationType) {
    return NextResponse.json({ error: "Violation type not found" }, { status: 404 });
  }

  if (!violationType.isActive) {
    return NextResponse.json({ error: "This violation type is no longer active" }, { status: 400 });
  }

  const violation = await db.violation.create({
    data: {
      vehicleId: vehicle.id,
      officerId: user.id,
      violationTypeId: violationType.id,
      location: location ? sanitizeString(location) : null,
      fineAmount: violationType.fineAmount,
      status: "pending",
      notes: notes ? sanitizeString(notes) : null,
    },
    include: {
      vehicle: { select: { registrationNumber: true } },
      violationType: { select: { name: true } },
    },
  });

  return NextResponse.json(
    {
      message: "Violation issued",
      id: violation.id,
      violation: {
        id: violation.id,
        registrationNumber: violation.vehicle.registrationNumber,
        violationType: violation.violationType.name,
        fineAmount: violation.fineAmount,
        status: violation.status,
      },
    },
    { status: 201 }
  );
}
