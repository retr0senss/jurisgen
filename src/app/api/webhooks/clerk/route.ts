import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { upsertUser } from "@/lib/user-service";
import { prisma } from "@/lib/prisma";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

// Test endpoint - GET request
export async function GET() {
  return NextResponse.json({
    message: "Webhook endpoint is working",
    timestamp: new Date().toISOString(),
    webhookSecret: webhookSecret ? "present" : "missing",
  });
}

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET not found");
    return NextResponse.json(
      { error: "Webhook secret missing" },
      { status: 500 }
    );
  }

  try {
    // Get headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Missing svix headers");
      return NextResponse.json(
        { error: "Missing svix headers" },
        { status: 400 }
      );
    }

    // Get payload
    const payload = await req.json();

    // Verify webhook
    const wh = new Webhook(webhookSecret);

    let evt: Record<string, unknown>;
    try {
      evt = wh.verify(JSON.stringify(payload), {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as Record<string, unknown>;
    } catch (verifyError) {
      console.error("Webhook verification failed:", verifyError);
      return NextResponse.json(
        { error: "Webhook verification failed" },
        { status: 400 }
      );
    }

    // Process event
    const eventType = evt.type as string;

    switch (eventType) {
      case "user.created":
      case "user.updated":
        const userData = evt.data as Record<string, unknown>;

        try {
          await upsertUser(
            userData as {
              id: string;
              email_addresses: Array<{ email_address: string }>;
              first_name?: string;
              last_name?: string;
              image_url?: string;
              created_at?: number;
              updated_at?: number;
              username?: string;
              phone_numbers?: Array<{ phone_number: string }>;
            }
          );
        } catch (dbError) {
          console.error(`Database error for ${eventType}:`, dbError);
          return NextResponse.json(
            { error: "Database error" },
            { status: 500 }
          );
        }
        break;

      case "user.deleted":
        const deletedUserData = evt.data as Record<string, unknown>;
        const deletedUserId = deletedUserData.id as string;

        try {
          // Check if user still exists in our database and clean up if needed
          const remainingUser = await prisma.user.findUnique({
            where: { clerkId: deletedUserId },
            include: {
              conversations: { include: { messages: true } },
              documents: true,
              subscriptions: true,
            },
          });

          if (remainingUser) {
            // Clean up remaining data (same order as manual deletion)
            await prisma.message.deleteMany({
              where: { conversation: { userId: remainingUser.id } },
            });

            await prisma.conversation.deleteMany({
              where: { userId: remainingUser.id },
            });

            await prisma.document.deleteMany({
              where: { userId: remainingUser.id },
            });

            await prisma.subscription.deleteMany({
              where: { userId: remainingUser.id },
            });

            await prisma.user.delete({
              where: { id: remainingUser.id },
            });
          }
        } catch (cleanupError) {
          console.error(
            `Webhook cleanup error for user ${deletedUserId}:`,
            cleanupError
          );
          // Don't return error - webhook should still succeed
        }
        break;

      case "email.created":
      case "email.updated":
        // Email changes should trigger user.updated, so we don't need separate handling
        break;

      case "session.created":
      case "session.ended":
        // Session events - no action needed
        break;

      default:
        // Unhandled event types - no action needed
        break;
    }

    return NextResponse.json({
      received: true,
      eventType,
      processed: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
