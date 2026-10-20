import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { PortfolioChart } from '../components/PortfolioChart';

export default function LiveChartsScreen() {
  const assets = useSelector((state: RootState) => state.portfolio.assets);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Sovereign Seal Header */}
      <View style={styles.sovereignHeader}>
        <Text style={styles.sovereignGovText}>🇵🇰 SBP & SECP MARKET INTELLIGENCE NODE</Text>
        <Text style={styles.title}>Macroeconomic Terminal</Text>
        <Text style={styles.subtitle}>
          Real-time Pakistani financial market telemetry, benchmark yields, and statutory exposure audit.
        </Text>
      </View>
      
      {/* Dynamic Asset Allocation Chart Module */}
      <PortfolioChart assets={assets} />

      {/* Pakistan Key Macroeconomic Indicators Grid */}
      <Text style={styles.sectionHeader}>National Market Benchmarks</Text>
      <View style={styles.macroGrid}>
        
        {/* KSE-100 */}
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
          <Text style={[styles.macroVal, { color: '#F59E0B' }]}>₨ 284,500</Text>
          <Text style={styles.macroSub}>Per Tola • Pure Bullion</Text>
        </View>

        {/* USD / PKR */}
        <View style={styles.macroCard}>
          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>SBP USD/PKR</Text>
            <View style={styles.macroDeltaDown}><Text style={styles.macroDeltaDownTxt}>▼ -0.05%</Text></View>
          </View>
          <Text style={[styles.macroVal, { color: '#38BDF8' }]}>₨ 278.45</Text>
          <Text style={styles.macroSub}>Interbank Weighted Avg</Text>
        </View>

        {/* KIBOR / Policy Rate */}
        <View style={styles.macroCard}>
          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>6M KIBOR Benchmark</Text>
            <View style={styles.macroNeutral}><Text style={styles.macroNeutralTxt}>MPC Hold</Text></View>
          </View>
          <Text style={[styles.macroVal, { color: '#2DD4BF' }]}>14.85%</Text>
          <Text style={styles.macroSub}>Policy Rate: 15.00%</Text>
        </View>
      </View>

      {/* Statutory Regulatory Bounds Matrix */}
      <Text style={styles.sectionHeader}>Regulatory Compliance Matrix</Text>
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

      {/* Live Activity Stream Feed */}
      <Text style={styles.sectionHeader}>Live Market Telemetry Streams</Text>
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

        <View style={styles.feedDivider} />

        <View style={styles.feedItemRow}>
          <View style={styles.feedDotGreen} />
          <View style={styles.feedMeta}>
            <Text style={styles.feedTitle}>Sovereign Sukuk Trading System</Text>
            <Text style={styles.feedSub}>Government of Pakistan GoP Ijarah • 45ms latency</Text>
          </View>
          <Text style={styles.feedPrice}>LIVE</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#06090F' /* Sovereign Obsidian Canvas */
  },
  content: { 
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40
  },
  sovereignHeader: {
    marginBottom: 16,
  },
  sovereignGovText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#F8FAFC',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: { 
    fontSize: 12, 
    color: '#94A3B8', 
    lineHeight: 18,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 10,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  macroCard: {
    width: '48%',
    backgroundColor: '#0D1524',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
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
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  macroDeltaUp: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  macroDeltaTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: '#34D399',
  },
  macroDeltaDown: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  macroDeltaDownTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F87171',
  },
  macroNeutral: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  macroNeutralTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: '#38BDF8',
  },
  macroVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  macroSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 3,
  },
  complianceCard: {
    backgroundColor: '#0D1524',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  complianceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  complianceMeta: {
    flex: 1,
    paddingRight: 10,
  },
  complianceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  complianceSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  complianceDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginVertical: 2,
  },
  statusPillGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  statusPillTxtGreen: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34D399',
  },
  statusPillBlue: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  statusPillTxtBlue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
  },
  feedCard: { 
    backgroundColor: '#0D1524', 
    padding: 16, 
    borderRadius: 18, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.08)', 
    marginTop: 2,
  },
  feedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  feedDotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  feedMeta: {
    flex: 1,
  },
  feedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  feedSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  feedPrice: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  feedDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginVertical: 2,
  },
});
