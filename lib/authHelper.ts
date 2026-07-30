import { cookies } from "next/headers";
import crypto from "crypto";

export function isAuthorized() {
  const session = cookies().get("admin_session")?.value;
  if (!session) return false;
  
  const parts = session.split('.');
  if (parts.length !== 2 || parts[0] !== 'authenticated') return false;
  
  const signature = parts[1];
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const expectedSignature = crypto.createHmac('sha256', adminPassword).update("authenticated").digest("hex");
  
  return signature === expectedSignature;
}
