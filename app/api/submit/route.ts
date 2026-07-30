import { NextResponse } from "next/server";
import { createDynamicWish } from "@/lib/dbHelper";

export async function POST(req: Request) {
  try {
    const { name, attendance, guests, message } = await req.json();
    await createDynamicWish({ name, attendance, guests: Number(guests), message });

    return NextResponse.json(
      {
        message: "RSVP submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to submit RSVP:", error);
    return new NextResponse("Failed to submit RSVP", { status: 500 });
  }
}

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
