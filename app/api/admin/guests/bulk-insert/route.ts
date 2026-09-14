import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/authHelper";
import { bulkCreateDynamicGuests } from "@/lib/dbHelper";

export async function POST(req: Request) {
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { names } = await req.json();
    if (!names || !Array.isArray(names) || names.length === 0) {
      return NextResponse.json({ error: "Names array is required" }, { status: 400 });
    }

    const result = await bulkCreateDynamicGuests(names);
    return NextResponse.json({ success: true, count: result.count, guests: result.inserted }, { status: 201 });
  } catch (error) {
    console.error("Bulk insert guest error:", error);
    return NextResponse.json({ error: "Failed to bulk insert guests" }, { status: 500 });
  }
}
