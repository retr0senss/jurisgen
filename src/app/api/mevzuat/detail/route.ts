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

    const {
      mevzuatId,
      keywords = [],
      // userQuery is not used in detail route
    } = await request.json();

    if (!mevzuatId) {
      return NextResponse.json(
        { error: "mevzuatId is required" },
        { status: 400 }
      );
    }

    console.log("🔬 Fetching detailed content for:", mevzuatId);

    // Step 1: Get article tree using the correct endpoint
    const treeResponse = await fetch(`${MEVZUAT_SERVICE_URL}/article-tree`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mevzuat_id: mevzuatId,
      }),
    });

    if (!treeResponse.ok) {
      console.error(`Article tree request failed: ${treeResponse.status}`);

      // Fallback: Return basic info without detailed content
      return NextResponse.json({
        success: true,
        mevzuatId,
        content: `Bu mevzuat (ID: ${mevzuatId}) için detaylı içerik şu anda alınamıyor.`,
        articleCount: 0,
        totalArticles: 0,
        keywords,
        fallback: true,
        debug: {
          error: `HTTP ${treeResponse.status}`,
          message: "Article tree endpoint failed",
        },
      });
    }

    const treeData = await treeResponse.json();
    console.log(
      `📄 Found article tree data:`,
      treeData?.length || 0,
      "articles"
    );

    if (!treeData || !Array.isArray(treeData) || treeData.length === 0) {
      return NextResponse.json({
        success: true,
        mevzuatId,
        content: "Bu mevzuat için madde içeriği bulunamadı.",
        articleCount: 0,
        totalArticles: 0,
        keywords,
      });
    }

    // Step 2: Get content for relevant articles (max 5 articles for token efficiency)
    const relevantArticles =
      keywords.length > 0
        ? treeData
            .filter((article: any) =>
              keywords.some(
                (keyword: string) =>
                  article.title
                    ?.toLowerCase()
                    .includes(keyword.toLowerCase()) ||
                  article.madde_baslik
                    ?.toLowerCase()
                    .includes(keyword.toLowerCase())
              )
            )
            .slice(0, 5)
        : treeData.slice(0, 3); // Default to first 3 articles

    console.log(
      `🎯 Fetching content for ${relevantArticles.length} relevant articles`
    );

    const contentPromises = relevantArticles.map(async (article: any) => {
      try {
        const contentResponse = await fetch(
          `${MEVZUAT_SERVICE_URL}/article-content`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              mevzuat_id: mevzuatId,
              madde_id: article.madde_id || article.id,
            }),
          }
        );

        if (!contentResponse.ok) {
          console.error(
            `Failed to fetch content for article ${
              article.madde_id || article.id
            }`
          );
          return null;
        }

        const contentData = await contentResponse.json();

        return {
          title:
            article.title ||
            article.madde_baslik ||
            `Madde ${article.madde_id || article.id}`,
          content: contentData.markdown_content || contentData.content || "",
          id: article.madde_id || article.id,
        };
      } catch (error) {
        console.error(
          `Error fetching content for article ${
            article.madde_id || article.id
          }:`,
          error
        );
        return null;
      }
    });

    const articleContents = (await Promise.all(contentPromises)).filter(
      Boolean
    );

    // Combine all content
    const combinedContent =
      articleContents.length > 0
        ? articleContents
            .map((article: any) => `## ${article.title}\n\n${article.content}`)
            .join("\n\n---\n\n")
        : "Bu mevzuat için içerik alınamadı.";

    return NextResponse.json({
      success: true,
      mevzuatId,
      content: combinedContent,
      articleCount: articleContents.length,
      totalArticles: treeData.length,
      keywords,
      debug: {
        foundArticles: treeData.length,
        relevantArticles: relevantArticles.length,
        fetchedContents: articleContents.length,
      },
    });
  } catch (error) {
    console.error("Detail API error:", error);

    // Graceful fallback - don't break the entire chat system
    return NextResponse.json({
      success: true,
      mevzuatId: "unknown",
      content: "Bu mevzuat için detaylı içerik şu anda alınamıyor.",
      articleCount: 0,
      totalArticles: 0,
      keywords: [],
      fallback: true,
      debug: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
}
