import { NextResponse } from "next/server";
import { createSessionToken, SESSION_DURATION_SECONDS } from "@/lib/authHelper";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (password === adminPassword) {
      const { cookieValue, expiresAt } = createSessionToken(adminPassword);

      const response = NextResponse.json({
        success: true,
        expiresAt,
        durationSeconds: SESSION_DURATION_SECONDS,
      });

      // Set an HTTP-only session cookie valid for 15 minutes (900 seconds)
      response.cookies.set("admin_session", cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: SESSION_DURATION_SECONDS,
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

