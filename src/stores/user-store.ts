import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { PlanType } from "@prisma/client";

// Types
export interface UserData {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  planType: PlanType;
  isPremium: boolean;
  monthlyMessageCount: number;
  monthlyDocumentCount: number;
  lastResetDate: string;
  preferredLanguage: string;
  subscriptionStatus?: string;
  subscriptionEndsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecentActivity {
  id: string;
  type: "message" | "document";
  title: string;
  timestamp: string;
  status: string;
}

// Plan limits
export const PLAN_LIMITS = {
  FREE: { messages: 10, documents: 2 },
  BASIC: { messages: 100, documents: 10 },
  PREMIUM: { messages: 1000, documents: 50 },
  ENTERPRISE: { messages: -1, documents: -1 },
} as const;

interface UserStore {
  // State
  user: UserData | null;
  recentActivity: RecentActivity[];
  loading: boolean;
  error: string | null;
  lastFetch: number;

  // Actions
  fetchUser: () => Promise<void>;
  updateUsage: (
    type: "message" | "document",
    optimistic?: boolean
  ) => Promise<void>;
  updatePreferences: (
    preferences: Partial<Pick<UserData, "preferredLanguage">>
  ) => Promise<void>;
  updateProfile: (
    profile: Partial<Pick<UserData, "firstName" | "lastName">>
  ) => Promise<void>;
  updateSettings: (settings: any) => Promise<void>;
  fetchSettings: () => Promise<any>;
  setUser: (user: UserData) => void;
  setRecentActivity: (activity: RecentActivity[]) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed getters
  canSendMessage: () => boolean;
  canUploadDocument: () => boolean;
  remainingMessages: () => number;
  remainingDocuments: () => number;
  getUsagePercentage: (type: "message" | "document") => number;
  shouldRefetch: () => boolean;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      recentActivity: [],
      loading: false,
      error: null,
      lastFetch: 0,

      // Actions
      fetchUser: async () => {
        const state = get();

        // Don't fetch if we have recent data (less than 5 minutes old)
        if (state.shouldRefetch() === false) {
          return;
        }

        set({ loading: true, error: null });

        try {
          const response = await fetch("/api/user/profile");

          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }

          const data = await response.json();

          set({
            user: data.user,
            recentActivity: data.recentActivity || [],
            loading: false,
            lastFetch: Date.now(),
            error: null,
          });
        } catch (error) {
          console.error("Error fetching user:", error);
          set({
            loading: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      },

      updateUsage: async (type: "message" | "document", optimistic = true) => {
        const state = get();
        if (!state.user) return;

        // Optimistic update
        if (optimistic) {
          const field =
            type === "message" ? "monthlyMessageCount" : "monthlyDocumentCount";
          set({
            user: {
              ...state.user,
              [field]: state.user[field] + 1,
            },
          });
        }

        try {
          // Background sync to server
          const response = await fetch("/api/user/usage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type }),
          });

          if (!response.ok) {
            throw new Error("Failed to update usage");
          }

          // If not optimistic, update with server response
          if (!optimistic) {
            const data = await response.json();
            set({ user: data.user });
          }
        } catch (error) {
          console.error("Error updating usage:", error);

          // Revert optimistic update on error
          if (optimistic && state.user) {
            const field =
              type === "message"
                ? "monthlyMessageCount"
                : "monthlyDocumentCount";
            set({
              user: {
                ...state.user,
                [field]: Math.max(0, state.user[field] - 1),
              },
              error: "Failed to update usage",
            });
          }
        }
      },

      updatePreferences: async (preferences) => {
        const state = get();
        if (!state.user) return;

        // Optimistic update
        set({
          user: { ...state.user, ...preferences },
        });

        try {
          const response = await fetch("/api/user/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(preferences),
          });

          if (!response.ok) {
            throw new Error("Failed to update preferences");
          }

          const data = await response.json();
          set({
            user: { ...state.user, ...data.user },
            error: null,
          });
        } catch (error) {
          console.error("Error updating preferences:", error);

          // Revert optimistic update
          set({
            user: state.user,
            error: "Failed to update preferences",
          });
        }
      },

      updateProfile: async (profile) => {
        const state = get();
        if (!state.user) return;

        // Optimistic update
        set({
          user: { ...state.user, ...profile },
        });

        try {
          const response = await fetch("/api/user/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profile),
          });

          if (!response.ok) {
            throw new Error("Failed to update profile");
          }

          const data = await response.json();
          set({
            user: { ...state.user, ...data.user },
            error: null,
          });
        } catch (error) {
          console.error("Error updating profile:", error);

          // Revert optimistic update
          set({
            user: state.user,
            error: "Failed to update profile",
          });
        }
      },

      updateSettings: async (settings) => {
        try {
          const response = await fetch("/api/user/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings),
          });

          if (!response.ok) {
            throw new Error("Failed to update settings");
          }

          const data = await response.json();
          return data.settings;
        } catch (error) {
          console.error("Error updating settings:", error);
          throw error;
        }
      },

      fetchSettings: async () => {
        try {
          const response = await fetch("/api/user/settings");

          if (!response.ok) {
            throw new Error("Failed to fetch settings");
          }

          const data = await response.json();
          return data.settings;
        } catch (error) {
          console.error("Error fetching settings:", error);
          throw error;
        }
      },

      setUser: (user) => set({ user, lastFetch: Date.now() }),

      setRecentActivity: (recentActivity) => set({ recentActivity }),

      clearUser: () =>
        set({
          user: null,
          recentActivity: [],
          error: null,
          lastFetch: 0,
        }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      // Computed getters
      canSendMessage: () => {
        const state = get();
        if (!state.user) return false;

        const limits = PLAN_LIMITS[state.user.planType];
        return (
          limits.messages === -1 ||
          state.user.monthlyMessageCount < limits.messages
        );
      },

      canUploadDocument: () => {
        const state = get();
        if (!state.user) return false;

        const limits = PLAN_LIMITS[state.user.planType];
        return (
          limits.documents === -1 ||
          state.user.monthlyDocumentCount < limits.documents
        );
      },

      remainingMessages: () => {
        const state = get();
        if (!state.user) return 0;

        const limits = PLAN_LIMITS[state.user.planType];
        if (limits.messages === -1) return Infinity;

        return Math.max(0, limits.messages - state.user.monthlyMessageCount);
      },

      remainingDocuments: () => {
        const state = get();
        if (!state.user) return 0;

        const limits = PLAN_LIMITS[state.user.planType];
        if (limits.documents === -1) return Infinity;

        return Math.max(0, limits.documents - state.user.monthlyDocumentCount);
      },

      getUsagePercentage: (type: "message" | "document") => {
        const state = get();
        if (!state.user) return 0;

        const limits = PLAN_LIMITS[state.user.planType];
        const limit = type === "message" ? limits.messages : limits.documents;
        const used =
          type === "message"
            ? state.user.monthlyMessageCount
            : state.user.monthlyDocumentCount;

        if (limit === -1) return 0; // Unlimited
        return Math.min(100, (used / limit) * 100);
      },

      shouldRefetch: () => {
        const state = get();
        const fiveMinutes = 5 * 60 * 1000;
        return Date.now() - state.lastFetch > fiveMinutes;
      },
    }),
    {
      name: "jurisgen-user-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        recentActivity: state.recentActivity,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
