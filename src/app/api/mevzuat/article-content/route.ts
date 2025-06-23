import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const MEVZUAT_SERVICE_URL =
  process.env.MEVZUAT_SERVICE_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mevzuatId, maddeId } = await request.json();

    if (!mevzuatId || !maddeId) {
      return NextResponse.json(
        { error: "mevzuatId ve maddeId parametreleri gereklidir" },
        { status: 400 }
      );
    }

    // Python HTTP servisine çağrı yap
    const response = await fetch(`${MEVZUAT_SERVICE_URL}/article-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mevzuat_id: mevzuatId,
        madde_id: maddeId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in mevzuat article content API:", error);
    return NextResponse.json(
      {
        error: "Madde içeriği getirme sırasında bir hata oluştu",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
