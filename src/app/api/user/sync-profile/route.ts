import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { clerkId, imageUrl, firstName, lastName, email } = body;

    // Verify the user is updating their own profile
    if (clerkId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log(`Manual sync requested for user: ${userId}`, {
      imageUrl,
      firstName,
      lastName,
      email,
    });

    // Prepare update data - only include fields that are provided
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;

    // Update the user's data in the database
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: updateData,
    });

    console.log(`User synced successfully: ${updatedUser.id}`, {
      clerkId: updatedUser.clerkId,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      imageUrl: updatedUser.imageUrl,
    });

    return NextResponse.json({
      success: true,
      message: "Profile synced successfully",
      user: {
        id: updatedUser.id,
        clerkId: updatedUser.clerkId,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        imageUrl: updatedUser.imageUrl,
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Profile sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
