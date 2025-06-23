import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId, incrementUsage } from "@/lib/user-service";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type } = body;

    if (!type || !["message", "document"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid usage type. Must be 'message' or 'document'" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await getUserByClerkId(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Increment usage
    await incrementUsage(user.id, type);

    // Get updated user data
    const updatedUser = await getUserByClerkId(userId);

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser!.id,
        monthlyMessageCount: updatedUser!.monthlyMessageCount,
        monthlyDocumentCount: updatedUser!.monthlyDocumentCount,
        planType: updatedUser!.planType,
        isPremium: updatedUser!.isPremium,
        updatedAt: updatedUser!.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
