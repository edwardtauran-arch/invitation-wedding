import { NextResponse } from "next/server";
import { getDynamicGuests } from "@/lib/dbHelper";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  try {
    const guests = await getDynamicGuests();
    const normalizedQuery = name.toLowerCase().trim();
    
    const isValid = guests.some(g => g.name.toLowerCase().trim() === normalizedQuery);
    
    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error("Error validating guest:", error);
    return NextResponse.json({ valid: false, error: "Internal Server Error" }, { status: 500 });
  }
}
