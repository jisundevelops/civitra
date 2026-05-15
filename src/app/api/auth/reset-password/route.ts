import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { sanitizeString, validateEmail, validatePassword } from "@/lib/validation";
import { getOtp, deleteOtp } from "@/lib/otp-store";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, otp, newPassword } = body;

  if (!email || !validateEmail(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  if (!otp) {
    return NextResponse.json({ error: "OTP is required" }, { status: 400 });
  }

  const passwordCheck = validatePassword(newPassword);
  if (!passwordCheck.valid) {
    return NextResponse.json({ error: passwordCheck.message }, { status: 400 });
  }

  const sanitizedEmail = sanitizeString(email).toLowerCase();

  // Verify OTP
  const storedOtp = await getOtp(sanitizedEmail);
  if (!storedOtp) {
    return NextResponse.json({ error: "No OTP found. Please request a new one." }, { status: 400 });
  }

  if (Date.now() > storedOtp.expiresAt) {
    await deleteOtp(sanitizedEmail);
    return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
  }

  if (storedOtp.otp !== otp.toString()) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }

  // Find user
  const user = await db.user.findUnique({ where: { email: sanitizedEmail } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Hash new password and update
  const hashedPassword = await hashPassword(newPassword);
  await db.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Delete used OTP
  await deleteOtp(sanitizedEmail);

  return NextResponse.json({ message: "Password reset successful" });
}
