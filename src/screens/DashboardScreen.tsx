import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  ScrollView, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Pressable,
  Dimensions
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  toggleCurrency, 
  triggerApiSync, 
  clearAuth, 
  updateRealEstateInstallment, 
  updateInstallmentLocal, 
  fetchKycStatus 
} from '../store/portfolioSlice';
import { PaywallModal } from '../components/PaywallModal';
import { TickerTapeBar } from '../components/TickerTapeBar';
import { AssetSummaryCard } from '../components/AssetSummaryCard';
import { PortfolioChart } from '../components/PortfolioChart'; 
import { ActionButton } from '../components/ActionButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

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

  const firstName = (user.name || 'Investor').split(' ')[0];

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
            SOVEREIGN HERO SECTION (INVETO DARK HEADER)
           ============================================================================== */}
        <View style={styles.invetoHeroContainer}>
          
          {/* Regulatory Trust Badge Ribbon */}
          <View style={styles.regulatoryTrustPill}>
            <Text style={styles.regulatoryFlag}>🇵🇰</Text>
            <Text style={styles.regulatoryTrustText}>STATE BANK OF PAKISTAN • SECP SANDBOX #084</Text>
          </View>

          {/* Top Profile Action Cluster */}
          <View style={styles.heroTopRow}>
            <View style={styles.greetingCol}>
              <Text style={styles.greetingTitle}>Hi, {firstName}!</Text>
              <Text style={styles.greetingSubtitle}>Here's Your Portfolio.</Text>
            </View>

            <View style={styles.heroRightActions}>
              {/* KYC Verification Badge */}
              <TouchableOpacity
                style={[
                  styles.kycHeroBadge,
                  user.kycStatus === 'Approved' ? styles.kycHeroApproved :
                  user.kycStatus === 'Pending' ? styles.kycHeroPending : styles.kycHeroUnverified
                ]}
                onPress={() => navigation.navigate('KycRoute')}
                activeOpacity={0.8}
              >
                <Text style={styles.kycHeroText}>
                  {user.kycStatus === 'Approved' ? '✓ NADRA' :
                   user.kycStatus === 'Pending' ? '⏳ Review' : '⚠️ CNIC'}
                </Text>
              </TouchableOpacity>

              {/* Currency Switcher Pill */}
              <TouchableOpacity 
                style={styles.currencyTogglePill} 
                onPress={() => dispatch(toggleCurrency())}
                activeOpacity={0.8}
              >
                <Text style={styles.currencyToggleText}>{currencyToggle} ⇄</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Large Net Worth Display */}
          <View style={styles.balanceDisplayCard}>
            <Text style={styles.balanceMetaLabel}>CONSOLIDATED NET WORTH</Text>
            <Text style={styles.balanceValueText}>{displayNetWorth()}</Text>

            {/* Dual Savings / Assets Progress Line (Inveto Signature Feature) */}
            <View style={styles.invetoDualSplitRow}>
              <View style={styles.invetoSplitItem}>
                <Text style={styles.splitMetricLabel}>SAVINGS POOL</Text>
                <Text style={styles.splitMetricValue}>
                  {currencyToggle === 'PKR' ? 'Rs. 2,150,000' : '$ 7,720'}
                </Text>
                <View style={styles.mintIndicatorLine} />
              </View>

              <View style={styles.invetoSplitItem}>
                <Text style={styles.splitMetricLabel}>CAPITAL ASSETS</Text>
                <Text style={styles.splitMetricValue}>
                  {currencyToggle === 'PKR' ? 'Rs. 2,702,500' : '$ 9,706'}
                </Text>
                <View style={styles.slateIndicatorLine} />
              </View>
            </View>
          </View>

        </View>

        {/* ==============================================================================
            MAIN WHITE CARD SHEET (INVETO CURVED SURFACE)
           ============================================================================== */}
        <View style={styles.invetoWhiteSheet}>
          
          {/* Activities / Quick Action Tiles (Inveto Screen 1) */}
          <View style={styles.sheetSectionHeader}>
            <Text style={styles.sheetSectionTitle}>Activities</Text>
            <TouchableOpacity onPress={handleSync} disabled={isSyncing}>
              <Text style={styles.syncActionLink}>
                {isSyncing ? 'Syncing...' : '🔄 SBP Sync'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activitiesTilesRow}>
            {/* Manage Assets */}
            <TouchableOpacity 
              style={styles.activityTile} 
              onPress={() => navigation.navigate('AssetInput')}
              activeOpacity={0.7}
            >
              <View style={styles.tileIconCircle}>
                <Text style={styles.tileIcon}>📊</Text>
              </View>
              <Text style={styles.tileLabel}>Account</Text>
            </TouchableOpacity>

            {/* Bio-KYC */}
            <TouchableOpacity 
              style={styles.activityTile} 
              onPress={() => navigation.navigate('KycRoute')}
              activeOpacity={0.7}
            >
              <View style={styles.tileIconCircle}>
                <Text style={styles.tileIcon}>🛡️</Text>
              </View>
              <Text style={styles.tileLabel}>Privacy</Text>
            </TouchableOpacity>

            {/* Institutional Support Desk */}
            <TouchableOpacity 
              style={styles.activityTile} 
              onPress={() => navigation.navigate('LiveChat')}
              activeOpacity={0.7}
            >
              <View style={styles.tileIconCircle}>
                <Text style={styles.tileIcon}>💬</Text>
              </View>
              <Text style={styles.tileLabel}>Help</Text>
            </TouchableOpacity>

            {/* AI Advisor */}
            <TouchableOpacity 
              style={styles.activityTile} 
              onPress={() => navigation.navigate('AiAdvisor')}
              activeOpacity={0.7}
            >
              <View style={styles.tileIconCircle}>
                <Text style={styles.tileIcon}>🤖</Text>
              </View>
              <Text style={styles.tileLabel}>AI Wealth</Text>
            </TouchableOpacity>
          </View>

          {/* Investing Tips Card (Inveto Screen 2) */}
          <View style={styles.investingTipBanner}>
            <View style={styles.tipIconCircle}>
              <Text style={styles.tipIcon}>💡</Text>
            </View>
            <View style={styles.tipTextCol}>
              <Text style={styles.tipCategoryText}>Investing Tips</Text>
              <Text style={styles.tipTitleText}>What is a Sovereign Sukuk?</Text>
            </View>
            <TouchableOpacity 
              style={styles.learnMoreBtn}
              onPress={() => navigation.navigate('LiveCharts')}
            >
              <Text style={styles.learnMoreText}>LEARN MORE</Text>
            </TouchableOpacity>
          </View>

          {/* My Vault Cards Horizontal Carousel (Inveto Screen 2) */}
          <View style={styles.sheetSectionHeader}>
            <Text style={styles.sheetSectionTitle}>My Cards (3)</Text>
            <Text style={styles.seeAllText}>Swipe ➔</Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.vaultCardsCarousel}
          >
            {/* Card 1: PSX Equities Tier (Titanium Slate) */}
            <View style={[styles.invetoPaymentCard, styles.cardTitanium]}>
              <View style={styles.cardHeaderFlex}>
                <Text style={styles.cardChipText}>💳</Text>
                <Text style={styles.cardNumberMasked}>•••• 8115</Text>
              </View>
              <View style={styles.cardBodyBalance}>
                <Text style={styles.cardBalanceFig}>Rs. 2,150,000</Text>
                <Text style={styles.cardAssetSub}>PSX Sovereign Equities</Text>
              </View>
              <View style={styles.cardFooterFlex}>
                <Text style={styles.cardVisaTag}>VISA</Text>
              </View>
            </View>

            {/* Card 2: Sarafa Bullion Vault (Mint Green) */}
            <View style={[styles.invetoPaymentCard, styles.cardMint]}>
              <View style={styles.cardHeaderFlex}>
                <Text style={styles.cardChipText}>🪙</Text>
                <Text style={[styles.cardNumberMasked, { color: '#064E3B' }]}>•••• 4920</Text>
              </View>
              <View style={styles.cardBodyBalance}>
                <Text style={[styles.cardBalanceFig, { color: '#064E3B' }]}>Rs. 852,500</Text>
                <Text style={[styles.cardAssetSub, { color: '#047857' }]}>24K Sarafa Gold Tola</Text>
              </View>
              <View style={styles.cardFooterFlex}>
                <Text style={[styles.cardVisaTag, { color: '#064E3B' }]}>VAULT</Text>
              </View>
            </View>

            {/* Card 3: Sovereign Sukuk (Deep Navy) */}
            <View style={[styles.invetoPaymentCard, styles.cardNavy]}>
              <View style={styles.cardHeaderFlex}>
                <Text style={styles.cardChipText}>📜</Text>
                <Text style={styles.cardNumberMasked}>•••• 6312</Text>
              </View>
              <View style={styles.cardBodyBalance}>
                <Text style={styles.cardBalanceFig}>Rs. 1,850,000</Text>
                <Text style={styles.cardAssetSub}>SBP Government Sukuk</Text>
              </View>
              <View style={styles.cardFooterFlex}>
                <Text style={styles.cardVisaTag}>SUKUK</Text>
              </View>
            </View>
          </ScrollView>

          {/* Dynamic Asset Density Chart */}
          {assets.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <PortfolioChart assets={assets} />
            </View>
          )}

          {/* Regulated Asset Allocation Items */}
          <View style={[styles.sheetSectionHeader, { marginTop: 24 }]}>
            <Text style={styles.sheetSectionTitle}>Regulated Asset Allocation</Text>
            <Text style={styles.seeAllText}>{assets.length} Positions</Text>
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

          {/* Log Out Button */}
          <View style={{ marginTop: 28, marginBottom: 20 }}>
            <ActionButton 
              title="Log Out of Secure Session" 
              onPress={() => { dispatch(clearAuth()); }} 
              variant="danger" 
            />
          </View>

        </View>
        
        <PaywallModal visible={paywall} onClose={() => setPaywall(false)} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { 
    flex: 1, 
    backgroundColor: '#0E141D' /* Sovereign Obsidian Canvas */
  },
  container: { 
    flex: 1 
  },
  content: { 
    paddingBottom: 40 
  },

  /* Inveto Hero Section */
  invetoHeroContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    backgroundColor: '#0E141D',
  },
  regulatoryTrustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#18202C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#242F40',
  },
  regulatoryFlag: {
    fontSize: 12,
  },
  regulatoryTrustText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00D084',
    letterSpacing: 0.5,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greetingCol: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  heroRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kycHeroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  kycHeroApproved: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  kycHeroPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  kycHeroUnverified: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  kycHeroText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34D399',
  },
  currencyTogglePill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  currencyToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
  },

  /* Balance Card */
  balanceDisplayCard: {
    backgroundColor: '#141A25',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222C3D',
  },
  balanceMetaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  balanceValueText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginVertical: 8,
  },
  invetoDualSplitRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 12,
  },
  invetoSplitItem: {
    flex: 1,
  },
  splitMetricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  splitMetricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 2,
    marginBottom: 6,
  },
  mintIndicatorLine: {
    height: 3,
    backgroundColor: '#00D084',
    borderRadius: 2,
    width: '80%',
  },
  slateIndicatorLine: {
    height: 3,
    backgroundColor: '#334155',
    borderRadius: 2,
    width: '60%',
  },

  /* Inveto White Sheet */
  invetoWhiteSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
    minHeight: 600,
  },
  sheetSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  syncActionLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00D084',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },

  /* Activities Tiles (Inveto Screen 1) */
  activitiesTilesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  activityTile: {
    width: (width - 40 - 36) / 4,
    height: 80,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  tileIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  tileIcon: {
    fontSize: 20,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },

  /* Investing Tips Banner (Inveto Screen 2) */
  investingTipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 14,
    marginBottom: 24,
    gap: 12,
  },
  tipIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipIcon: {
    fontSize: 20,
  },
  tipTextCol: {
    flex: 1,
  },
  tipCategoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    textTransform: 'uppercase',
  },
  tipTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#064E3B',
    marginTop: 2,
  },
  learnMoreBtn: {
    backgroundColor: '#00D084',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  learnMoreText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#064E3B',
    letterSpacing: 0.5,
  },

  /* Cards Carousel (Inveto Screen 2) */
  vaultCardsCarousel: {
    gap: 14,
    paddingBottom: 8,
  },
  invetoPaymentCard: {
    width: 220,
    height: 140,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitanium: {
    backgroundColor: '#1E2530',
  },
  cardMint: {
    backgroundColor: '#A7F3D0',
  },
  cardNavy: {
    backgroundColor: '#0F172A',
  },
  cardHeaderFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChipText: {
    fontSize: 16,
  },
  cardNumberMasked: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  cardBodyBalance: {
    marginVertical: 4,
  },
  cardBalanceFig: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  cardAssetSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  cardFooterFlex: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cardVisaTag: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
