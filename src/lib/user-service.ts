import { prisma } from "./prisma";
import { PlanType, SubscriptionStatus } from "@prisma/client";

// Plan limitleri
export const PLAN_LIMITS = {
  FREE: {
    monthlyMessages: 10,
    monthlyDocuments: 2,
    features: ["basic_chat", "basic_mevzuat"],
  },
  BASIC: {
    monthlyMessages: 100,
    monthlyDocuments: 10,
    features: ["basic_chat", "basic_mevzuat", "document_upload"],
  },
  PREMIUM: {
    monthlyMessages: 1000,
    monthlyDocuments: 50,
    features: [
      "basic_chat",
      "basic_mevzuat",
      "document_upload",
      "advanced_analysis",
      "priority_support",
    ],
  },
  ENTERPRISE: {
    monthlyMessages: -1, // Unlimited
    monthlyDocuments: -1, // Unlimited
    features: ["all_features", "custom_integration", "dedicated_support"],
  },
} as const;

// Kullanıcı oluşturma veya güncelleme (Clerk webhook'undan gelecek)
export async function upsertUser(clerkUser: {
  id: string;
  email_addresses: Array<{ email_address: string }>;
  first_name?: string;
  last_name?: string;
  image_url?: string;
  created_at?: number;
  updated_at?: number;
  username?: string;
  phone_numbers?: Array<{ phone_number: string }>;
}) {
  const email = clerkUser.email_addresses[0]?.email_address;
  if (!email) throw new Error("Email is required");

  console.log(`Syncing user from Clerk: ${clerkUser.id}`, {
    email,
    firstName: clerkUser.first_name,
    lastName: clerkUser.last_name,
    imageUrl: clerkUser.image_url,
    updatedAt: clerkUser.updated_at
      ? new Date(clerkUser.updated_at)
      : new Date(),
  });

  try {
    const result = await prisma.user.upsert({
      where: { clerkId: clerkUser.id },
      update: {
        email,
        firstName: clerkUser.first_name || null,
        lastName: clerkUser.last_name || null,
        imageUrl: clerkUser.image_url || null,
        updatedAt: new Date(),
      },
      create: {
        clerkId: clerkUser.id,
        email,
        firstName: clerkUser.first_name || null,
        lastName: clerkUser.last_name || null,
        imageUrl: clerkUser.image_url || null,
        planType: PlanType.FREE,
        isPremium: false,
        monthlyMessageCount: 0,
        monthlyDocumentCount: 0,
        lastResetDate: new Date(),
        preferredLanguage: "tr",
      },
    });

    console.log(`User synced successfully: ${result.id}`, {
      clerkId: result.clerkId,
      email: result.email,
      imageUrl: result.imageUrl,
    });

    return result;
  } catch (error) {
    console.error(`Failed to sync user ${clerkUser.id}:`, error);
    throw error;
  }
}

// Kullanıcı bilgilerini getir
export async function getUserByClerkId(clerkId: string) {
  return await prisma.user.findUnique({
    where: { clerkId },
    include: {
      subscriptions: {
        where: { status: SubscriptionStatus.ACTIVE },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

// Kullanım limitlerini kontrol et
export async function checkUsageLimits(
  userId: string,
  type: "message" | "document"
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  // Aylık reset kontrolü
  const now = new Date();
  const lastReset = new Date(user.lastResetDate);
  const shouldReset =
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear();

  if (shouldReset) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyMessageCount: 0,
        monthlyDocumentCount: 0,
        lastResetDate: now,
      },
    });
    user.monthlyMessageCount = 0;
    user.monthlyDocumentCount = 0;
  }

  const limits = PLAN_LIMITS[user.planType];

  if (type === "message") {
    const limit = limits.monthlyMessages;
    if (limit !== -1 && user.monthlyMessageCount >= limit) {
      return { allowed: false, current: user.monthlyMessageCount, limit };
    }
  } else if (type === "document") {
    const limit = limits.monthlyDocuments;
    if (limit !== -1 && user.monthlyDocumentCount >= limit) {
      return { allowed: false, current: user.monthlyDocumentCount, limit };
    }
  }

  return {
    allowed: true,
    current:
      type === "message" ? user.monthlyMessageCount : user.monthlyDocumentCount,
    limit:
      type === "message" ? limits.monthlyMessages : limits.monthlyDocuments,
  };
}

// Kullanım sayacını artır
export async function incrementUsage(
  userId: string,
  type: "message" | "document"
) {
  const field =
    type === "message" ? "monthlyMessageCount" : "monthlyDocumentCount";

  await prisma.user.update({
    where: { id: userId },
    data: {
      [field]: { increment: 1 },
    },
  });
}

// Premium durumunu güncelle
export async function updateUserSubscription(
  userId: string,
  planType: PlanType,
  subscriptionData?: {
    subscriptionId: string;
    status: SubscriptionStatus;
    endDate?: Date;
  }
) {
  const isPremium = planType !== PlanType.FREE;

  await prisma.user.update({
    where: { id: userId },
    data: {
      isPremium,
      planType,
      subscriptionId: subscriptionData?.subscriptionId,
      subscriptionStatus: subscriptionData?.status,
      subscriptionEndsAt: subscriptionData?.endDate,
    },
  });

  // Abonelik geçmişine kaydet
  if (subscriptionData) {
    await prisma.subscription.create({
      data: {
        userId,
        planType,
        status: subscriptionData.status,
        startDate: new Date(),
        endDate: subscriptionData.endDate,
        externalId: subscriptionData.subscriptionId,
      },
    });
  }
}
