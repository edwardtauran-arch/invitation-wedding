import { NextResponse } from "next/server";
import { deleteDynamicWish } from "@/lib/dbHelper";
import { cookies } from "next/headers";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const token = cookieStore.get("admin_session");

  if (!token || token.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Missing ID parameter" }, { status: 400 });
    }

    const deletedWish = await deleteDynamicWish(id);
    if (!deletedWish) {
      return NextResponse.json({ error: "Wish not found or could not be deleted" }, { status: 404 });
    }

    return NextResponse.json({ message: "Wish deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete wish:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
