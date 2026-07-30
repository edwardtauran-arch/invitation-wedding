import { NextResponse } from "next/server";
import { clearDynamicWishes } from "@/lib/dbHelper";
import { cookies } from "next/headers";

function isAuthorized() {
  const session = cookies().get("admin_session")?.value;
  return session === "authenticated";
}

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
