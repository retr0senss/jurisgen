import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/user-service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data from database
    const user = await getUserByClerkId(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get recent activity (last 5 conversations and documents)
    const recentConversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
    });

    const recentDocuments = await prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 2,
    });

    // Format recent activity
    const recentActivity = [
      ...recentConversations.map((conv) => ({
        id: conv.id,
        type: "message" as const,
        title:
          conv.title ||
          conv.messages[0]?.content.substring(0, 50) + "..." ||
          "Yeni Sohbet",
        timestamp: conv.updatedAt.toISOString(),
        status: "completed",
      })),
      ...recentDocuments.map((doc) => ({
        id: doc.id,
        type: "document" as const,
        title: doc.originalName,
        timestamp: doc.createdAt.toISOString(),
        status: doc.status.toLowerCase(),
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 5);

    // Return user data
    return NextResponse.json({
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        planType: user.planType,
        isPremium: user.isPremium,
        monthlyMessageCount: user.monthlyMessageCount,
        monthlyDocumentCount: user.monthlyDocumentCount,
        lastResetDate: user.lastResetDate.toISOString(),
        preferredLanguage: user.preferredLanguage,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionEndsAt: user.subscriptionEndsAt?.toISOString(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { preferredLanguage, firstName, lastName } = body;

    // Get user from database
    const user = await getUserByClerkId(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user preferences and profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(preferredLanguage !== undefined && { preferredLanguage }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
      },
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        preferredLanguage: updatedUser.preferredLanguage,
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
 