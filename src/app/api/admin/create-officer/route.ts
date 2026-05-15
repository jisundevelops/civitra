import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest, hashPassword } from "@/lib/auth";
import { sanitizeString, validateEmail, validatePassword, validatePhone } from "@/lib/validation";

export async function POST(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
  }

  const body = await request.json();
  const { name, email, password, phone } = body;

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

  const sanitizedEmail = email.trim().toLowerCase();

  // Check email uniqueness
  const existingUser = await db.user.findUnique({ where: { email: sanitizedEmail } });
  if (existingUser) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const hashedPassword = await hashPassword(password);

  const newOfficer = await db.user.create({
    data: {
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : null,
      role: "police",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    { message: "Officer created successfully", officer: newOfficer },
    { status: 201 }
  );
}
