import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAdvisorStore } from '../../../core/store/advisor.store';
import { TargetAllocationDeficiencyDto } from '../../../core/types/advisor.types';

export default function AllocationMetricsScreen() {
  const router = useRouter();
  
  // ⚡ Bind directly to the global algorithmic store slice
  const { deficiencies, riskProfile, isLoading, fetchTargetAllocationMetricsAsync } = useAdvisorStore();

  useEffect(() => {
    fetchTargetAllocationMetricsAsync();
  }, []);

  const getVarianceColor = (variance: number) => {
    if (variance < 0) return '#f87171'; // Underallocated Deficiency (Red alert)
    if (variance > 5) return '#eab308';  // Overallocated Drift (Amber warning)
    return '#34d399';                    // Perfectly Balanced Target (Emerald green)
  };

  return (
    <SafeAreaView style={styles.masterContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0c111d" />

      {/* HEADER ROW BAR */}
      <View style={styles.headerFlexRow}>
        <View>
          <Text style={styles.screenTitleHeader}>Target Allocation</Text>
          <Text style={styles.screenSubTitleHeader}>SECP Diversification Telemetry</Text>
        </View>
        
        {riskProfile && (
          <View style={styles.riskProfileIndicatorBadge}>
            <Text style={styles.riskProfileBadgeText}>{riskProfile.assignedTier}</Text>
          </View>
        )}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainerModifier}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP STATUS WARNING BLOCK BANNER */}
        <View style={styles.rebalancingAlertCalloutCard}>
          <Text style={styles.calloutMiniHeaderLabel}>PORTFOLIO REBALANCING TELEMETRY</Text>
          <Text style={styles.calloutBodyParagraph}>
            Variance indicators flag deviations from your Shariah compliant risk model targets. Negative gaps denote funding deficiencies.
          </Text>
        </View>

        {/* LIST SECTION DESIGN HEADLINE */}
        <View style={styles.sectionHeaderFlexRowInline}>
          <Text style={styles.sectionHeadingTitle}>Asset Class Variances</Text>
          <TouchableOpacity 
            onPress={fetchTargetAllocationMetricsAsync} 
            disabled={isLoading} 
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#10b981" />
            ) : (
              <Text style={styles.inlineRefreshButtonLabel}>🔄 Sync</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ITERATOR LOOP BED: DEFICIENCY ELEMENT MAP STRINGS */}
        {deficiencies.length === 0 && !isLoading ? (
          <View style={styles.emptyAdvisoryPlaceholderBox}>
            <Text style={styles.emptyStateParagraph}>
              No allocation metrics mapped. Please complete your Risk Suitability Questionnaire wizard session to deploy structural model targets.
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/advisor/suitability-survey')}
              style={styles.onboardingLinkTriggerButton}
            >
              <Text style={styles.onboardingLinkButtonText}>Launch Setup Wizard</Text>
            </TouchableOpacity>
          </View>
        ) : (
          deficiencies.map((item: TargetAllocationDeficiencyDto, index: number) => {
            const isUnderAllocated = item.variancePercentage < 0;
            
            return (
              <View key={`${item.assetCategory}-${index}`} style={styles.metricItemizedLedgerCard}>
                <View style={styles.cardHeaderFlexRow}>
                  <Text style={styles.assetCategoryClassLabel}>{item.assetCategory}</Text>
                  <Text style={[styles.variancePercentageBadgeText, { color: getVarianceColor(item.variancePercentage) }]}>
                    {item.variancePercentage > 0 ? `+${item.variancePercentage}%` : `${item.variancePercentage}%`} Drift
                  </Text>
                </View>

                {/* PROGRESS SEGMENT METRIC VISUAL HORIZONTAL SLIDER BAR */}
                <View style={styles.sliderTrackLineBackground}>
                  <View style={[styles.sliderTargetMarkerDot, { left: `${item.targetPercentage}%` }]} />
                  <View style={[styles.sliderCurrentActiveFill, { width: `${item.currentPercentage}%`, backgroundColor: getVarianceColor(item.variancePercentage) }]} />
                </View>

                <View style={styles.cardFooterDistributionFlexRow}>
                  <Text style={styles.distributionSplitsTextSubLabel}>Current: {item.currentPercentage}%</Text>
                  <Text style={styles.distributionSplitsTextSubLabel}>Target Model: {item.targetPercentage}%</Text>
                </View>

                {/* CONDITIONAL PKRIC ACTION VARIANCE OFFSET STATEMENT LINK */}
                {item.rebalanceRequiredPkr !== 0 && (
                  <View style={styles.rebalanceActionRequiredContainerBox}>
                    <Text style={styles.rebalanceActionAdvicePhraseText}>
                      {isUnderAllocated 
                        ? `⚠️ Allocate extra PKR ${Math.abs(item.rebalanceRequiredPkr).toLocaleString('en-PK')} to clear structural deficit gap.`
                        : `✓ Overfunded surplus of PKR ${item.rebalanceRequiredPkr.toLocaleString('en-PK')}. Reallocate excess inputs.`
                      }
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* BOTTOM REDIRECT TRIGGER HANDLE INTERACTION BLOCK TO CHART CANVAS */}
        {deficiencies.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push('/advisor/wealth-forecast')}
            activeOpacity={0.85}
            style={styles.forwardForecastNavigationActionButton}
          >
            <Text style={styles.forwardActionButtonTextLabel}>Review Compound Growth Forecasts ➔</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================================================================
// 🎨 PREMIUM TELEMETRY GRID INTERFACE ENGINE VISUAL STYLING
// =============================================================================
const styles = StyleSheet.create({
  masterContainer: { flex: 1, backgroundColor: '#0c111d' },
  headerFlexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.select({ ios: 16, android: 24 }), paddingBottom: 16, borderBottomWidth: 1, borderColor: '#1e293b' },
  screenTitleHeader: { fontSize: 18, fontWeight: '900', color: '#ffffff', letterSpacing: -0.4 },
  screenSubTitleHeader: { fontSize: 10, fontWeight: '600', color: '#64748b', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  riskProfileIndicatorBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  riskProfileBadgeText: { fontSize: 11, fontWeight: '800', color: '#10b981', textTransform: 'uppercase' },
  scrollContainerModifier: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 120 },
  rebalancingAlertCalloutCard: { width: '100%', backgroundColor: '#0f172a', borderLeftWidth: 3, borderLeftColor: '#3b82f6', padding: 16, borderRadius: 12, marginBottom: 28 },
  calloutMiniHeaderLabel: { fontSize: 9, fontWeight: '800', color: '#3b82f6', letterSpacing: 1.2, marginBottom: 6 },
  calloutBodyParagraph: { fontSize: 12, fontWeight: '500', color: '#94a3b8', lineHeight: 18 },
  sectionHeaderFlexRowInline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionHeadingTitle: { fontSize: 14, fontWeight: '900', color: '#ffffff', letterSpacing: -0.2 },
  inlineRefreshButtonLabel: { fontSize: 11, fontWeight: '700', color: '#10b981' },
  emptyAdvisoryPlaceholderBox: { width: '100%', backgroundColor: '#0f172a', borderRadius: 20, padding: 32, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#334155', marginTop: 12 },
  emptyStateParagraph: { fontSize: 12, fontWeight: '500', color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  onboardingLinkTriggerButton: { backgroundColor: '#ffffff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  onboardingLinkButtonText: { fontSize: 12, fontWeight: '800', color: '#0c111d' },
  metricItemizedLedgerCard: { width: '100%', backgroundColor: '#0f172a', borderRadius: 20, borderWidth: 1, borderColor: '#1e293b', padding: 18, marginBottom: 12 },
  cardHeaderFlexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  assetCategoryClassLabel: { fontSize: 13, fontWeight: '800', color: '#ffffff' },
  variancePercentageBadgeText: { fontSize: 11, fontWeight: '700' },
  sliderTrackLineBackground: { width: '100%', height: 6, backgroundColor: '#1e293b', borderRadius: 3, position: 'relative', marginBottom: 10 },
  sliderCurrentActiveFill: { height: '100%', borderRadius: 3, position: 'absolute', left: 0, top: 0 },
  sliderTargetMarkerDot: { width: 4, height: 12, backgroundColor: '#ffffff', borderRadius: 2, position: 'absolute', top: -3, zIndex: 10 },
  cardFooterDistributionFlexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  distributionSplitsTextSubLabel: { fontSize: 10, fontWeight: '600', color: '#475569' },
  rebalanceActionRequiredContainerBox: { width: '100%', backgroundColor: '#0a0f1d', borderRadius: 10, padding: 10, marginTop: 12, borderWidth: 1, borderColor: '#1e293b' },
  rebalanceActionAdvicePhraseText: { fontSize: 11, fontWeight: '600', color: '#94a3b8', lineHeight: 15 },
  forwardForecastNavigationActionButton: { width: '100%', backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#10b981', shadowOpacity: 0.1, shadowRadius: 16, elevation: 4, marginTop: 24, marginBottom: 12 },
  forwardActionButtonTextLabel: { fontSize: 13, fontWeight: '800', color: '#0c111d' }
});