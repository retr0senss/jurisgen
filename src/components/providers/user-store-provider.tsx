"use client";

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUserStore } from '@/stores/user-store';

interface UserStoreProviderProps {
  children: React.ReactNode;
}

export function UserStoreProvider({ children }: UserStoreProviderProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { fetchUser, clearUser, user: storeUser } = useUserStore();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && user) {
        // User is signed in, fetch user data if not already loaded
        if (!storeUser || storeUser.clerkId !== user.id) {
          fetchUser();
        }
      } else {
        // User is signed out, clear store
        clearUser();
      }
    }
  }, [isLoaded, isSignedIn, user, fetchUser, clearUser, storeUser]);

  return <>{children}</>;
} 