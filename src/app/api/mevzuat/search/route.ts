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

    const params = await request.json();

    // Python HTTP servisine çağrı yap
    const response = await fetch(`${MEVZUAT_SERVICE_URL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mevzuat_adi: params.mevzuatAdi,
        phrase: params.phrase,
        mevzuat_no: params.mevzuatNo,
        resmi_gazete_sayisi: params.resmiGazeteSayisi,
        mevzuat_turleri: params.mevzuatTurleri,
        page_number: params.pageNumber || 1,
        page_size: params.pageSize || 10,
        sort_field: params.sortField || "RESMI_GAZETE_TARIHI",
        sort_direction: params.sortDirection || "desc",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in mevzuat search API:", error);
    return NextResponse.json(
      {
        error: "Mevzuat arama sırasında bir hata oluştu",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
