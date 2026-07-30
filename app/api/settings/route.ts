import { NextResponse } from "next/server";
import { getDynamicSettings } from "@/lib/dbHelper";

export async function GET() {
  try {
    const settings = await getDynamicSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to get settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
