import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminToken, checkAdminPassword, isAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Session check
export async function GET(req: Request) {
  return NextResponse.json({ success: isAdmin(req) });
}

// Login
export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}));
  const token = adminToken();
  if (!token || !checkAdminPassword(password)) {
    // ponytail: fixed delay slows brute force; add real rate limiting if the password is weak
    await new Promise((r) => setTimeout(r, 1000));
    return NextResponse.json({ success: false, error: "Invalid passcode" }, { status: 401 });
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

// Logout
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
