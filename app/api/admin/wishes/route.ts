import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/authHelper";
import { clearDynamicWishes } from "@/lib/dbHelper";
import { cookies } from "next/headers";

export async function DELETE() {
  const cookieStore = cookies();
  const token = cookieStore.get("admin_session");

  if (!token || token.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await clearDynamicWishes();
    return NextResponse.json({ message: "All wishes cleared successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to clear wishes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

