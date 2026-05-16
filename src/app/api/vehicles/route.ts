import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { sanitizeString, validateRegistrationNumber } from "@/lib/validation";

export async function POST(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json();
  const { registration_number, vehicle_type } = body;

  if (!registration_number) {
    return NextResponse.json({ error: "Vehicle registration number is required" }, { status: 400 });
  }

  if (!validateRegistrationNumber(registration_number)) {
    return NextResponse.json({ error: "Invalid vehicle registration number" }, { status: 400 });
  }

  const regNumber = sanitizeString(registration_number).toUpperCase();

  // Check if vehicle already exists
  const existingVehicle = await db.vehicle.findUnique({
    where: { registrationNumber: regNumber },
  });

  if (existingVehicle) {
    if (existingVehicle.ownerId) {
      // Check if it's already owned by this user
      if (existingVehicle.ownerId === user.id) {
        return NextResponse.json({ error: "This vehicle is already registered to your account" }, { status: 409 });
      }
      return NextResponse.json({ error: "This vehicle is already registered to another account" }, { status: 409 });
    }
    // Link unowned vehicle to this user
    const updated = await db.vehicle.update({
      where: { id: existingVehicle.id },
      data: { ownerId: user.id, vehicleType: vehicle_type ? sanitizeString(vehicle_type) : null },
    });
    return NextResponse.json({ message: "Vehicle linked to your account", vehicle: updated }, { status: 201 });
  }

  // Create new vehicle
  const vehicle = await db.vehicle.create({
    data: {
      registrationNumber: regNumber,
      ownerId: user.id,
      vehicleType: vehicle_type ? sanitizeString(vehicle_type) : null,
    },
  });

  return NextResponse.json({ message: "Vehicle added successfully", vehicle }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get("id");

  if (!vehicleId) {
    return NextResponse.json({ error: "Vehicle ID is required" }, { status: 400 });
  }

  const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle || vehicle.ownerId !== user.id) {
    return NextResponse.json({ error: "Vehicle not found or not owned by you" }, { status: 404 });
  }

  // Check if vehicle has violations
  const violationCount = await db.violation.count({ where: { vehicleId: vehicle.id } });
  if (violationCount > 0) {
    return NextResponse.json({ error: "Cannot remove vehicle with existing violations" }, { status: 400 });
  }

  await db.vehicle.delete({ where: { id: vehicleId } });
  return NextResponse.json({ message: "Vehicle removed successfully" });
}
