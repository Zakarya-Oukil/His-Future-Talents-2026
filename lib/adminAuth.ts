import { createHash, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "hft_admin";

// Session token is derived from ADMIN_PASSWORD, so rotating the password logs every admin out.
export function adminToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHash("sha256").update(`hft-admin-session:${pw}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkAdminPassword(password: unknown): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  return !!pw && typeof password === "string" && safeEqual(password, pw);
}

export function isAdmin(req: Request): boolean {
  const token = adminToken();
  if (!token) return false;
  const match = (req.headers.get("cookie") || "").match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE}=([^;]+)`));
  return !!match && safeEqual(match[1], token);
}

export function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}
