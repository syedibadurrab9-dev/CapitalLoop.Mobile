export const SUBSCRIPTION_TIERS = {
  STANDARD_FREE: 'standard-free',
  PREMIUM: 'premium',
  ADVISOR_WEALTH: 'advisor-wealth',
  TAX_CONSULTANT_TIER: 'tax-consultant-tier',
  AGENT_BACKOFFICE: 'agent-backoffice',
} as const;

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];

// ABAC Channel Rule: Mobile layout access is strictly reserved for consumer retail accounts
export const isMobileAccessPermitted = (tier: string): boolean => {
  return tier === SUBSCRIPTION_TIERS.STANDARD_FREE || tier === SUBSCRIPTION_TIERS.PREMIUM;
};