import { NextResponse } from "next/server";
import { getSessionInfo } from "@/lib/authHelper";

export async function GET() {
  try {
    const sessionInfo = getSessionInfo();
    if (sessionInfo.authenticated) {
      return NextResponse.json({
        authenticated: true,
        expiresAt: sessionInfo.expiresAt,
        remainingSeconds: sessionInfo.remainingSeconds,
      });
    } else {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}


