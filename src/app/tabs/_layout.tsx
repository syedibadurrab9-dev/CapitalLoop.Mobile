import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../core/store/auth.store';
import { usePortfolioStore } from '../../core/store/portfolio.store';
import { AssetNodeDto } from '../../core/types/portfolio.types';

export default function DashboardScreen() {
  const router = useRouter();
  const userClaims = useAuthStore((state) => state.userClaims);
  const terminateSessionAsync = useAuthStore((state) => state.terminateSessionAsync);
  
  // ⚡ Hook directly into the verified live Zustand state container
  const { summary, assets, isLoading, fetchPortfolioDataAsync } = usePortfolioStore();

  useEffect(() => {
    fetchPortfolioDataAsync();
  }, []);

  const handleSystemSignOutAsync = async () => {
    await terminateSessionAsync();
    router.replace('/login');
  };

  const getCategoryColor = (category: AssetNodeDto['category']) => {
    switch (category) {
      case 'PSX Equity': return '#3b82f6';    
      case 'Precious Metal': return '#eab308'; 
      case 'Crypto': return '#f97316';         
      default: return '#10b981';               
    }
  };

  return (
    <SafeAreaView style={styles.masterContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0c111d" />

      {/* HEADER ROW */}
      <View style={styles.headerFlexRow}>
        <View>
          <Text style={styles.greetingHeaderLabel}>Assalam-o-Alaikum,</Text>
          <Text style={styles.userNameHeaderLabel}>{userClaims?.displayName || "User"}</Text>
        </View>
        <TouchableOpacity onPress={handleSystemSignOutAsync} style={styles.logoutButtonBadge}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainerModifier} showsVerticalScrollIndicator={false}>
        
        {/* HUD: CORE NET WORTH SUMMARY */}
        <View style={styles.netWorthSummaryHudCard}>
          <Text style={styles.hudCardTitleLabel}>DECOUPLED AGGREGATE NET WORTH</Text>
          
          {isLoading && !summary ? (
            <ActivityIndicator size="large" color="#10b981" style={{ marginVertical: 12 }} />
          ) : (
            <View>
              <Text style={styles.primaryPkrMetricLabel}>
                PKR {summary?.totalNetWorthPkr.toLocaleString('en-PK') || '0'}
              </Text>
              <Text style={styles.secondaryUsdMetricLabel}>
                $ {summary?.totalNetWorthUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} USD
              </Text>
            </View>
          )}

          <View style={styles.hudFooterDividerLine} />
          <View style={styles.hudFooterMetricsRow}>
            <Text style={styles.hudFooterSubText}>Containers: {summary?.assetCount || 0}</Text>
            <Text style={styles.hudFooterSubText}>Shariah Compliant Safe</Text>
          </View>
        </View>

        {/* CHANNELS RIBBON */}
        <Text style={styles.sectionHeadingTitle}>Market Channels</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalRibbonFrame}>
          <View style={[styles.ribbonMetricCard, { borderColor: '#3b82f6' }]}>
            <Text style={styles.ribbonCardLabel}>KSE-100 INDEX</Text>
            <Text style={styles.ribbonCardValue}>Blue Chip Tracking</Text>
          </View>
          <View style={[styles.ribbonMetricCard, { borderColor: '#eab308' }]}>
            <Text style={styles.ribbonCardLabel}>PHYSICAL METALS</Text>
            <Text style={styles.ribbonCardValue}>Spot Silver Fixed</Text>
          </View>
          <View style={[styles.ribbonMetricCard, styles.ribbonTerminalOffset, { borderColor: '#f97316' }]}>
            <Text style={styles.ribbonCardLabel}>CEFI ASSETS</Text>
            <Text style={styles.ribbonCardValue}>Binance Connected</Text>
          </View>
        </ScrollView>

        {/* BREAKDOWNS LEDGER LIST */}
        <View style={styles.sectionHeaderRowInline}>
          <Text style={styles.sectionHeadingTitle}>Ledger Breakdowns</Text>
          <TouchableOpacity onPress={fetchPortfolioDataAsync} disabled={isLoading} activeOpacity={0.7}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#10b981" />
            ) : (
              <Text style={styles.inlineRefreshButtonLabel}>🔄 Sync</Text>
            )}
          </TouchableOpacity>
        </View>

        {assets.length === 0 && !isLoading ? (
          <View style={styles.emptyLedgerStatePlaceholder}>
            <Text style={styles.emptyStateParagraph}>No tracked assets recorded inside this profile container yet.</Text>
          </View>
        ) : (
          assets.map((item) => (
            <View key={item.id} style={styles.assetItemizedLedgerCard}>
              <View style={styles.assetCardLeftFlexBox}>
                <View style={[styles.categoryIndicatorVerticalBadge, { backgroundColor: getCategoryColor(item.category) }]} />
                <View style={styles.assetIdentityTextColumn}>
                  <Text style={styles.assetNamePrimaryLabel}>{item.name}</Text>
                  <Text style={styles.assetCategorySubLabelToken}>{item.category}</Text>
                </View>
              </View>
              <View style={styles.assetCardRightValuationColumn}>
                <Text style={styles.assetValuationFiatLabel}>
                  PKR {item.valuationPkr.toLocaleString('en-PK')}
                </Text>
                <Text style={styles.assetMetricsSubDetails}>
                  {item.assetMetrics.quantityShared ? `${item.assetMetrics.quantityShared} units` : `${item.assetMetrics.weightInTolas} Tolas`}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  masterContainer: { flex: 1, backgroundColor: '#0c111d' },
  headerFlexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.select({ ios: 16, android: 24 }), paddingBottom: 16, borderBottomWidth: 1, borderColor: '#1e293b' },
  greetingHeaderLabel: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
  userNameHeaderLabel: { fontSize: 18, fontWeight: '900', color: '#ffffff', letterSpacing: -0.4 },
  logoutButtonBadge: { backgroundColor: '#1e293b', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  logoutButtonText: { fontSize: 11, fontWeight: '800', color: '#94a3b8' },
  scrollContainerModifier: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 120 },
  netWorthSummaryHudCard: { width: '100%', backgroundColor: '#10172a', borderRadius: 24, borderWidth: 1, borderColor: '#1e293b', padding: 24, shadowColor: '#10b981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 24, elevation: 4, marginBottom: 28 },
  hudCardTitleLabel: { fontSize: 9, fontWeight: '800', color: '#10b981', letterSpacing: 1.5, marginBottom: 12 },
  primaryPkrMetricLabel: { fontSize: 28, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 },
  secondaryUsdMetricLabel: { fontSize: 14, fontWeight: '600', color: '#64748b', marginTop: 2 },
  hudFooterDividerLine: { height: 1, backgroundColor: '#1e293b', marginVertical: 18 },
  hudFooterMetricsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hudFooterSubText: { fontSize: 10, fontWeight: '700', color: '#475569', textTransform: 'uppercase' },
  sectionHeadingTitle: { fontSize: 14, fontWeight: '900', color: '#ffffff', letterSpacing: -0.2, marginBottom: 14 },
  horizontalRibbonFrame: { flexDirection: 'row', marginBottom: 28 },
  ribbonMetricCard: { backgroundColor: '#0f172a', borderWidth: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, marginRight: 12, minWidth: 140 },
  ribbonTerminalOffset: { marginRight: 24 },
  ribbonCardLabel: { fontSize: 9, fontWeight: '800', color: '#64748b', letterSpacing: 0.5 },
  ribbonCardValue: { fontSize: 12, fontWeight: '700', color: '#ffffff', marginTop: 4 },
  sectionHeaderRowInline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  inlineRefreshButtonLabel: { fontSize: 11, fontWeight: '700', color: '#10b981' },
  emptyLedgerStatePlaceholder: { width: '100%', backgroundColor: '#0f172a', borderRadius: 16, padding: 24, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#334155' },
  emptyStateParagraph: { fontSize: 12, fontWeight: '500', color: '#64748b', textAlign: 'center', lineHeight: 18 },
  assetItemizedLedgerCard: { width: '100%', backgroundColor: '#0f172a', borderRadius: 18, borderWidth: 1, borderColor: '#1e293b', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  assetCardLeftFlexBox: { flexDirection: 'row', alignItems: 'center' },
  categoryIndicatorVerticalBadge: { width: 4, height: 32, borderRadius: 2, marginRight: 12 },
  assetIdentityTextColumn: { justifyContent: 'center' },
  assetNamePrimaryLabel: { fontSize: 13, fontWeight: '800', color: '#ffffff' },
  assetCategorySubLabelToken: { fontSize: 10, fontWeight: '600', color: '#475569', marginTop: 2 },
  assetCardRightValuationColumn: { alignItems: 'flex-end' },
  assetValuationFiatLabel: { fontSize: 13, fontWeight: '800', color: '#ffffff' },
  assetMetricsSubDetails: { fontSize: 10, fontWeight: '600', color: '#64748b', marginTop: 2 },
});