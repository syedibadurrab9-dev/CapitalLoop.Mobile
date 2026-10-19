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
            PORTFOLIO USER IDENTITY SECTION
           ============================================================================== */}
        <View style={styles.header}>
          <View style={styles.userInfoCol}>
            <View style={styles.roleTagRow}>
              <Text style={styles.roleTag}>
                {user.role} • {user.isPremiumUser ? 'Wealth VIP' : 'Retail Standard'}
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
                {user.kycStatus === 'Approved' ? '✓ Verified' :
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
              <View style={[styles.dot, { backgroundColor: user.isPremiumUser ? '#059669' : '#D97706' }]} />
              <Text style={[styles.pillTxt, { color: user.isPremiumUser ? '#047857' : '#B45309' }]}>
                {user.isPremiumUser ? 'Premium' : 'Upgrade'}
              </Text>
            </TouchableOpacity>

            {/* Logout button */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => dispatch(clearAuth())}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutTxt}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ==============================================================================
            CONSOLIDATED ASSET EQUITY LEDGER DISPLAY NODE
           ============================================================================== */}
        <View style={styles.worthCard}>
          <View style={styles.worthRow}>
            <Text style={styles.worthLabel}>Total Net Worth</Text>
            <TouchableOpacity 
              style={styles.currPill} 
              onPress={() => dispatch(toggleCurrency())}
              activeOpacity={0.7}
            >
              <Text style={styles.currTxt}>{currencyToggle}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.worthValue}>{displayNetWorth()}</Text>
        </View>

        {/* Dynamic Multi-Asset Density Bar Visualizer Matrix */}
        {assets.length > 0 && <PortfolioChart assets={assets} />}

        {/* ==============================================================================
            EXECUTIVE CONTROL OPERATIONS WORKSPACE NAVIGATION GRID
           ============================================================================== */}
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <View style={styles.grid}>
          
          {/* SYNC HUB */}
          <Pressable 
            style={({ pressed }) => [styles.gridCell, pressed && styles.gridCellPressed]} 
            onPress={() => navigation.navigate('AssetInput')}
          >
            <View style={styles.iconCircle}><Text style={styles.cellIcon}>📝</Text></View>
            <Text style={styles.cellTxt}>Manage Assets</Text>
          </Pressable>
          
          {/* AUTO API SYNC */}
          <Pressable 
            style={({ pressed }) => [styles.gridCell, (pressed || isSyncing) && styles.gridCellPressed]} 
            onPress={handleSync}
            disabled={isSyncing}
          >
            <View style={[styles.iconCircle, isSyncing && styles.iconCircleActive]}>
              {isSyncing ? (
                <ActivityIndicator size="small" color="#2563EB" />
              ) : (
                <Text style={styles.cellIcon}>🔄</Text>
              )}
            </View>
            <Text style={[styles.cellTxt, isSyncing && styles.cellTxtActive]}>
              {isSyncing ? 'Syncing...' : 'Live Sync'}
            </Text>
          </Pressable>
          
          {/* LIVE CHARTS */}
          <Pressable 
            style={({ pressed }) => [styles.gridCell, pressed && styles.gridCellPressed]} 
            onPress={() => user.isPremiumUser ? navigation.navigate('LiveCharts') : setPaywall(true)}
          >
            <View style={styles.iconCircle}><Text style={styles.cellIcon}>📈</Text></View>
            <Text style={styles.cellTxt}>Market Analytics</Text>
          </Pressable>
          
          {/* AI ADVISOR */}
          <Pressable 
            style={({ pressed }) => [styles.gridCell, pressed && styles.gridCellPressed]} 
            onPress={() => navigation.navigate('AiAdvisor')}
          >
            <View style={styles.iconCircle}><Text style={styles.cellIcon}>🤖</Text></View>
            <Text style={styles.cellTxt}>AI Insights</Text>
          </Pressable>
          
          {/* KYC PORTAL */}
          <Pressable 
            style={({ pressed }) => [styles.gridCell, pressed && styles.gridCellPressed]} 
            onPress={() => navigation.navigate('KycRoute')}
          >
            <View style={styles.iconCircle}><Text style={styles.cellIcon}>🆔</Text></View>
            <Text style={styles.cellTxt}>Verify Identity</Text>
          </Pressable>
          
          {/* SUPPORT HUB */}
          <Pressable 
            style={({ pressed }) => [styles.gridCell, pressed && styles.gridCellPressed]} 
            onPress={() => navigation.navigate('LiveChat')}
          >
            <View style={styles.iconCircle}><Text style={styles.cellIcon}>💬</Text></View>
            <Text style={styles.cellTxt}>Help & Support</Text>
          </Pressable>
        </View>

        {/* ==============================================================================
            DYNAMIC STREAM ITEMIZED POSITIONS TRACK
           ============================================================================== */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listHeader}>Your Asset Distribution</Text>
          <Text style={styles.listCount}>{assets.length} Active</Text>
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
          <ActionButton title="Log Out of Enterprise Session" onPress={() => { dispatch(clearAuth()); }} variant="danger" />
        </View>
        
        <PaywallModal visible={paywall} onClose={() => setPaywall(false)} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { 
    flex: 1, 
    backgroundColor: '#F1F5F9' /* Clean frosted ice sheet canvas background */
  },
  container: { 
    flex: 1 
  },
  content: { 
    paddingHorizontal: 20, 
    paddingTop: 24, 
    paddingBottom: 40 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 24 
  },
  userInfoCol: {
    flex: 1,
    marginRight: 12,
  },
  roleTagRow: {
    marginBottom: 2,
  },
  roleTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  welcome: { 
    fontSize: 12, 
    color: '#64748B', 
    fontWeight: '600', 
    letterSpacing: 0.1
  },
  name: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#0F172A',
    letterSpacing: -0.5 
  },
  userEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  headerActionCluster: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
  },
  kycPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  kycApproved: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  kycPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  kycUnverified: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  kycTxt: {
    fontSize: 10,
    fontWeight: '700',
  },
  kycTxtApproved: {
    color: '#059669',
  },
  kycTxtPending: {
    color: '#D97706',
  },
  kycTxtUnverified: {
    color: '#DC2626',
  },
  logoutBtn: {
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 2,
  },
  logoutTxt: {
    fontSize: 12,
  },
  pill: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 14, 
    borderWidth: 1, 
    gap: 5
  },
  pillPro: {
    backgroundColor: '#E6F4EA', 
    borderColor: '#A7F3D0'
  },
  pillUpgrade: {
    backgroundColor: '#FFFBEB', 
    borderColor: '#FDE68A'
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  pillTxt: { 
    fontSize: 11, 
    fontWeight: '700'
  },
  worthCard: { 
    backgroundColor: '#FFFFFF', 
    padding: 26, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    marginBottom: 28,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3
  },
  worthRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  worthLabel: { 
    fontSize: 12, 
    color: '#475569', 
    fontWeight: '600'
  },
  currPill: { 
    backgroundColor: '#F8FAFC', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  currTxt: { 
    color: '#2563EB', /* Bold institutional tech sapphire blue */
    fontSize: 11, 
    fontWeight: '800',
    letterSpacing: 0.5
  },
  worthValue: { 
    fontSize: 36, 
    fontWeight: '800', 
    color: '#0F172A', 
    marginTop: 14, 
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums']
  },
  sectionHeader: {
    fontSize: 15, 
    fontWeight: '700', 
    color: '#334155', 
    marginBottom: 16, 
    letterSpacing: -0.2
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  gridCell: { 
    width: '48%', 
    backgroundColor: '#FFFFFF', 
    paddingVertical: 22,
    paddingHorizontal: 16, 
    borderRadius: 24, 
    alignItems: 'center', 
    marginBottom: 14, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2
  },
  gridCellPressed: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1'
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  iconCircleActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF'
  },
  cellIcon: { 
    fontSize: 18 
  },
  cellTxt: { 
    color: '#334155', 
    fontSize: 12, 
    fontWeight: '600', 
    textAlign: 'center' 
  },
  cellTxtActive: {
    color: '#2563EB'
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 12
  },
  listHeader: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#334155', 
    letterSpacing: -0.2
  },
  listCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  spacing: { 
    marginTop: 16 
  }
});