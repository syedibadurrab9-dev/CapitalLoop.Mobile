import { create } from 'zustand';
import { StorageService } from '../services/storage.service';
import { SubscriptionTier, isMobileAccessPermitted } from '../constants/subscription-tiers';
import { ApplicationUserClaims } from '../types/auth.types';

interface AuthState {
  isAuthenticated: boolean;
  isHydrated: boolean;
  userClaims: ApplicationUserClaims | null;
  subscriptionTier: SubscriptionTier | null;
  channelAccessDenied: boolean;
  
  // 🎛️ Action Core Matrix
  hydrateSessionAsync: () => Promise<void>;
  setAuthenticatedSessionAsync: (accessToken: string, refreshToken: string, claims: ApplicationUserClaims) => Promise<boolean>;
  terminateSessionAsync: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isHydrated: false,
  userClaims: null,
  subscriptionTier: null,
  channelAccessDenied: false,

  /**
   * 🔄 BOOTSTRAP HYDRATION MECHANIC
   * Evaluates hardware keychain tokens right on mobile application boot loop
   */
  hydrateSessionAsync: async () => {
    try {
      const token = await StorageService.getAccessToken();
      const claims = await StorageService.getUserClaims();

      if (token && claims) {
        // Enforce ABAC Front-Gate Isolation: Check for corporate contamination on boot
        if (!isMobileAccessPermitted(claims.subscriptionTier)) {
          await StorageService.purgeAuthSession();
          set({ isAuthenticated: false, userClaims: null, subscriptionTier: null, channelAccessDenied: true, isHydrated: true });
          return;
        }

        set({ isAuthenticated: true, userClaims: claims, subscriptionTier: claims.subscriptionTier, channelAccessDenied: false });
      }
    } catch (error) {
      console.error("[HYDRATION ERROR] Failed to parse secure storage keys:", error);
      await StorageService.purgeAuthSession();
    } finally {
      set({ isHydrated: true });
    }
  },

  /**
   * 🔐 AUTHENTICATION SIGN-IN EXCHANGER
   * Invoked instantly when Google SSO returns valid authorization claims
   */
  setAuthenticatedSessionAsync: async (accessToken, refreshToken, claims) => {
    // 🚨 ABAC BOUNDARY ENFORCEMENT POINT
    if (!isMobileAccessPermitted(claims.subscriptionTier)) {
      console.error(`[ABAC SECURITY BLOCK] Corporate user '${claims.email}' rejected from mobile channel channel vector.`);
      await StorageService.purgeAuthSession();
      set({ isAuthenticated: false, userClaims: null, subscriptionTier: null, channelAccessDenied: true });
      return false; // Signifies channel violation state
    }

    // Persist to secure encrypted keychain hardware layer
    await StorageService.saveAuthSession(accessToken, refreshToken, claims);
    
    set({ isAuthenticated: true, userClaims: claims, subscriptionTier: claims.subscriptionTier, channelAccessDenied: false });
    return true; // Success pass-gate clean
  },

  /**
   * 🧼 SYSTEM WORKSPACE PURGE LOOP
   * Clears out in-memory caches, active structures, and storage keys on user logout
   */
  terminateSessionAsync: async () => {
    await StorageService.purgeAuthSession();
    set({ isAuthenticated: false, userClaims: null, subscriptionTier: null, channelAccessDenied: false });
  }
}));