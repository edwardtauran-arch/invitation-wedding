import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/authHelper";
import { cookies } from "next/headers";

export async function GET() {
  try {
    if (isAuthorized()) {
      return NextResponse.json({ authenticated: true });
    } else {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

