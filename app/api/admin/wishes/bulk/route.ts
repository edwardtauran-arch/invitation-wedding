import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/authHelper";
import { deleteDynamicWishBulk } from "@/lib/dbHelper";

export async function POST(req: Request) {
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await deleteDynamicWishBulk(ids);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bulk delete wish error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
