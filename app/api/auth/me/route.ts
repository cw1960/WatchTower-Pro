import { NextRequest, NextResponse } from "next/server";
import { getCurrentWhopUser } from "@/lib/auth/whop-auth-middleware";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentWhopUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error getting current user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
