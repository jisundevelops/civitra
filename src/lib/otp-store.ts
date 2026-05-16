import { db } from '@/lib/db';

export async function setOtp(email: string, otp: string, expiresAt: number) {
  // Delete any existing OTP for this email
  await db.otpVerification.deleteMany({ where: { email } });

  // Create new OTP record
  await db.otpVerification.create({
    data: {
      email,
      otp,
      expiresAt: new Date(expiresAt),
    },
  });
}

export async function getOtp(email: string): Promise<{ otp: string; expiresAt: number } | null> {
  const record = await db.otpVerification.findFirst({
    where: { email },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) return null;

  return {
    otp: record.otp,
    expiresAt: record.expiresAt.getTime(),
  };
}

export async function deleteOtp(email: string) {
  await db.otpVerification.deleteMany({ where: { email } });
}
