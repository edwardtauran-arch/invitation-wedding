import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updateDynamicGuest, deleteDynamicGuest } from "@/lib/dbHelper";

type ParamsProps = {
  params: { id: string };
};

function isAuthorized() {
  const session = cookies().get("admin_session")?.value;
  return session === "authenticated";
}

export async function PUT(req: Request, { params }: ParamsProps) {
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    
    const guest = await updateDynamicGuest(id, body);
    
    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }
    
    return NextResponse.json(guest);
  } catch (error) {
    console.error("Failed to update guest:", error);
    return NextResponse.json(
      { error: "Failed to update guest" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: ParamsProps) {
  if (!isAuthorized()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    
    const guest = await deleteDynamicGuest(id);
    
    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Guest deleted successfully" });
  } catch (error) {
    console.error("Failed to delete guest:", error);
    return NextResponse.json(
      { error: "Failed to delete guest" },
      { status: 500 }
    );
  }
}
