import { SubscriptionTier } from '../constants/subscription-tiers';

// 🎯 This maps your backend properties to support local Zustand session storage allocations
export interface ApplicationUserClaims {
  sub?: string;            // Google Identity Provider Sub Claim ID
  userId?: string;         // System Database Key Guid reference
  email: string;
  displayName: string;
  subscriptionTier: SubscriptionTier;
  isKycVerified: boolean;  // Added cleanly here to satisfy your ABAC gate requirements
  exp?: number;
}

// 🚀 FIXED KEY CONTRACT MAP: Perfectly mirrors the C# AuthResultDto serialization properties
export interface AuthResultDto {
  accessToken: string;
  identityEmail: string;        // Matches public string IdentityEmail
  displayMoniker: string;       // Matches public string DisplayMoniker
  currentAssignedTier: string;  // Matches public string CurrentAssignedTier
  isProfileKycVerified: boolean;// Matches public bool IsProfileKycVerified
  tokenExpirationTimestampUtc: string; // Serialized ISO string timestamp reference
}