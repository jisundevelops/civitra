import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, generateToken } from "@/lib/auth";
import { sanitizeString } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeString(email).toLowerCase();

    // Test database connection first
    let user;
    try {
      user = await db.user.findUnique({ where: { email: sanitizedEmail } });
    } catch (dbError) {
      console.error("Database query error during login:", dbError);
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again in a moment." },
        { status: 503 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account is deactivated" }, { status: 403 });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Generate citizenId for citizens who don't have one yet (legacy users)
    if (user.role === "citizen" && !user.citizenId) {
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      const citizenId = `CIV-${year}-${random}`;
      try {
        await db.user.update({
          where: { id: user.id },
          data: { citizenId },
        });
        user.citizenId = citizenId;
      } catch {
        // Non-critical: continue login even if citizenId generation fails
        console.error("Failed to generate citizenId for user:", user.id);
      }
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        citizenId: user.citizenId || null,
        phone: user.phone || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
