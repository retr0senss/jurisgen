import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { detectLegalIntentHybrid } from "@/lib/grok-intent";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    console.log(`🧪 Intent test for: "${message}"`);

    // Test the intent detection function directly
    const result = await detectLegalIntentHybrid(message);

    console.log(`📊 Intent result:`, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Intent test error:", error);
    return NextResponse.json(
      {
        error: "Intent detection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
