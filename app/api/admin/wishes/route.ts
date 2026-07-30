import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/authHelper";
import { clearDynamicWishes } from "@/lib/dbHelper";

export async function DELETE() {
  if (!isAuthorized()) {
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
