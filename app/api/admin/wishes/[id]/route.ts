import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/authHelper";
import { clearWishMessage } from "@/lib/dbHelper";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Missing ID parameter" }, { status: 400 });
    }

    const cleared = await clearWishMessage(id);
    if (!cleared) {
      return NextResponse.json({ error: "Wish not found or could not be cleared" }, { status: 404 });
    }

    return NextResponse.json({ message: "Wish message cleared successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete wish:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
