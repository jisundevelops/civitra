import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import {
  sanitizeString,
  validateEmail,
  validatePassword,
  validatePhone,
  validateRegistrationNumber,
} from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, phone, nid, vehicle_number } = body;

  // Validate required fields
  const sanitizedName = sanitizeString(name);
  if (!sanitizedName) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (!validateEmail(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    return NextResponse.json({ error: passwordCheck.message }, { status: 400 });
  }

  if (phone && !validatePhone(phone)) {
    return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
  }

  if (vehicle_number && !validateRegistrationNumber(vehicle_number)) {
    return NextResponse.json({ error: "Invalid vehicle registration number" }, { status: 400 });
  }

  // Check email uniqueness
  const existingUser = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (existingUser) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  // Hash password and create user
  const hashedPassword = await hashPassword(password);
  const sanitizedNid = nid ? sanitizeString(nid) : null;
  const sanitizedPhone = phone ? phone.trim() : null;

  const user = await db.user.create({
    data: {
      name: sanitizedName,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: sanitizedPhone,
      nid: sanitizedNid,
      role: "citizen",
    },
  });

  // Generate citizenId for citizens
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  const citizenId = `CIV-${year}-${random}`;

  await db.user.update({
    where: { id: user.id },
    data: { citizenId },
  });

  // If vehicle_number provided, create vehicle linked to user
  if (vehicle_number) {
    const existingVehicle = await db.vehicle.findUnique({
      where: { registrationNumber: vehicle_number.trim().toUpperCase() },
    });
    if (existingVehicle) {
      // Link existing unowned vehicle to this user
      if (!existingVehicle.ownerId) {
        await db.vehicle.update({
          where: { id: existingVehicle.id },
          data: { ownerId: user.id },
        });
      }
      // If vehicle already has an owner, skip silently
    } else {
      await db.vehicle.create({
        data: {
          registrationNumber: vehicle_number.trim().toUpperCase(),
          ownerId: user.id,
        },
      });
    }
  }

  return NextResponse.json({ message: "Registered successfully", citizenId }, { status: 201 });
}
