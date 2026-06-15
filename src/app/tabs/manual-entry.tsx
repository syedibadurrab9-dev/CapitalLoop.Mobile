import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, StatusBar, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { CreateManualAssetCommand } from '../../core/types/portfolio.types';

type AssetCategory = 'PSX Equity' | 'Precious Metal' | 'Crypto' | 'Mutual Fund';

export default function ManualEntryScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 🎛️ Form State Configuration
  const [assetName, setAssetName] = useState<string>('');
  const [category, setCategory] = useState<AssetCategory>('PSX Equity');
  const [valuationPkr, setValuationPkr] = useState<string>('');
  const [tickerSymbol, setTickerSymbol] = useState<string>('');
  const [quantityShared, setQuantityShared] = useState<string>('');
  const [weightInTolas, setWeightInTolas] = useState<string>('');
  const [purchasePriceBasis, setPurchasePriceBasis] = useState<string>('');

  /**
   * 📤 DISPATCH MANUAL TRANSACTION ENTRY LOOP
   * Fires payload straight down your Home LAN pipeline to hit MediatR: CreateManualAssetCommand
   */
  const handleFormSubmissionAsync = async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);

      // Invariant Check: Core baseline field metrics validation
      if (!assetName.trim() || !valuationPkr.trim()) {
        setErrorMessage("Please fulfill absolute Asset Designation Label and Fiat Valuation fields.");
        return;
      }

      setIsSubmitting(true);

      // Map raw inputs to strict API data contracts
      const commandPayload: CreateManualAssetCommand = {
        name: assetName.trim(),
        category: category,
        valuationPkr: parseFloat(valuationPkr),
        tickerSymbol: category === 'PSX Equity' || category === 'Crypto' ? tickerSymbol.trim().toUpperCase() : undefined,
        quantityShared: category === 'PSX Equity' || category === 'Crypto' ? parseFloat(quantityShared) : undefined,
        weightInTolas: category === 'Precious Metal' ? parseFloat(weightInTolas) : undefined,
        purchasePriceBasis: purchasePriceBasis ? parseFloat(purchasePriceBasis) : undefined,
      };

      console.log("[NETWORK LOG] Dispatched payload data frame to local Kestrel server...", commandPayload);

      // =======================================================================
      // 🚀 LIVE INTEGRATION HOOK REFERENCE
      // =======================================================================
      // const success = await PortfolioService.createManualAssetAsync(commandPayload);
      // if (success) { ... }
      
      // Simulate clean database insertion into [dbo.AssetNodes] over Home LAN link
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setSuccessMessage(`Asset successfully committed to your secure ledger!`);
      
      // Reset form variables smoothly
      setAssetName('');
      setValuationPkr('');
      setTickerSymbol('');
      setQuantityShared('');
      setWeightInTolas('');
      setPurchasePriceBasis('');

    } catch (error: any) {
      console.error("[FORM EXECUTION FAILURE]", error);
      setErrorMessage("Failed to write manual node data. Check backend Kestrel link logs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.masterContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0c111d" />

      <View style={styles.headerFlexRow}>
        <Text style={styles.screenTitleHeader}>Add Asset Node</Text>
        <Text style={styles.shariahBadgeToken}>Shariah Core</Text>
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

        {/* CATEGORY VARIANT SELECTOR SEGMENT MATRIX */}
        <Text style={styles.inputFieldSectionLabel}>SELECT ASSET CLASSIFICATION</Text>
        <View style={styles.segmentedTabRow}>
          {(['PSX Equity', 'Precious Metal', 'Crypto', 'Mutual Fund'] as AssetCategory[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => { setCategory(tab); setErrorMessage(null); }}
              activeOpacity={0.8}
              style={[styles.segmentButton, category === tab && styles.segmentButtonActive]}
            >
              <Text style={[styles.segmentButtonText, category === tab && styles.segmentButtonTextActive]}>
                {tab === 'Precious Metal' ? 'Metals' : tab.replace('PSX ', '')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* GENERAL METRIC FIELDS */}
        <Text style={styles.inputFieldSectionLabel}>ASSET CONTAINER NAME</Text>
        <TextInput
          value={assetName}
          onChangeText={setAssetName}
          placeholder="e.g., Meezan Bank Limited Shares or 10 Tolas Bull Silver"
          placeholderTextColor="#475569"
          style={styles.primaryTextInputElement}
        />

        <Text style={styles.inputFieldSectionLabel}>CURRENT TOTAL VALUE (PKR)</Text>
        <TextInput
          value={valuationPkr}
          onChangeText={setValuationPkr}
          placeholder="e.g., 152500"
          placeholderTextColor="#475569"
          keyboardType="numeric"
          style={styles.primaryTextInputElement}
        />

        {/* DYNAMIC FIELD RENDERING LOGIC BASED ON SELECTED SEGMENT BOX */}
        {category === 'Precious Metal' && (
          <View>
            <Text style={styles.inputFieldSectionLabel}>WEIGHT IN TOLAS</Text>
            <TextInput
              value={weightInTolas}
              onChangeText={setWeightInTolas}
              placeholder="e.g., 10"
              placeholderTextColor="#475569"
              keyboardType="numeric"
              style={styles.primaryTextInputElement}
            />
          </View>
        )}

        {(category === 'PSX Equity' || category === 'Crypto') && (
          <View>
            <Text style={styles.inputFieldSectionLabel}>TICKER IDENTIFIER SYMBOL</Text>
            <TextInput
              value={tickerSymbol}
              onChangeText={setTickerSymbol}
              placeholder={category === 'PSX Equity' ? "e.g., MEBL, SYS, ENGRO" : "e.g., BTC, ETH"}
              placeholderTextColor="#475569"
              autoCapitalize="characters"
              style={styles.primaryTextInputElement}
            />

            <Text style={styles.inputFieldSectionLabel}>TOTAL ACCUMULATED UNITS / SHARES</Text>
            <TextInput
              value={quantityShared}
              onChangeText={setQuantityShared}
              placeholder="e.g., 1200"
              placeholderTextColor="#475569"
              keyboardType="numeric"
              style={styles.primaryTextInputElement}
            />
          </View>
        )}

        <Text style={styles.inputFieldSectionLabel}>HISTORICAL PRICE BASIS PER UNIT (OPTIONAL)</Text>
        <TextInput
          value={purchasePriceBasis}
          onChangeText={setPurchasePriceBasis}
          placeholder="e.g., 15250"
          placeholderTextColor="#475569"
          keyboardType="numeric"
          style={styles.primaryTextInputElement}
        />

        {/* FORM SUBMISSION INTERACTIVE TRIGGER BLOCK */}
        <TouchableOpacity
          onPress={handleFormSubmissionAsync}
          activeOpacity={0.85}
          disabled={isSubmitting}
          style={[styles.actionSubmissionButton, isSubmitting && styles.buttonDisabledState]}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#0c111d" />
          ) : (
            <Text style={styles.actionButtonTextLabel}>Commit Node To Ledger</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================================================================
// 🎨 PREMIUM TRANSACTION FORM VISUAL ENGINE STYLING
// =============================================================================
const styles = StyleSheet.create({
  masterContainer: { flex: 1, backgroundColor: '#0c111d' },
  headerFlexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.select({ ios: 16, android: 24 }), paddingBottom: 16, borderBottomWidth: 1, borderColor: '#1e293b' },
  screenTitleHeader: { fontSize: 18, fontWeight: '900', color: '#ffffff', letterSpacing: -0.4 },
  shariahBadgeToken: { fontSize: 9, fontWeight: '800', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, textTransform: 'uppercase' },
  scrollContainerModifier: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 140 },
  errorBannerContainer: { width: '100%', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', padding: 14, borderRadius: 16, marginBottom: 20 },
  errorTextLabel: { fontSize: 11, fontWeight: '600', color: '#f87171', textAlign: 'center' },
  successBannerContainer: { width: '100%', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)', padding: 14, borderRadius: 16, marginBottom: 20 },
  successTextLabel: { fontSize: 11, fontWeight: '600', color: '#34d399', textAlign: 'center' },
  inputFieldSectionLabel: { fontSize: 9, fontWeight: '800', color: '#64748b', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },
  segmentedTabRow: { flexDirection: 'row', backgroundColor: '#0f172a', padding: 4, borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', marginBottom: 24 },
  segmentButton: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  segmentButtonActive: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  segmentButtonText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  segmentButtonTextActive: { color: '#ffffff' },
  primaryTextInputElement: { width: '100%', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, fontSize: 13, fontWeight: '600', color: '#ffffff', marginBottom: 24 },
  actionSubmissionButton: { width: '100%', backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#10b981', shadowOpacity: 0.1, shadowRadius: 20, elevation: 4, marginTop: 12 },
  buttonDisabledState: { opacity: 0.6 },
  actionButtonTextLabel: { fontSize: 13, fontWeight: '800', color: '#0c111d' },
});