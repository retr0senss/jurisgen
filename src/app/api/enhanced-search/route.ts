import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { enhancedMevzuatSearch } from "@/lib/semantic-filter";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      query,
      domain,
      searchType = "fulltext",
      maxResults = 10,
    } = await request.json();

    if (!query || !domain) {
      return NextResponse.json(
        { error: "Query and domain are required" },
        { status: 400 }
      );
    }

    console.log(`🚀 Enhanced search request: "${query}" in ${domain}`);

    // Use enhanced search with semantic filtering
    const result = await enhancedMevzuatSearch(
      query,
      domain,
      searchType,
      maxResults
    );

    return NextResponse.json({
      success: true,
      query,
      domain,
      searchType,
      rawCount: result.rawCount,
      filteredCount: result.results.length,
      results: result.results,
      stats: result.stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Enhanced search API error:", error);
    return NextResponse.json(
      {
        error: "Enhanced search failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
