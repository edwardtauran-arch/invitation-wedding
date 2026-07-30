import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (password === adminPassword) {
      const response = NextResponse.json({ success: true });
      
      const signature = crypto.createHmac('sha256', adminPassword).update("authenticated").digest("hex");
      const cookieValue = `authenticated.${signature}`;
      
      // Set an HTTP-only session cookie
      response.cookies.set("admin_session", cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      
      return response;
    } else {
      return NextResponse.json(
        { error: "Password salah!" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
