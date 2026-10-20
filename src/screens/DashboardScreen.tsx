import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, ScrollView, View, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { toggleCurrency, triggerApiSync, clearAuth, updateRealEstateInstallment, updateInstallmentLocal, fetchKycStatus } from '../store/portfolioSlice';
import { PaywallModal } from '../components/PaywallModal';
import { TickerTapeBar } from '../components/TickerTapeBar';
import { AssetSummaryCard } from '../components/AssetSummaryCard';
import { PortfolioChart } from '../components/PortfolioChart'; 
import { ActionButton } from '../components/ActionButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export default function DashboardScreen({ navigation }: NativeStackScreenProps<any>) {
  const dispatch = useDispatch<AppDispatch>();
  const [paywall, setPaywall] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { 
    assets, 
    currencyToggle, 
    pkrToUsdRate, 
    user, 
    goldPricePKR, 
    silverPricePKR 
  } = useSelector((state: RootState) => state.portfolio);

  const totalPKR = assets.reduce((sum, item) => sum + item.holdingValuePKR, 0);

  const displayNetWorth = () => {
    return currencyToggle === 'PKR' 
      ? `Rs. ${totalPKR.toLocaleString()}` 
      : `$ ${(totalPKR / pkrToUsdRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const handleSync = () => {
    if (!user.isPremiumUser) {
      setPaywall(true);
      return;
    }
    
    try {
      setIsSyncing(true);
      dispatch(triggerApiSync());
    } catch (error) {
      console.error("Data tracking node failure:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (user.token && !user.token.startsWith('mock-')) {
      dispatch(fetchKycStatus());
    }
  }, [user.token]);

  return (
    <View style={styles.wrapper}>
      {/* Real-time Streaming Ticker Telemetry Strip */}
      <TickerTapeBar gold={goldPricePKR} silver={silverPricePKR} />
      
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* ==============================================================================
            SOVEREIGN REGULATORY TRUST HEADER
           ============================================================================== */}
        <View style={styles.sovereignHeader}>
          <View style={styles.sovereignTitleRow}>
            <Text style={styles.sovereignFlag}>🇵🇰</Text>
            <Text style={styles.sovereignGovText}>ISLAMIC REPUBLIC OF PAKISTAN • FINTECH SANDBOX</Text>
          </View>
          <View style={styles.sovereignBadgeRow}>
            <Text style={styles.sovBadge}>🏛️ SBP BPRD/2026</Text>
            <Text style={styles.sovBadge}>🛡️ SECP FS-2026-084</Text>
            <Text style={styles.sovBadge}>⚖️ FBR ATL</Text>
          </View>
        </View>

        {/* ==============================================================================
            PORTFOLIO USER IDENTITY SECTION
           ============================================================================== */}
        <View style={styles.header}>
          <View style={styles.userInfoCol}>
            <View style={styles.roleTagRow}>
              <Text style={styles.roleTag}>
                {user.role} • {user.isPremiumUser ? 'Accredited VIP' : 'Retail Standard'}
              </Text>
            </View>
            <Text style={styles.name}>{user.name}</Text>
            {user.email ? <Text style={styles.userEmail}>{user.email}</Text> : null}
          </View>

          <View style={styles.headerActionCluster}>
            {/* SECP KYC Verification Status Pill */}
            <TouchableOpacity
              style={[
                styles.kycPill,
                user.kycStatus === 'Approved' ? styles.kycApproved :
                user.kycStatus === 'Pending' ? styles.kycPending : styles.kycUnverified
              ]}
              onPress={() => navigation.navigate('KycRoute')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.kycTxt,
                user.kycStatus === 'Approved' ? styles.kycTxtApproved :
                user.kycStatus === 'Pending' ? styles.kycTxtPending : styles.kycTxtUnverified
              ]}>
                {user.kycStatus === 'Approved' ? '✓ NADRA Cleared' :
                 user.kycStatus === 'Pending' ? '⏳ Under Review' : '⚠️ Verify CNIC'}
              </Text>
            </TouchableOpacity>

            {/* Plan Tier Pill */}
            <TouchableOpacity 
              style={[
                styles.pill, 
                user.isPremiumUser ? styles.pillPro : styles.pillUpgrade
              ]} 
              onPress={() => !user.isPremiumUser && setPaywall(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.dot, { backgroundColor: user.isPremiumUser ? '#10B981' : '#F59E0B' }]} />
              <Text style={[styles.pillTxt, { color: user.isPremiumUser ? '#34D399' : '#FBBF24' }]}>
                {user.isPremiumUser ? 'VIP Active' : 'Upgrade'}
              </Text>
            </TouchableOpacity>

            {/* Logout button */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => dispatch(clearAuth())}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutTxt}>🚪 Exit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ==============================================================================
            CONSOLIDATED ASSET EQUITY LEDGER DISPLAY NODE
           ============================================================================== */}
        <View style={styles.worthCard}>
          <View style={styles.worthHeaderRow}>
            <View>
              <Text style={styles.worthLabel}>CONSOLIDATED NET WORTH</Text>
              <Text style={styles.worthSublabel}>SBP Non-Custodial Multi-Asset Vault</Text>
            </View>
            <TouchableOpacity 
              style={styles.currPill} 
              onPress={() => dispatch(toggleCurrency())}
              activeOpacity={0.7}
            >
              <Text style={styles.currTxt}>{currencyToggle} ⇄</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.worthValue}>{displayNetWorth()}</Text>

          <View style={styles.worthFooterRow}>
            <View style={styles.deltaPill}>
              <Text style={styles.deltaTxt}>▲ +2.4% Today</Text>
            </View>
            <Text style={styles.deltaNote}>PSX & Sarafa Real-time Valuation</Text>
          </View>
        </View>

        {/* Dynamic Multi-Asset Density Bar Visualizer Matrix */}
        {assets.length > 0 && <PortfolioChart assets={assets} />}

        {/* ==============================================================================
            EXECUTIVE CONTROL OPERATIONS WORKSPACE NAVIGATION GRID
           ============================================================================== */}
        <Text style={styles.sectionHeader}>Institutional Operations</Text>
        <View style={styles.grid}>
          
          {/* MANAGE ASSETS */}
          <Pressable 
            style={({ pressed }) => [styles.gridCell, pressed && styles.gridCellPressed]} 
            onPress={() => navigation.navigate('AssetInput')}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.cellIcon}>📊</Text>
            </View>
            <Text style={styles.cellTxt}>Manage Assets</Text>
            <Text style={styles.cellSubtxt}>PSX, Sukuk, Bullion</Text>
          </Pressable>
          
          {/* AUTO API SYNC */}
          <Pressable 
            style={({ pressed }) => [styles.gridCell, (pressed || isSyncing) && styles.gridCellPressed]} 
            onPress={handleSync}
            disabled={isSyncing}
          >
            <View style={[styles.iconCircle, isSyncing && styles.iconCircleActive]}>
              {isSyncing ? (
                <ActivityIndicator size="small" color="#10B981" />
              ) : (
                <Text style={styles.cellIcon}>🔄</Text>
              )}
            </View>
            <Text style={[styles.cellTxt, isSyncing && styles.cellTxtActive]}>
              {isSyncing ? 'Syncing...' : 'SBP Live Sync'}
            </Text>
            <Text style={styles.cellSubtxt}>50ms Telemetry</Text>
          </Pressable>
          
          {/* LIVE CHARTS */}
          <Pressable 
            style={({ pressed }) => [styles.gridCell, pressed && styles.gridCellPressed]} 
            onPress={() => user.isPremiumUser ? navigation.navigate('LiveCharts') : setPaywall(true)}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.cellIcon}>📈</Text>
            </View>
            <Text style={styles.cellTxt}>Market Terminal</Text>
            <Text style={styles.cellSubtxt}>KSE-100 & Sarafa</Text>
          </Pressable>
          
          {/* AI ADVISOR */}
          <Pressable 
            style={({ pressed }) => [styles.gridCell, pressed && styles.gridCellPressed]} 
            onPress={() => navigation.navigate('AiAdvisor')}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.cellIcon}>🤖</Text>
            </View>
            <Text style={styles.cellTxt}>AI Wealth Advisor</Text>
            <Text style={styles.cellSubtxt}>SECP Rebalancing</Text>
          </Pressable>
          
          {/* KYC PORTAL */}
          <Pressable 
            style={({ pressed }) => [styles.gridCell, pressed && styles.gridCellPressed]} 
            onPress={() => navigation.navigate('KycRoute')}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.cellIcon}>🆔</Text>
            </View>
            <Text style={styles.cellTxt}>NADRA Bio-KYC</Text>
            <Text style={styles.cellSubtxt}>Investor Tier Limits</Text>
          </Pressable>
          
          {/* SUPPORT HUB */}
          <Pressable 
            style={({ pressed }) => [styles.gridCell, pressed && styles.gridCellPressed]} 
            onPress={() => navigation.navigate('LiveChat')}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.cellIcon}>💬</Text>
            </View>
            <Text style={styles.cellTxt}>Institutional Desk</Text>
            <Text style={styles.cellSubtxt}>SECP Compliance</Text>
          </Pressable>
        </View>

        {/* ==============================================================================
            DYNAMIC STREAM ITEMIZED POSITIONS TRACK
           ============================================================================== */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listHeader}>Regulated Asset Allocation</Text>
          <Text style={styles.listCount}>{assets.length} Active Positions</Text>
        </View>

        {assets.map((asset) => (
          <AssetSummaryCard
            key={asset.id}
            id={asset.id}
            name={asset.name}
            category={asset.category}
            isAutoSynced={asset.isAutoSynced}
            installmentsPaid={asset.installmentsPaid}
            totalInstallments={asset.totalInstallments}
            holdingValuePKR={asset.holdingValuePKR}
            onUpdateInstallment={(paid, total) => {
              dispatch(updateInstallmentLocal({ assetId: asset.id, paidInstallments: paid, totalInstallments: total }));
              dispatch(updateRealEstateInstallment({ assetId: asset.id, paidInstallments: paid, totalInstallments: total }));
            }}
            valueDisplay={
              currencyToggle === 'PKR' 
                ? `Rs. ${asset.holdingValuePKR.toLocaleString()}` 
                : `$ ${(asset.holdingValuePKR / pkrToUsdRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            }
          />
        ))}

        {/* Session Disconnection Lifecycle Controller */}
        <View style={styles.spacing}>
          <ActionButton title="Log Out of Secure Session" onPress={() => { dispatch(clearAuth()); }} variant="danger" />
        </View>
        
        <PaywallModal visible={paywall} onClose={() => setPaywall(false)} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { 
    flex: 1, 
    backgroundColor: '#06090F' /* Sovereign Obsidian Canvas */
  },
  container: { 
    flex: 1 
  },
  content: { 
    paddingHorizontal: 18, 
    paddingTop: 16, 
    paddingBottom: 40 
  },
  sovereignHeader: {
    backgroundColor: '#0D1524',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  sovereignTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  sovereignFlag: {
    fontSize: 14,
  },
  sovereignGovText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.8,
  },
  sovereignBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  sovBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 20 
  },
  userInfoCol: {
    flex: 1,
    marginRight: 12,
  },
  roleTagRow: {
    marginBottom: 2,
  },
  roleTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  name: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#F8FAFC',
    letterSpacing: -0.5 
  },
  userEmail: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  headerActionCluster: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
  },
  kycPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  kycApproved: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  kycPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  kycUnverified: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  kycTxt: {
    fontSize: 10,
    fontWeight: '700',
  },
  kycTxtApproved: {
    color: '#34D399',
  },
  kycTxtPending: {
    color: '#FBBF24',
  },
  kycTxtUnverified: {
    color: '#F87171',
  },
  logoutBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  logoutTxt: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  pill: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 8, 
    borderWidth: 1, 
    gap: 4
  },
  pillPro: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)', 
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  pillUpgrade: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)', 
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  pillTxt: { 
    fontSize: 10, 
    fontWeight: '700'
  },
  worthCard: { 
    backgroundColor: '#0D1524', 
    padding: 22, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.08)', 
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4
  },
  worthHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  },
  worthLabel: { 
    fontSize: 11, 
    color: '#94A3B8', 
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  worthSublabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  currPill: { 
    backgroundColor: 'rgba(16, 185, 129, 0.12)', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)'
  },
  currTxt: { 
    color: '#34D399',
    fontSize: 11, 
    fontWeight: '800',
    letterSpacing: 0.5
  },
  worthValue: { 
    fontSize: 34, 
    fontWeight: '800', 
    color: '#34D399', 
    marginTop: 12, 
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums']
  },
  worthFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  deltaPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  deltaTxt: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
  },
  deltaNote: {
    color: '#64748B',
    fontSize: 11,
  },
  sectionHeader: {
    fontSize: 13, 
    fontWeight: '700', 
    color: '#94A3B8', 
    marginBottom: 12, 
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginBottom: 16 
  },
  gridCell: { 
    width: '48%', 
    backgroundColor: '#0D1524', 
    paddingVertical: 18,
    paddingHorizontal: 14, 
    borderRadius: 18, 
    alignItems: 'center', 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  gridCellPressed: {
    backgroundColor: '#131E33',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconCircleActive: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  cellIcon: { 
    fontSize: 18 
  },
  cellTxt: { 
    color: '#F8FAFC', 
    fontSize: 12, 
    fontWeight: '700', 
    textAlign: 'center' 
  },
  cellSubtxt: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  cellTxtActive: {
    color: '#10B981'
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 8
  },
  listHeader: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#94A3B8', 
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  listCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34D399',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)'
  },
  spacing: { 
    marginTop: 16 
  }
});
