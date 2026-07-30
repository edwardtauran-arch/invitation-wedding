import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/authHelper";
import { cookies } from "next/headers";
import { getDynamicGuests, createDynamicGuest } from "@/lib/dbHelper";



export async function GET() {
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const guests = await getDynamicGuests();
    return NextResponse.json(guests);
  } catch (error) {
    console.error("Failed to get guests:", error);
    return NextResponse.json(
      { error: "Failed to fetch guests" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, phone } = await req.json();
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    
    const newGuest = await createDynamicGuest({ name, phone: phone || "" });
    return NextResponse.json(newGuest, { status: 201 });
  } catch (error) {
    console.error("Failed to create guest:", error);
    return NextResponse.json(
      { error: "Failed to create guest" },
      { status: 500 }
    );
  }
}

