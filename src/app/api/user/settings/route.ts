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

    // Return user settings
    return NextResponse.json({
      settings: {
        // Notification settings
        emailNotifications: user.emailNotifications,
        marketingEmails: user.marketingEmails,
        securityAlerts: user.securityAlerts,

        // Privacy settings
        dataSharing: user.dataSharing,
        profileVisibility: user.profileVisibility,

        // Security settings
        twoFactorEnabled: user.twoFactorEnabled,

        // Other settings
        preferredLanguage: user.preferredLanguage,
        timezone: user.timezone,

        // Storage info
        storageUsed: Number(user.storageUsed),
        planType: user.planType,
      },
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      emailNotifications,
      marketingEmails,
      securityAlerts,
      dataSharing,
      profileVisibility,
      twoFactorEnabled,
      preferredLanguage,
      timezone,
    } = body;

    // Get user from database
    const user = await getUserByClerkId(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user settings
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        // Only update provided fields
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(marketingEmails !== undefined && { marketingEmails }),
        ...(securityAlerts !== undefined && { securityAlerts }),
        ...(dataSharing !== undefined && { dataSharing }),
        ...(profileVisibility !== undefined && { profileVisibility }),
        ...(twoFactorEnabled !== undefined && { twoFactorEnabled }),
        ...(preferredLanguage !== undefined && { preferredLanguage }),
        ...(timezone !== undefined && { timezone }),
      },
    });

    return NextResponse.json({
      settings: {
        emailNotifications: updatedUser.emailNotifications,
        marketingEmails: updatedUser.marketingEmails,
        securityAlerts: updatedUser.securityAlerts,
        dataSharing: updatedUser.dataSharing,
        profileVisibility: updatedUser.profileVisibility,
        twoFactorEnabled: updatedUser.twoFactorEnabled,
        preferredLanguage: updatedUser.preferredLanguage,
        timezone: updatedUser.timezone,
      },
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
 