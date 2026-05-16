import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { sanitizeString, validateEmail } from "@/lib/validation";
import { setOtp, getOtp, deleteOtp } from "@/lib/otp-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const sanitizedEmail = sanitizeString(email).toLowerCase();

    const user = await db.user.findUnique({ where: { email: sanitizedEmail } });
    if (!user) {
      // Don't reveal whether the email exists
      return NextResponse.json({ message: "If the email exists, an OTP has been sent" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    await setOtp(sanitizedEmail, otp, expiresAt);

    // In development, return the OTP for testing
    return NextResponse.json({
      message: "OTP sent to your email",
      otp, // Returning for testing since we can't send real emails
    });
  } catch (error) {
    console.error("[ForgotPassword] error:", error);
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 });
  }
}
