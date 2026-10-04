import { NextResponse } from "next/server";
import { findWishByName } from "@/lib/dbHelper";

export const dynamic = "force-dynamic";

// GET /api/check-wish?name=... → cek apakah tamu sudah pernah RSVP
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name")?.trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const wish = await findWishByName(name);
    return NextResponse.json({ exists: !!wish, wish });
  } catch (error) {
    console.error("Failed to check wish:", error);
    return NextResponse.json({ error: "Failed to check wish" }, { status: 500 });
  }
}
