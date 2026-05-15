export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .substring(0, 500); // Limit length
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function validatePassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "Password is required" };
  }
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }
  return { valid: true };
}

export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  const phoneRegex = /^[+]?[\d\s-]{7,15}$/;
  return phoneRegex.test(phone.trim());
}

export function validateRegistrationNumber(reg: string): boolean {
  if (!reg || typeof reg !== "string") return false;
  const trimmed = reg.trim();
  return trimmed.length > 0 && trimmed.length <= 50;
}
