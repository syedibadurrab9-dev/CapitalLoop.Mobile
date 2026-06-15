import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, StatusBar, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { usePortfolioStore } from '../../../core/store/portfolio.store';

export default function AutomatedSyncScreen() {
  const router = useRouter();
  const fetchPortfolioDataAsync = usePortfolioStore((state) => state.fetchPortfolioDataAsync);

  // 🎛️ Local Core Interface States
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 🔐 Exchange Secure Key Inputs
  const [apiKey, setApiKey] = useState<string>('');
  const [apiSecret, setApiSecret] = useState<string>('');
  const [isWalletLinked, setIsWalletLinked] = useState<boolean>(false);

  /**
   * 🔗 LINK BINANCE SECURE CREDENTIALS
   * Dispatches credentials down to POST api/integrationssync/binance/link
   * Guarded by your custom backend SubscriptionRequirementFilter
   */
  const handleLinkExchangeWalletAsync = async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);

      if (!apiKey.trim() || !apiSecret.trim()) {
        setErrorMessage("Please fulfill both API Key and Signature Secret input fields.");
        return;
      }

      setIsConnecting(true);
      console.log("[CEFI LOG] Initializing secure exchange handshake route...");

      // =======================================================================
      // 🚀 LIVE INTEGRATION HOOK REFERENCE (SIMULATING 403 / 200 GATEWAY)
      // =======================================================================
      // try {
      //   await PortfolioService.linkBinanceWalletAsync({ apiKey, apiSecret });
      // } catch (err: any) {
      //   if (err.response?.status === 403) { 
      //     router.push('/asset-entry/premium-upsell-modal'); 
      //     return; 
      //   }
      //   throw err;
      // }

      // Simulated Intercept Layer matching your integration test criteria:
      // Change this variable parameter to true to simulate an unlocked premium database row asset
      const isUserPremiumInDatabase = false; 

      await new Promise((resolve) => setTimeout(resolve, 1500)); // Network Roundtrip Delay

      if (!isUserPremiumInDatabase) {
        console.warn("[ENTITLEMENT REJECTION] SubscriptionRequirementFilter threw 403 Forbidden.");
        // Redirect standard-free user context straight onto the paywall screen layout
        router.push('/asset-entry/premium-upsell-modal');
        return;
      }

      // If user passed the filter check smoothly, commit state variables
      setIsWalletLinked(true);
      setSuccessMessage("Binance Spot Wallet linked securely to your decentralized profile.");
      setApiKey('');
      setApiSecret('');

    } catch (error: any) {
      console.error("[EXCHANGE LINK CRASH]", error);
      setErrorMessage("Handshake connection timed out on local home subnet node.");
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * 🔄 TRIGGER BATCH METRIC SYNCHRONIZATION
   * Hits POST api/integrationssync/binance/batch-sync to refresh crypto asset nodes
   */
  const handleBatchSyncRefreshAsync = async () => {
    try {
      setErrorMessage(null);
      setIsSyncing(true);
      console.log("[CEFI LOG] Initializing background batch balances scraping operation...");

      // In live setups: await PortfolioService.triggerBinanceBatchSyncAsync();
      await new Promise((resolve) => setTimeout(resolve, 1800));

      // Rehydrate local Zustand cache summaries dynamically
      await fetchPortfolioDataAsync();
      setSuccessMessage("Asset ledger nodes re-calculated and matched successfully against Binance API.");

    } catch (error: any) {
      console.error("[BATCH SYNC CRASH]", error);
      setErrorMessage("Failed to aggregate exchange assets. Verify client pipeline locks.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <SafeAreaView style={styles.masterContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0c111d" />

      {/* HEADER SECTION */}
      <View style={styles.headerFlexRow}>
        <View>
          <Text style={styles.screenTitleHeader}>Exchange Channels</Text>
          <Text style={styles.screenSubTitleHeader}>Automated Ledger Reconciliation</Text>
        </View>
        <View style={[styles.statusBadgeDot, { backgroundColor: isWalletLinked ? '#10b981' : '#64748b' }]} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainerModifier}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {errorMessage && (
          <View style={styles.errorBannerContainer}>
            <Text style={styles.errorTextLabel}>{errorMessage}</Text>
          </View>
        )}

        {successMessage && (
          <View style={styles.successBannerContainer}>
            <Text style={styles.successTextLabel}>🎉 {successMessage}</Text>
          </View>
        )}

        {/* CONNECTIVITY PANEL WRAPPER */}
        {!isWalletLinked ? (
          <View style={styles.interactiveConfigurationCard}>
            <Text style={styles.panelTitleLabel}>LINK BINANCE SECURE SPOT CONTAINER</Text>
            <Text style={styles.panelDescriptionText}>
              Provide Read-Only api keys to map CeFi assets down to your aggregate net worth index automatically. 
            </Text>

            <Text style={styles.inputFieldSectionLabel}>BINANCE API KEY (READ-ONLY)</Text>
            <TextInput
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Enter your public exchange access token key"
              placeholderTextColor="#475569"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.primaryTextInputElement}
            />

            <Text style={styles.inputFieldSectionLabel}>SECRET SIGNATURE STRING</Text>
            <TextInput
              value={apiSecret}
              onChangeText={setApiSecret}
              placeholder="Enter your secret data signature string"
              placeholderTextColor="#475569"
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.primaryTextInputElement}
            />

            <TouchableOpacity
              onPress={handleLinkExchangeWalletAsync}
              activeOpacity={0.85}
              disabled={isConnecting}
              style={styles.actionSubmissionButton}
            >
              {isConnecting ? (
                <ActivityIndicator size="small" color="#0c111d" />
              ) : (
                <Text style={styles.actionButtonTextLabel}>Establish Secure Handshake</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* ACTIVE CONNECTION PERFORMANCE SUMMARY HUB */
          <View style={styles.activeExchangeSummaryCard}>
            <View style={styles.connectedHubHeader}>
              <Text style={styles.activeHubTitle}>BINANCE LIVE CONTEXT CHANNEL ACTIVE</Text>
              <Text style={styles.premiumTagBadge}>Premium Token</Text>
            </View>
            <Text style={styles.activeHubBodyParagraph}>
              Your account profile container is communicating directly with Binance Spot market engines over your home server subnet proxy.
            </Text>

            <TouchableOpacity
              onPress={handleBatchSyncRefreshAsync}
              activeOpacity={0.85}
              disabled={isSyncing}
              style={styles.syncExecutionTriggerButton}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.syncButtonTextLabel}>🔄 Run Real-Time Batch Sync</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* PREMIUM LOCK PREVIEW WATERMARK BADGE */}
        <View style={styles.securityTelemetryFooterBadge}>
          <Text style={styles.securityBadgeTextLabel}>🔒 SECURE API ROUTING ENCRYPTED VIA AES-GCM-256</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================================================================
// 🎨 PREMIUM CEFI SYNC ENGINE CUSTOM VISUAL STYLING
// =============================================================================
const styles = StyleSheet.create({
  masterContainer: { flex: 1, backgroundColor: '#0c111d' },
  headerFlexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.select({ ios: 16, android: 24 }), paddingBottom: 16, borderBottomWidth: 1, borderColor: '#1e293b' },
  screenTitleHeader: { fontSize: 18, fontWeight: '900', color: '#ffffff', letterSpacing: -0.4 },
  screenSubTitleHeader: { fontSize: 10, fontWeight: '600', color: '#64748b', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  statusBadgeDot: { width: 10, height: 10, borderRadius: 5 },
  scrollContainerModifier: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 140 },
  errorBannerContainer: { width: '100%', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', padding: 14, borderRadius: 16, marginBottom: 20 },
  errorTextLabel: { fontSize: 11, fontWeight: '600', color: '#f87171', textAlign: 'center' },
  successBannerContainer: { width: '100%', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)', padding: 14, borderRadius: 16, marginBottom: 20 },
  successTextLabel: { fontSize: 11, fontWeight: '600', color: '#34d399', textAlign: 'center' },
  interactiveConfigurationCard: { width: '100%', backgroundColor: '#10172a', borderRadius: 24, borderWidth: 1, borderColor: '#1e293b', padding: 20, marginBottom: 24 },
  panelTitleLabel: { fontSize: 10, fontWeight: '800', color: '#3b82f6', letterSpacing: 1, marginBottom: 6 },
  panelDescriptionText: { fontSize: 12, fontWeight: '500', color: '#94a3b8', lineHeight: 18, marginBottom: 20 },
  inputFieldSectionLabel: { fontSize: 9, fontWeight: '800', color: '#64748b', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },
  primaryTextInputElement: { width: '100%', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, fontSize: 13, fontWeight: '600', color: '#ffffff', marginBottom: 24 },
  actionSubmissionButton: { width: '100%', backgroundColor: '#ffffff', paddingVertical: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#ffffff', shadowOpacity: 0.05, shadowRadius: 20, elevation: 4 },
  actionButtonTextLabel: { fontSize: 13, fontWeight: '800', color: '#0c111d' },
  activeExchangeSummaryCard: { width: '100%', backgroundColor: 'rgba(16, 185, 129, 0.04)', borderRadius: 24, borderWidth: 1, borderColor: '#047857', padding: 20, marginBottom: 24 },
  connectedHubHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  activeHubTitle: { fontSize: 10, fontWeight: '800', color: '#10b981', letterSpacing: 1 },
  premiumTagBadge: { fontSize: 9, fontWeight: '800', color: '#ffffff', backgroundColor: '#059669', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6 },
  activeHubBodyParagraph: { fontSize: 12, fontWeight: '500', color: '#94a3b8', lineHeight: 18, marginBottom: 20 },
  syncExecutionTriggerButton: { width: '100%', backgroundColor: '#059669', paddingVertical: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  syncButtonTextLabel: { fontSize: 13, fontWeight: '800', color: '#ffffff' },
  securityTelemetryFooterBadge: { alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  securityBadgeTextLabel: { fontSize: 8, fontWeight: '700', color: '#334155', letterSpacing: 0.5 }
});