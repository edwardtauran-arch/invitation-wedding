import { cookies } from "next/headers";
import crypto from "crypto";

export const SESSION_DURATION_SECONDS = 15 * 60; // 15 minutes = 900 seconds
export const SESSION_DURATION_MS = SESSION_DURATION_SECONDS * 1000; // 900,000 ms

export function createSessionToken(adminPassword: string, timestamp: number = Date.now()): { cookieValue: string; expiresAt: number } {
  const signature = crypto
    .createHmac("sha256", adminPassword)
    .update(`authenticated.${timestamp}`)
    .digest("hex");
  const cookieValue = `authenticated.${timestamp}.${signature}`;
  const expiresAt = timestamp + SESSION_DURATION_MS;
  return { cookieValue, expiresAt };
}

export function getSessionInfo(): { authenticated: boolean; expiresAt?: number; remainingSeconds?: number } {
  const session = cookies().get("admin_session")?.value;
  if (!session) return { authenticated: false };

  const parts = session.split(".");
  if (parts.length !== 3 || parts[0] !== "authenticated") {
    return { authenticated: false };
  }

  const timestamp = parseInt(parts[1], 10);
  const signature = parts[2];
  if (isNaN(timestamp)) return { authenticated: false };

  const now = Date.now();
  const expiresAt = timestamp + SESSION_DURATION_MS;
  const remainingMs = expiresAt - now;

  // Check if expired or created in the far future (allow 60s clock skew)
  if (remainingMs <= 0 || timestamp > now + 60000) {
    return { authenticated: false };
  }

  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const expectedSignature = crypto
    .createHmac("sha256", adminPassword)
    .update(`authenticated.${parts[1]}`)
    .digest("hex");

  try {
    const sigBuffer = Buffer.from(signature, "hex");
    const expBuffer = Buffer.from(expectedSignature, "hex");
    if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
      return { authenticated: false };
    }
  } catch {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    expiresAt,
    remainingSeconds: Math.max(0, Math.floor(remainingMs / 1000)),
  };
}

export function isAuthorized(): boolean {
  return getSessionInfo().authenticated;
}

