import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    
    // Clear cookie
    response.cookies.set("admin_session", "", {
      path: "/",
      maxAge: 0,
    });
    
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
