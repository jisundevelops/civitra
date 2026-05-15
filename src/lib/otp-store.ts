// In-memory OTP store (for dev phase - in production use email/Redis)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export function setOtp(email: string, otp: string, expiresAt: number) {
  otpStore.set(email, { otp, expiresAt });
}

export function getOtp(email: string): { otp: string; expiresAt: number } | undefined {
  return otpStore.get(email);
}

export function deleteOtp(email: string) {
  otpStore.delete(email);
}
