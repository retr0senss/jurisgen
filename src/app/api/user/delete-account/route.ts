import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Verify password using Clerk's sign-in attempt API
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);

      // Check if user has password authentication enabled
      const hasPassword = user.passwordEnabled;
      if (!hasPassword) {
        return NextResponse.json(
          { error: "Password authentication not enabled for this account" },
          { status: 400 }
        );
      }

      // Verify password using Clerk's verifyPassword method
      try {
        // Use Clerk's SDK verifyPassword method
        const verificationResult = await client.users.verifyPassword({
          userId: userId,
          password: password,
        });

        if (!verificationResult.verified) {
          return NextResponse.json(
            { error: "Şifre hatalı. Lütfen doğru şifrenizi girin." },
            { status: 400 }
          );
        }
      } catch (passwordError) {
        console.error("Password verification failed:", passwordError);

        // Handle specific Clerk errors
        if (
          passwordError &&
          typeof passwordError === "object" &&
          "errors" in passwordError &&
          Array.isArray(passwordError.errors) &&
          passwordError.errors.length > 0
        ) {
          const error = passwordError.errors[0];
          if (
            error.code === "form_password_incorrect" ||
            error.code === "form_identifier_not_found" ||
            error.code === "session_exists"
          ) {
            return NextResponse.json(
              { error: "Şifre hatalı. Lütfen doğru şifrenizi girin." },
              { status: 400 }
            );
          }
        }

        return NextResponse.json(
          { error: "Şifre doğrulanamadı. Lütfen tekrar deneyin." },
          { status: 400 }
        );
      }
    } catch (clerkError) {
      console.error("Error verifying user with Clerk:", clerkError);
      return NextResponse.json(
        { error: "Failed to verify user credentials" },
        { status: 400 }
      );
    }

    // Start deletion process - Order is important for data integrity
    let dbUser = null;
    let deletedData = {
      messages: 0,
      conversations: 0,
      documents: 0,
      subscriptions: 0,
    };

    try {
      // 1. First, delete user data from our database
      dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
          conversations: {
            include: { messages: true },
          },
          documents: true,
          subscriptions: true,
        },
      });

      if (dbUser) {
        // Calculate data to be deleted for response
        deletedData = {
          messages: dbUser.conversations.reduce(
            (total, conv) => total + conv.messages.length,
            0
          ),
          conversations: dbUser.conversations.length,
          documents: dbUser.documents.length,
          subscriptions: dbUser.subscriptions.length,
        };

        // Delete in correct order to respect foreign key constraints
        // 1. Messages (child of conversations)
        await prisma.message.deleteMany({
          where: { conversation: { userId: dbUser.id } },
        });

        // 2. Conversations
        await prisma.conversation.deleteMany({
          where: { userId: dbUser.id },
        });

        // 3. Documents
        await prisma.document.deleteMany({
          where: { userId: dbUser.id },
        });

        // 4. Subscriptions
        await prisma.subscription.deleteMany({
          where: { userId: dbUser.id },
        });

        // 5. Finally delete the user record
        await prisma.user.delete({
          where: { id: dbUser.id },
        });
      }

      // 2. Only delete from Clerk if database deletion was successful
      const client = await clerkClient();
      await client.users.deleteUser(userId);

      return NextResponse.json({
        success: true,
        message: "Account deleted successfully",
        deletedData,
      });
    } catch (deletionError) {
      console.error("Error during account deletion:", deletionError);

      // Specific error handling
      if (deletionError instanceof Error) {
        // Database connection errors
        if (
          deletionError.message.includes("Can't reach database server") ||
          deletionError.message.includes("P1001")
        ) {
          return NextResponse.json(
            {
              error:
                "Veritabanı bağlantısı başarısız. Lütfen daha sonra tekrar deneyin.",
              details: "Database connection failed",
            },
            { status: 503 }
          );
        }

        if (deletionError.message.includes("Foreign key constraint")) {
          return NextResponse.json(
            {
              error:
                "Veri bağımlılığı hatası. Lütfen destek ekibiyle iletişime geçin.",
            },
            { status: 500 }
          );
        }

        if (
          deletionError.message.includes("Clerk") ||
          deletionError.message.includes("404")
        ) {
          return NextResponse.json(
            { error: "Hesap zaten silinmiş olabilir." },
            { status: 400 }
          );
        }
      }

      return NextResponse.json(
        {
          error:
            "Hesap silinirken bir hata oluştu. Lütfen destek ekibiyle iletişime geçin.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
