import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { PortfolioChart } from '../components/PortfolioChart';

interface MarketRecommendation {
  id: string;
  assetName: string;
  ticker: string;
  assetClass: 'PSX Equities' | 'Sovereign Sukuk' | 'Physical Gold';
  signal: 'BUY' | 'HOLD' | 'WATCH';
  priceDisplay: string;
  deltaDisplay: string;
  isPositive: boolean;
  thesis: string;
  horizon: string;
  riskClass: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  invalidationCondition: string;
  freshness: string;
}

const MARKET_RECOMMENDATIONS: MarketRecommendation[] = [
  {
    id: 'rec-1',
    assetName: 'Engro Corporation',
    ticker: 'PSX:ENGRO',
    assetClass: 'PSX Equities',
    signal: 'BUY',
    priceDisplay: '₨ 318.40',
    deltaDisplay: '+1.85%',
    isPositive: true,
    thesis: 'Robust fertilizer export margins and dollar-pegged cash flows offer strong macroeconomic resilience.',
    horizon: '6–12 Months',
    riskClass: 'Moderate Risk',
    invalidationCondition: 'Feedstock gas tariff increase exceeding 25% or KSE-100 breach below 82,000.',
    freshness: '2m ago • PSX KATS'
  },
  {
    id: 'rec-2',
    assetName: 'GoP 5Y Sovereign Ijarah Sukuk',
    ticker: 'GoP/SBP Sukuk',
    assetClass: 'Sovereign Sukuk',
    signal: 'BUY',
    priceDisplay: '₨ 100.00',
    deltaDisplay: '14.85% Yield',
    isPositive: true,
    thesis: 'Government of Pakistan asset-backed Shariah sovereign sukuk locking fixed real yield above projected inflation.',
    horizon: '1–3 Years',
    riskClass: 'Low Risk',
    invalidationCondition: 'Monetary Policy Committee cuts policy rate below 11.5% unexpectedly.',
    freshness: '15m ago • SBP Interbank'
  },
  {
    id: 'rec-3',
    assetName: '24K Gold Tola Bullion',
    ticker: 'Karachi Sarafa 24K',
    assetClass: 'Physical Gold',
    signal: 'HOLD',
    priceDisplay: '₨ 284,500',
    deltaDisplay: '+0.42%',
    isPositive: true,
    thesis: 'Strategic wealth preservation hedge against USDPKR devaluation; currently consolidating near local peak.',
    horizon: '3–5 Years',
    riskClass: 'Low Risk',
    invalidationCondition: 'International spot bullion breaks below $2,400/oz with stable PKR reserves.',
    freshness: '8m ago • PMEX/Sarafa'
  },
  {
    id: 'rec-4',
    assetName: 'Hub Power Company',
    ticker: 'PSX:HUBC',
    assetClass: 'PSX Equities',
    signal: 'BUY',
    priceDisplay: '₨ 124.50',
    deltaDisplay: '+2.10%',
    isPositive: true,
    thesis: 'High forward dividend yield (> 17%) supported by Thar coal energy expansion and diversified industrial investments.',
    horizon: '6–12 Months',
    riskClass: 'Moderate Risk',
    invalidationCondition: 'Power sector circular debt accumulation halts intermediate dividend payouts.',
    freshness: '5m ago • PSX KATS'
  },
  {
    id: 'rec-5',
    assetName: 'Lucky Cement Limited',
    ticker: 'PSX:LUCK',
    assetClass: 'PSX Equities',
    signal: 'WATCH',
    priceDisplay: '₨ 912.00',
    deltaDisplay: '-0.65%',
    isPositive: false,
    thesis: 'Automotive and chemical subsidiaries provide strong diversification while domestic cement dispatch consolidates.',
    horizon: '12+ Months',
    riskClass: 'High Risk',
    invalidationCondition: 'Imported coal energy costs surge above $120/ton or construction slowdown deepens.',
    freshness: '12m ago • PSX KATS'
  }
];

export default function LiveChartsScreen() {
  const assets = useSelector((state: RootState) => state.portfolio.assets);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PSX' | 'SUKUK' | 'GOLD'>('ALL');

  const filteredRecs = MARKET_RECOMMENDATIONS.filter(item => {
    if (activeFilter === 'PSX') return item.assetClass === 'PSX Equities';
    if (activeFilter === 'SUKUK') return item.assetClass === 'Sovereign Sukuk';
    if (activeFilter === 'GOLD') return item.assetClass === 'Physical Gold';
    return true;
  });

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[]}
    >
      {/* ==============================================================================
           HERO HEADER (OBSIDIAN INVETO ARCHITECTURE #0E141D)
           ============================================================================== */}
      <View style={styles.heroHeader}>
        <View style={styles.govSealPill}>
          <Text style={styles.govSealPillText}>🇵🇰 SBP & SECP MARKET INTELLIGENCE NODE</Text>
        </View>

        <Text style={styles.heroTitle}>Macro & Recommendations</Text>
        <Text style={styles.heroSubtitle}>
          Real-time Pakistani financial market telemetry, institutional recommendations, and statutory exposure audit.
        </Text>

        <View style={styles.telemetryStatusStrip}>
          <View style={styles.pulseDot} />
          <Text style={styles.telemetryStatusText}>
            Sentiment: <Text style={{ color: '#10B981', fontWeight: '800' }}>Neutral-Bullish</Text> • KATS FIX Live (52ms)
          </Text>
        </View>
      </View>

      {/* ==============================================================================
           CURVED WHITE CANVAS SHEET
           ============================================================================== */}
      <View style={styles.sheetCanvas}>
        
        {/* SECTION: NATIONAL BENCHMARKS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>National Market Benchmarks</Text>
          <Text style={styles.sectionBadge}>SBP / PSX FEEDS</Text>
        </View>

        <View style={styles.macroGrid}>
          {/* PSX KSE-100 */}
          <View style={styles.macroCard}>
            <View style={styles.macroRow}>
              <Text style={styles.macroLabel}>PSX KSE-100</Text>
              <View style={styles.macroDeltaUp}><Text style={styles.macroDeltaTxt}>▲ +0.73%</Text></View>
            </View>
            <Text style={styles.macroVal}>85,240.15</Text>
            <Text style={styles.macroSub}>+620.40 pts • Vol: 412M</Text>
          </View>

          {/* 24K GOLD */}
          <View style={styles.macroCard}>
            <View style={styles.macroRow}>
              <Text style={styles.macroLabel}>Sarafa 24K Gold</Text>
              <View style={styles.macroDeltaUp}><Text style={styles.macroDeltaTxt}>▲ +0.42%</Text></View>
            </View>
            <Text style={[styles.macroVal, { color: '#D97706' }]}>₨ 284,500</Text>
            <Text style={styles.macroSub}>Per Tola • Bullion Spot</Text>
          </View>

          {/* USD / PKR */}
          <View style={styles.macroCard}>
            <View style={styles.macroRow}>
              <Text style={styles.macroLabel}>SBP USD/PKR</Text>
              <View style={styles.macroDeltaDown}><Text style={styles.macroDeltaDownTxt}>▼ -0.05%</Text></View>
            </View>
            <Text style={[styles.macroVal, { color: '#0284C7' }]}>₨ 278.45</Text>
            <Text style={styles.macroSub}>Interbank Weighted Avg</Text>
          </View>

          {/* KIBOR / Policy Rate */}
          <View style={styles.macroCard}>
            <View style={styles.macroRow}>
              <Text style={styles.macroLabel}>6M KIBOR</Text>
              <View style={styles.macroNeutral}><Text style={styles.macroNeutralTxt}>MPC Hold</Text></View>
            </View>
            <Text style={[styles.macroVal, { color: '#059669' }]}>14.85%</Text>
            <Text style={styles.macroSub}>Policy Rate: 15.00%</Text>
          </View>
        </View>

        {/* SECTION: INSTITUTIONAL MARKET RECOMMENDATIONS */}
        <View style={[styles.sectionHeaderRow, { marginTop: 22 }]}>
          <Text style={styles.sectionTitle}>Institutional Recommendations</Text>
          <Text style={styles.sectionBadge}>SECP DECISION SUPPORT</Text>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillRow}>
          <TouchableOpacity 
            style={[styles.filterPill, activeFilter === 'ALL' && styles.filterPillActive]}
            onPress={() => setActiveFilter('ALL')}
          >
            <Text style={[styles.filterPillTxt, activeFilter === 'ALL' && styles.filterPillTxtActive]}>All ({MARKET_RECOMMENDATIONS.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterPill, activeFilter === 'PSX' && styles.filterPillActive]}
            onPress={() => setActiveFilter('PSX')}
          >
            <Text style={[styles.filterPillTxt, activeFilter === 'PSX' && styles.filterPillTxtActive]}>PSX Equities</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterPill, activeFilter === 'SUKUK' && styles.filterPillActive]}
            onPress={() => setActiveFilter('SUKUK')}
          >
            <Text style={[styles.filterPillTxt, activeFilter === 'SUKUK' && styles.filterPillTxtActive]}>Sovereign Sukuk</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterPill, activeFilter === 'GOLD' && styles.filterPillActive]}
            onPress={() => setActiveFilter('GOLD')}
          >
            <Text style={[styles.filterPillTxt, activeFilter === 'GOLD' && styles.filterPillTxtActive]}>24K Bullion</Text>
          </TouchableOpacity>
        </View>

        {/* Recommendation Cards */}
        <View style={styles.recsListContainer}>
          {filteredRecs.map(rec => (
            <View key={rec.id} style={styles.recCard}>
              
              {/* Header: Asset Name & Signal Badge */}
              <View style={styles.recHeaderRow}>
                <View style={styles.recTitleGroup}>
                  <Text style={styles.recAssetName}>{rec.assetName}</Text>
                  <Text style={styles.recTicker}>{rec.ticker} • {rec.assetClass}</Text>
                </View>

                <View style={[
                  styles.recSignalBadge, 
                  rec.signal === 'BUY' ? styles.signalBuy : rec.signal === 'HOLD' ? styles.signalHold : styles.signalWatch
                ]}>
                  <Text style={[
                    styles.recSignalText,
                    rec.signal === 'BUY' ? styles.signalBuyTxt : rec.signal === 'HOLD' ? styles.signalHoldTxt : styles.signalWatchTxt
                  ]}>
                    {rec.signal}
                  </Text>
                </View>
              </View>

              {/* Price & Delta Metrics */}
              <View style={styles.recPriceRow}>
                <Text style={styles.recPriceVal}>{rec.priceDisplay}</Text>
                <View style={[styles.recDeltaPill, rec.isPositive ? styles.recDeltaPos : styles.recDeltaNeg]}>
                  <Text style={[styles.recDeltaTxt, rec.isPositive ? styles.recDeltaPosTxt : styles.recDeltaNegTxt]}>
                    {rec.deltaDisplay}
                  </Text>
                </View>
                <Text style={styles.recFreshnessTxt}>{rec.freshness}</Text>
              </View>

              {/* Investment Thesis Block */}
              <View style={styles.thesisBox}>
                <Text style={styles.thesisLabel}>INVESTMENT THESIS</Text>
                <Text style={styles.thesisContent}>{rec.thesis}</Text>
              </View>

              {/* Horizon & Risk Row */}
              <View style={styles.recMetaPillRow}>
                <View style={styles.metaChip}>
                  <Text style={styles.metaChipTxt}>⏱️ {rec.horizon}</Text>
                </View>
                <View style={[styles.metaChip, rec.riskClass === 'Low Risk' ? styles.chipLowRisk : rec.riskClass === 'Moderate Risk' ? styles.chipModRisk : styles.chipHighRisk]}>
                  <Text style={[styles.metaChipTxt, { fontWeight: '700' }]}>🛡️ {rec.riskClass}</Text>
                </View>
              </View>

              {/* Invalidation Trigger Warning */}
              <View style={styles.invalidationBox}>
                <Text style={styles.invalidationText}>
                  ⚠️ <Text style={{ fontWeight: '700' }}>Invalidation Factor:</Text> {rec.invalidationCondition}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Regulatory Disclosure Box */}
        <View style={styles.disclosureBox}>
          <Text style={styles.disclosureTxt}>
            ⚖️ <Text style={{ fontWeight: '700' }}>Statutory Disclaimer:</Text> Recommendations represent algorithmic and accredited advisor decision-support signals under SECP Sandbox Directive FS-2026-084. Past performance does not guarantee future financial yields.
          </Text>
        </View>

        {/* SECTION: ASSET ALLOCATION BREAKDOWN */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Portfolio Balance Exposure</Text>
          <Text style={styles.sectionBadge}>REAL-TIME ALLOCATION</Text>
        </View>
        <PortfolioChart assets={assets} />

        {/* SECTION: STATUTORY REGULATORY BOUNDS MATRIX */}
        <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Statutory Regulatory Matrix</Text>
          <Text style={styles.sectionBadge}>SECP / SBP / FBR</Text>
        </View>

        <View style={styles.complianceCard}>
          <View style={styles.complianceRow}>
            <View style={styles.complianceMeta}>
              <Text style={styles.complianceTitle}>SBP Circular BPRD/2026/04</Text>
              <Text style={styles.complianceSub}>Non-Custodial Multi-Asset Boundary</Text>
            </View>
            <View style={styles.statusPillGreen}>
              <Text style={styles.statusPillTxtGreen}>✓ 100% PASS</Text>
            </View>
          </View>

          <View style={styles.complianceDivider} />

          <View style={styles.complianceRow}>
            <View style={styles.complianceMeta}>
              <Text style={styles.complianceTitle}>SECP Sandbox FS-2026-084</Text>
              <Text style={styles.complianceSub}>Equity Allocation Ceiling (Max 35%)</Text>
            </View>
            <View style={styles.statusPillGreen}>
              <Text style={styles.statusPillTxtGreen}>✓ 28.4% PASS</Text>
            </View>
          </View>

          <View style={styles.complianceDivider} />

          <View style={styles.complianceRow}>
            <View style={styles.complianceMeta}>
              <Text style={styles.complianceTitle}>FBR Active Taxpayers List (ATL)</Text>
              <Text style={styles.complianceSub}>Automated 15% vs 30% WHT Verification</Text>
            </View>
            <View style={styles.statusPillGreen}>
              <Text style={styles.statusPillTxtGreen}>✓ ATL ACTIVE</Text>
            </View>
          </View>

          <View style={styles.complianceDivider} />

          <View style={styles.complianceRow}>
            <View style={styles.complianceMeta}>
              <Text style={styles.complianceTitle}>PDPB / PECA Sovereign DC</Text>
              <Text style={styles.complianceSub}>Islamabad Tier-IV Encrypted Vault</Text>
            </View>
            <View style={styles.statusPillBlue}>
              <Text style={styles.statusPillTxtBlue}>🔒 RESIDENT</Text>
            </View>
          </View>
        </View>

        {/* SECTION: LIVE MARKET TELEMETRY STREAMS */}
        <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Live Telemetry Feeds</Text>
          <Text style={styles.sectionBadge}>LOW LATENCY</Text>
        </View>

        <View style={styles.feedCard}>
          <View style={styles.feedItemRow}>
            <View style={styles.feedDotGreen} />
            <View style={styles.feedMeta}>
              <Text style={styles.feedTitle}>PSX KATS FIX Feed (Karachi)</Text>
              <Text style={styles.feedSub}>Real-time equities execution stream • 52ms latency</Text>
            </View>
            <Text style={styles.feedPrice}>LIVE</Text>
          </View>

          <View style={styles.feedDivider} />

          <View style={styles.feedItemRow}>
            <View style={styles.feedDotGreen} />
            <View style={styles.feedMeta}>
              <Text style={styles.feedTitle}>PMEX Bullion Gateway (Sarafa)</Text>
              <Text style={styles.feedSub}>24K pure bullion spot pricing • 38ms latency</Text>
            </View>
            <Text style={styles.feedPrice}>LIVE</Text>
          </View>

          <View style={styles.feedDivider} />

          <View style={styles.feedItemRow}>
            <View style={styles.feedDotGreen} />
            <View style={styles.feedMeta}>
              <Text style={styles.feedTitle}>SBP Interbank Portal (Karachi)</Text>
              <Text style={styles.feedSub}>Central Bank authorized FX settlement • 84ms latency</Text>
            </View>
            <Text style={styles.feedPrice}>LIVE</Text>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0E141D',
  },
  heroHeader: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    backgroundColor: '#0E141D',
  },
  govSealPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
    marginBottom: 10,
  },
  govSealPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 12,
  },
  telemetryStatusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  telemetryStatusText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  sheetCanvas: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 48,
    minHeight: 800,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  macroCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  macroDeltaUp: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  macroDeltaTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  macroDeltaDown: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  macroDeltaDownTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
  },
  macroNeutral: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  macroNeutralTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  macroVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
    marginBottom: 2,
  },
  macroSub: {
    fontSize: 10,
    color: '#64748B',
  },
  filterPillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterPillTxt: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  filterPillTxtActive: {
    color: '#FFFFFF',
  },
  recsListContainer: {
    gap: 12,
  },
  recCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  recHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  recTitleGroup: {
    flex: 1,
    paddingRight: 10,
  },
  recAssetName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  recTicker: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  recSignalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  signalBuy: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  signalBuyTxt: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
  },
  signalHold: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  signalHoldTxt: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '800',
  },
  signalWatch: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  signalWatchTxt: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '800',
  },
  recSignalText: {
    letterSpacing: 0.5,
  },
  recPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  recPriceVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
  },
  recDeltaPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recDeltaPos: {
    backgroundColor: '#ECFDF5',
  },
  recDeltaPosTxt: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
  },
  recDeltaNeg: {
    backgroundColor: '#FEF2F2',
  },
  recDeltaNegTxt: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '800',
  },
  recDeltaTxt: {
    fontVariant: ['tabular-nums'],
  },
  recFreshnessTxt: {
    fontSize: 10,
    color: '#94A3B8',
    marginLeft: 'auto',
  },
  thesisBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 10,
  },
  thesisLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  thesisContent: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
  },
  recMetaPillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  metaChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipLowRisk: {
    backgroundColor: '#ECFDF5',
  },
  chipModRisk: {
    backgroundColor: '#FFFBEB',
  },
  chipHighRisk: {
    backgroundColor: '#FEF2F2',
  },
  metaChipTxt: {
    fontSize: 10.5,
    color: '#475569',
  },
  invalidationBox: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  invalidationText: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 15,
  },
  disclosureBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  disclosureTxt: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  complianceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  complianceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  complianceMeta: {
    flex: 1,
    paddingRight: 10,
  },
  complianceTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  complianceSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  complianceDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  statusPillGreen: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillTxtGreen: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  statusPillBlue: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillTxtBlue: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
  feedCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  feedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  feedDotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 10,
  },
  feedMeta: {
    flex: 1,
  },
  feedTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  feedSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  feedPrice: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  feedDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  }
});
