import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  StatusBar, 
  Platform,
  DimensionValue // 🚀 Required for strict width dimension typing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../core/store/auth.store';
import { PortfolioSummaryDto, AssetNodeDto } from '../../core/types/portfolio.types';

export default function DashboardScreen() {
  const router = useRouter();
  const userClaims = useAuthStore((state) => state.userClaims);
  const terminateSessionAsync = useAuthStore((state) => state.terminateSessionAsync);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<PortfolioSummaryDto | null>(null);
  const [assets, setAssets] = useState<AssetNodeDto[]>([]);

  const fetchLedgerDataAsync = async () => {
    try {
      setIsLoading(true);

      const simulatedSummary: PortfolioSummaryDto = {
        totalNetWorthPkr: 9652500,
        totalNetWorthUsd: 34671.33,
        baseCurrency: 'PKR',
        assetCount: 5,
        lastCalculatedUtc: new Date().toISOString()
      };

      const simulatedAssets: AssetNodeDto[] = [
        {
          id: "sys-101",
          name: "AKD Brokerage Account",
          category: "PSX Equity",
          valuationPkr: 3500000,
          createdUtc: new Date().toISOString(),
          assetMetrics: { tickerSymbol: "SYS", quantityShared: 1200, purchasePriceBasis: 510 }
        },
        {
          id: "mzn-202",
          name: "Al Meezan Mutual Funds",
          category: "Mutual Fund",
          valuationPkr: 2500000,
          createdUtc: new Date().toISOString(),
          assetMetrics: { quantityShared: 15430, purchasePriceBasis: 50 }
        },
        {
          id: "bin-303",
          name: "Binance Spot Wallet",
          category: "Crypto",
          valuationPkr: 1500000,
          createdUtc: new Date().toISOString(),
          assetMetrics: { tickerSymbol: "BTC", quantityShared: 0.05, purchasePriceBasis: 20854000 }
        },
        {
          id: "slv-404",
          name: "Physical Silver Tolas Vault",
          category: "Precious Metal",
          valuationPkr: 152500,
          createdUtc: new Date().toISOString(),
          assetMetrics: { weightInTolas: 10, purchasePriceBasis: 15250 }
        },
        {
          id: "dha-505",
          name: "DHA Lahore Phase 9 File",
          category: "Real Estate",
          valuationPkr: 2000000,
          createdUtc: new Date().toISOString(),
          assetMetrics: { quantityShared: 1, purchasePriceBasis: 2000000 }
        }
      ];

      setSummary(simulatedSummary);
      setAssets(simulatedAssets);
    } catch (error) {
      console.error("[DASHBOARD DATA REFRESH CRASH]", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerDataAsync();
  }, []);

  const handleSystemSignOutAsync = async () => {
    await terminateSessionAsync();
    router.replace('/auth/login');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PSX Equity': return '#3b82f6';     
      case 'Mutual Fund': return '#10b981';    
      case 'Crypto': return '#f59e0b';         
      case 'Precious Metal': return '#06b6d4'; 
      case 'Real Estate': return '#ec4899';    
      default: return '#64748b';               
    }
  };

  const totalValuation = assets.reduce((sum, item) => sum + item.valuationPkr, 0) || 1;

  return (
    <SafeAreaView style={styles.masterContainer} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f6fa" />

      <View style={styles.tickerBannerBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tickerScrollContent}>
          <Text style={styles.tickerTokenText}>⚡ Gold Spot Price: <Text style={styles.tickerGreenPrice}>Rs. 242,000/Tola</Text></Text>
          <Text style={styles.tickerDivider}>|</Text>
          <Text style={styles.tickerTokenText}>⚡ Silver Spot Price: <Text style={styles.tickerGreenPrice}>Rs. 15,250/10 Tolas</Text></Text>
        </ScrollView>
      </View>

      <View style={styles.headerFlexRow}>
        <View>
          <Text style={styles.welcomeBackSubLabel}>WELCOME BACK</Text>
          <Text style={styles.userDisplayMoniker}>{userClaims?.displayName || "Irha Fatima"}</Text>
        </View>
        <View style={styles.subscriptionBadgeCapsule}>
          <View style={styles.badgeIndicatorDot} />
          <Text style={styles.subscriptionBadgeText}>
            {(userClaims?.subscriptionTier || 'standard-free').toUpperCase()}
          </Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainerModifier} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.netWorthMainCard}>
          <Text style={styles.netWorthCardSubLabel}>TOTAL NET WORTH</Text>
          <View style={styles.netWorthCurrencyFlexRow}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#10b981" />
            ) : (
              <Text style={styles.netWorthValueHeader}>
                Rs. ${(summary?.totalNetWorthPkr ?? totalValuation).toLocaleString('en-PK')}
              </Text>
            )}
            <View style={styles.currencyStaticBadge}>
              <Text style={styles.currencyStaticText}>PKR</Text>
            </View>
          </View>
        </View>

        <View style={styles.whiteAggregateContainerCard}>
          <Text style={styles.sectionHeaderLabel}>PORTFOLIO SPLIT</Text>
          
          <View style={styles.segmentedProgressBarWrapper}>
            {assets.map((item) => {
              const weight = ((item.valuationPkr / totalValuation) * 100).toFixed(1);
              return (
                <View 
                  key={`bar-${item.id}`} 
                  style={[
                    styles.barSegment, 
                    { 
                      width: `${weight}%` as DimensionValue, // 🚀 FIXED TYPE INLINE
                      backgroundColor: getCategoryColor(item.category) 
                    }
                  ]} 
                />
              );
            })}
          </View>

          <View style={styles.legendMetricsContainer}>
            {assets.map((item) => {
              const weight = ((item.valuationPkr / totalValuation) * 100).toFixed(1);
              return (
                <View key={`legend-${item.id}`} style={styles.legendRowItem}>
                  <View style={styles.legendLeftBlock}>
                    <View style={[styles.legendColorDot, { backgroundColor: getCategoryColor(item.category) }]} />
                    <Text style={styles.legendLabelText}>{item.name}</Text>
                  </View>
                  <Text style={styles.legendPercentageText}>{weight}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.groupPanelSectionTitle}>QUICK SHORTCUTS</Text>
        <View style={styles.shortcutsGridLayoutFlexRow}>
          <TouchableOpacity style={styles.shortcutSquareActionButton} activeOpacity={0.8} onPress={() => router.push('/(tabs)/manual-entry')}>
            <View style={styles.shortcutIconCircleWrapper}>
              <Text style={styles.glyphCenterIcon}>📁</Text>
            </View>
            <Text style={styles.shortcutButtonLabelText}>Add Assets</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shortcutSquareActionButton} activeOpacity={0.8} onPress={fetchLedgerDataAsync}>
            <View style={styles.shortcutIconCircleWrapper}>
              <Text style={styles.glyphCenterIcon}>🔄</Text>
            </View>
            <Text style={styles.shortcutButtonLabelText}>Polly Sync</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.assetsListHeaderFlexRow}>
          <Text style={styles.groupPanelSectionTitle}>ACTIVE ASSETS LIST</Text>
          <View style={styles.totalCountCapsulePill}>
            <Text style={styles.totalCountCapsuleText}>{assets.length} Total</Text>
          </View>
        </View>

        <View style={styles.assetListCardStackWrapper}>
          {assets.map((item) => (
            <View key={item.id} style={styles.assetListItemContainerRow}>
              <View>
                <Text style={styles.assetNodeItemMainTitleName}>{item.name}</Text>
                <View style={styles.metaBadgeLayoutFlexRow}>
                  <Text style={styles.metaBadgeCategoryText}>{item.category.toUpperCase()}</Text>
                  <View style={styles.metaBadgeLabelCapsule}>
                    <Text style={styles.metaBadgeLabelText}>MANUAL LEDGER</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.assetNodeItemValueText}>Rs. {item.valuationPkr.toLocaleString('en-PK')}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={handleSystemSignOutAsync} activeOpacity={0.7} style={styles.systemSignOutAnchorButton}>
          <Text style={styles.systemSignOutAnchorText}>Securely Sever Active Session Link</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  masterContainer: { flex: 1, backgroundColor: '#f4f6fa' }, 
  tickerBannerBar: { width: '100%', backgroundColor: '#0c111d', height: 32, justifyContent: 'center' },
  tickerScrollContent: { paddingHorizontal: 16, alignItems: 'center' },
  tickerTokenText: { fontSize: 10, fontWeight: '700', color: '#64748b' },
  tickerGreenPrice: { color: '#10b981', fontWeight: '800' },
  tickerDivider: { color: '#1e293b', marginHorizontal: 12, fontSize: 10 },
  scrollContainerModifier: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 60 },
  headerFlexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }, // 🚀 FIXED SHORTHAND 'pb'
  welcomeBackSubLabel: { fontSize: 9, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5 },
  userDisplayMoniker: { fontSize: 24, fontWeight: '800', color: '#1e293b', marginTop: 2, letterSpacing: -0.5 },
  subscriptionBadgeCapsule: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6fdf5', borderWidth: 1, borderColor: '#a7f3d0', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 99 },
  badgeIndicatorDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#10b981', marginRight: 6 },
  subscriptionBadgeText: { fontSize: 9, fontWeight: '800', color: '#047857', letterSpacing: 0.5 },
  netWorthMainCard: { width: '100%', backgroundColor: '#0f172a', borderRadius: 28, padding: 24, shadowColor: '#000000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 6, marginBottom: 24 },
  netWorthCardSubLabel: { fontSize: 9, fontWeight: '700', color: '#64748b', letterSpacing: 0.5, marginBottom: 8 },
  netWorthCurrencyFlexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  netWorthValueHeader: { fontSize: 30, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5 },
  currencyStaticBadge: { backgroundColor: '#1e293b', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  currencyStaticText: { fontSize: 10, fontWeight: '800', color: '#cbd5e1' },
  whiteAggregateContainerCard: { width: '100%', backgroundColor: '#ffffff', borderRadius: 28, padding: 24, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1, marginBottom: 24 },
  sectionHeaderLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5, marginBottom: 16 },
  segmentedProgressBarWrapper: { width: '100%', height: 7, borderRadius: 99, backgroundColor: '#f1f5f9', overflow: 'hidden', flexDirection: 'row', marginBottom: 20 },
  barSegment: { height: '100%' },
  legendMetricsContainer: { paddingTop: 4 },
  legendRowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  legendLeftBlock: { flexDirection: 'row', alignItems: 'center' },
  legendColorDot: { width: 6, height: 6, borderRadius: 3, marginRight: 12 },
  legendLabelText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  legendPercentageText: { fontSize: 12, fontWeight: '800', color: '#1e293b' },
  groupPanelSectionTitle: { fontSize: 11, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5, marginBottom: 12, paddingLeft: 2 },
  shortcutsGridLayoutFlexRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  shortcutSquareActionButton: { flex: 1, backgroundColor: '#ffffff', borderRadius: 24, paddingVertical: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 6, elevation: 1 },
  shortcutIconCircleWrapper: { width: 36, height: 32, borderRadius: 12, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 8 },
  glyphCenterIcon: { fontSize: 14, color: '#475569' },
  shortcutButtonLabelText: { fontSize: 11, fontWeight: '700', color: '#1e293b' },
  assetsListHeaderFlexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 2 },
  totalCountCapsulePill: { backgroundColor: '#eff6ff', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 99, marginBottom: 12 },
  totalCountCapsuleText: { fontSize: 10, fontWeight: '800', color: '#2563eb' },
  assetListCardStackWrapper: { gap: 12 },
  assetListItemContainerRow: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.01, shadowRadius: 4, elevation: 1 },
  assetNodeItemMainTitleName: { fontSize: 13, fontWeight: '700', color: '#1e293b', maxWidth: 180 },
  metaBadgeLayoutFlexRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 },
  metaBadgeCategoryText: { fontSize: 8, fontWeight: '700', color: '#94a3b8' },
  metaBadgeLabelCapsule: { backgroundColor: '#f1f5f9', paddingVertical: 1, paddingHorizontal: 4, borderRadius: 4 },
  metaBadgeLabelText: { fontSize: 8, fontWeight: '700', color: '#64748b' },
  assetNodeItemValueText: { fontSize: 13, fontWeight: '800', color: '#1e293b' },
  emptyLedgerStatePlaceholder: { width: '100%', backgroundColor: '#ffffff', borderRadius: 20, padding: 24, alignItems: 'center' },
  emptyStateParagraph: { fontSize: 12, fontWeight: '500', color: '#64748b', textAlign: 'center' },
  systemSignOutAnchorButton: { width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: 40, paddingVertical: 12 },
  systemSignOutAnchorText: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textDecorationLine: 'underline' }
});