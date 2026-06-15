import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { usePortfolioStore } from '../../../core/store/portfolio.store';

export default function PremiumUpsellModalScreen() {
  const router = useRouter();
  const fetchPortfolioDataAsync = usePortfolioStore((state) => state.fetchPortfolioDataAsync);
  
  // 🎛️ Local Payment Processing States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * 💳 SIMULATE PAYPRO LOCAL CHECKOUT SANDBOX LOOP
   * In production, this executes a web-view handoff or posts to api/billing/checkout.
   * For our integration test matrix, it updates the user's local context and forces cache sync.
   */
  const handlePayProCheckoutSandboxAsync = async () => {
    try {
      setErrorMessage(null);
      setIsProcessing(true);
      
      console.log("[BILLING LOG] Initializing local PayPro checkout infrastructure session...");

      // RESOLVED: Repaired the malformed double arrow mapping loop to allow strict type inference
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 2000);
      });

      console.log("[BILLING LOG] PayPro Payment Intent 200 OK. Transaction ID: TXN-PAYPRO-995133");
      
      // UPDATE [dbo].[Users] SET [SubscriptionTier] = 'premium' WHERE [Email] = 'syedibad335@gmail.com';
      console.log("[STORE ACTION] Subscriptions updated. Forcing refresh across portfolio state...");
      await fetchPortfolioDataAsync();

      // Dismiss the paywall view frame and roll back smoothly to allow access to exchange panels
      router.back();

    } catch (error: any) {
      console.error("[PAYPRO SANDBOX CRASH]", error);
      setErrorMessage("PayPro gateway processing handshake failed. Please verify network routing.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.masterContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0c111d" />
      
      {/* GLOWING AMBIENT TOP BACKGROUND ACCENT */}
      <View style={styles.goldGlowingRadialBackground} />

      <ScrollView 
        contentContainerStyle={styles.scrollContainerModifier}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP DISMISS ACCESS BUTTON */}
        <TouchableOpacity onPress={() => router.back()} style={styles.closeDismissCrossBadge}>
          <Text style={styles.closeDismissTextLabel}>✕ Close</Text>
        </TouchableOpacity>

        {/* CROWN INTRO BRANDING ICON BLOCK */}
        <View style={styles.crownContainerFlexCenter}>
          <View style={styles.goldCrownShieldBox}>
            <Text style={styles.crownEmojiGlyph}>👑</Text>
          </View>
          <Text style={styles.upsellMainHeaderTitle}>Upgrade to Premium</Text>
          <Text style={styles.upsellSubHeaderToken}>Unlock Unlimited Automated Synchronizations</Text>
        </View>

        {errorMessage && (
          <View style={styles.errorBannerContainer}>
            <Text style={styles.errorTextLabel}>{errorMessage}</Text>
          </View>
        )}

        {/* VALUE PRICING METRIC BANNER */}
        <View style={styles.pricingStructureHighlightCard}>
          <Text style={styles.pricingTierLabel}>CAPITALLOOP PRO ACCOUNT PLAN</Text>
          <Text style={styles.pricingPkrLabel}>
            PKR 1,500 <Text style={styles.pricingFrequencySpan}>/ month</Text>
          </Text>
          <Text style={styles.pricingBilledSubText}>Billed securely via local PayPro processing tokens</Text>
        </View>

        {/* VALUE PROPOSITION CORE CHECKLIST MATRIX */}
        <Text style={styles.inputFieldSectionLabel}>PREMIUM CAPABILITIES INCLUDED</Text>
        
        <View style={styles.featureItemizedRow}>
          <Text style={styles.checkIconGlyph}>✓</Text>
          <View style={styles.featureTextStack}>
            <Text style={styles.featureHeadingTitle}>Automated Exchange Linking Node</Text>
            <Text style={styles.featureBodyParagraph}>Connect Read-Only Binance Spot API access keys directly to track balances without manual compilation.</Text>
          </View>
        </View>

        <View style={styles.featureItemizedRow}>
          <Text style={styles.checkIconGlyph}>✓</Text>
          <View style={styles.featureTextStack}>
            <Text style={styles.featureHeadingTitle}>Real-Time PSX Index Scraping</Text>
            <Text style={styles.featureBodyParagraph}>Your aggregate wealth metrics automatically react to daily market price actions across the Pakistan Stock Exchange.</Text>
          </View>
        </View>

        <View style={styles.featureItemizedRow}>
          <Text style={styles.checkIconGlyph}>✓</Text>
          <View style={styles.featureTextStack}>
            <Text style={styles.featureHeadingTitle}>Algorithmic Portfolio Risk Analytics</Text>
            <Text style={styles.featureBodyParagraph}>Unlocks complete access to Module 4 Robo-Advisory engines and SECP-compliant asset allocation models.</Text>
          </View>
        </View>

        {/* CHECKOUT SUBMISSION TRIGGER HANDLE */}
        <TouchableOpacity
          onPress={handlePayProCheckoutSandboxAsync}
          activeOpacity={0.85}
          disabled={isProcessing}
          style={styles.payproExecutionTriggerButton}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#0c111d" />
          ) : (
            <Text style={styles.checkoutButtonTextLabel}>Activate Instantly via PayPro Sandbox</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.fbrTaxFilerNoticeDisclaimer}>
          🔒 Shariah Compliant Asset Management Framework. Cancel subscription at any time via individual profile configuration views.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  masterContainer: { flex: 1, backgroundColor: '#0c111d' },
  goldGlowingRadialBackground: { position: 'absolute', top: -150, alignSelf: 'center', width: 400, height: 350, borderRadius: 200, backgroundColor: 'rgba(234, 179, 8, 0.04)' },
  scrollContainerModifier: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 60 },
  closeDismissCrossBadge: { alignSelf: 'flex-end', backgroundColor: '#1e293b', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  closeDismissTextLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8' },
  crownContainerFlexCenter: { alignItems: 'center', marginVertical: 24 },
  goldCrownShieldBox: { width: 64, height: 64, borderRadius: 22, backgroundColor: 'rgba(234, 179, 8, 0.08)', borderWidth: 1, borderColor: 'rgba(234, 179, 8, 0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  crownEmojiGlyph: { fontSize: 26, textAlign: 'center' },
  upsellMainHeaderTitle: { fontSize: 22, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5, textAlign: 'center' },
  upsellSubHeaderToken: { fontSize: 12, fontWeight: '500', color: '#64748b', textAlign: 'center', marginTop: 6, paddingHorizontal: 12 },
  errorBannerContainer: { width: '100%', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', padding: 14, borderRadius: 16, marginBottom: 20 },
  errorTextLabel: { fontSize: 11, fontWeight: '600', color: '#f87171', textAlign: 'center' },
  pricingStructureHighlightCard: { width: '100%', backgroundColor: '#111827', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(234, 179, 8, 0.25)', padding: 20, alignItems: 'center', marginBottom: 28 },
  pricingTierLabel: { fontSize: 9, fontWeight: '800', color: '#eab308', letterSpacing: 1.5, marginBottom: 6 },
  pricingPkrLabel: { fontSize: 26, fontWeight: '900', color: '#ffffff' },
  pricingFrequencySpan: { fontSize: 14, fontWeight: '500', color: '#64748b' },
  pricingBilledSubText: { fontSize: 11, fontWeight: '500', color: '#475569', marginTop: 8 },
  inputFieldSectionLabel: { fontSize: 9, fontWeight: '800', color: '#64748b', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 16 },
  featureItemizedRow: { flexDirection: 'row', width: '100%', marginBottom: 20, alignItems: 'flex-start' },
  checkIconGlyph: { fontSize: 14, fontWeight: '900', color: '#10b981', marginRight: 14, marginTop: 2 },
  featureTextStack: { flex: 1 },
  featureHeadingTitle: { fontSize: 13, fontWeight: '800', color: '#ffffff' },
  featureBodyParagraph: { fontSize: 11, fontWeight: '500', color: '#64748b', lineHeight: 16, marginTop: 4 },
  payproExecutionTriggerButton: { width: '100%', backgroundColor: '#eab308', paddingVertical: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#eab308', shadowOpacity: 0.15, shadowRadius: 20, elevation: 4, marginTop: 16, marginBottom: 20 },
  checkoutButtonTextLabel: { fontSize: 13, fontWeight: '800', color: '#0c111d' },
  fbrTaxFilerNoticeDisclaimer: { fontSize: 10, fontWeight: '500', color: '#334155', textAlign: 'center', lineHeight: 15, paddingHorizontal: 16 }
});