import * as SecureStore from 'expo-secure-store';
import { ApplicationUserClaims } from '../types/auth.types';

const KEYS = {
  ACCESS_TOKEN: 'cl_access_token',
  REFRESH_TOKEN: 'cl_refresh_token',
  USER_CLAIMS: 'cl_user_claims',
} as const;

export class StorageService {
  /**
   * 🔐 PERSIST AUTHENTICATION SESSION
   * Saves tokens and strongly typed claims natively using hardware-backed encryption.
   */
  public static async saveAuthSession(
    accessToken: string, 
    refreshToken: string, 
    claims: ApplicationUserClaims
  ): Promise<void> {
    const options: SecureStore.SecureStoreOptions = {
      keychainAccessible: SecureStore.WHEN_UNLOCKED
    };

    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken, options);
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken, options);
    await SecureStore.setItemAsync(KEYS.USER_CLAIMS, JSON.stringify(claims), options);
  }

  public static async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  }

  public static async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  }

  /**
   * 🧩 RESOLVE STRONGLY TYPED USER CLAIMS
   * Rehydrates JSON claims string back into type-safe ApplicationUserClaims matrix.
   */
  public static async getUserClaims(): Promise<ApplicationUserClaims | null> {
    const claimsJson = await SecureStore.getItemAsync(KEYS.USER_CLAIMS);
    if (!claimsJson) return null;
    
    try {
      return JSON.parse(claimsJson) as ApplicationUserClaims;
    } catch (error) {
      console.error("[STORAGE SERVICE] Failed to deserialize user claims payload:", error);
      return null;
    }
  }

  /**
   * 🧼 PURGE STORAGE HISTORY
   * Evicts active tracking tokens securely from device storage blocks.
   */
  public static async purgeAuthSession(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.USER_CLAIMS);
  }
}