import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/authHelper";
import { cookies } from "next/headers";
import { getDynamicSettings, updateDynamicSettings } from "@/lib/dbHelper";



export async function GET() {
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
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

export async function PUT(req: Request) {
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const settings = await updateDynamicSettings(body);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

