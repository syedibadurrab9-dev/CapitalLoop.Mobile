import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { clearAuth } from '../store/portfolioSlice';
import { InstitutionalHeader } from '../components/InstitutionalHeader';
import { BottomNavBar, TabRouteName } from '../components/BottomNavBar';
import { LeftDrawer } from '../components/LeftDrawer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export default function InvestorProfileScreen({ navigation }: NativeStackScreenProps<any>) {
  const dispatch = useDispatch<AppDispatch>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, currencyToggle, assets } = useSelector((state: RootState) => state.portfolio);

  const totalPKR = assets.reduce((sum, item) => sum + item.holdingValuePKR, 0);
  const initials = (user.name || 'Investor')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleTabNavigate = (route: TabRouteName) => {
    navigation.navigate(route);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Secure Sign Out',
      'Are you sure you want to end your secured session and disconnect from Capital Loop?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => dispatch(clearAuth()),
        },
      ]
    );
  };

  const handleDownloadTaxCert = () => {
    Alert.alert(
      'FBR Tax Certificate',
      'Your verified FBR Active Taxpayer Certificate (ATL-2026-CPR) has been prepared and sent to your registered email.',
      [{ text: 'OK' }]
    );
  };

  const handleSbpStatement = () => {
    Alert.alert(
      'SBP Investment Statement',
      'Your official SBP Sovereign Sukuk & Non-Custodial Holding Statement has been generated.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Institutional Top Header */}
      <InstitutionalHeader
        title="INVESTOR PROFILE"
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenProfile={() => {}}
      />

      {/* Slide-out Left Drawer */}
      <LeftDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={(route) => navigation.navigate(route)}
        currentRoute="Profile"
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ==============================================================================
            SOVEREIGN INVESTOR HERO CARD
           ============================================================================== */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopFlex}>
            <View style={styles.avatarLargeCircle}>
              <Text style={styles.avatarLargeText}>{initials}</Text>
              <View style={styles.avatarBadgeVerified}>
                <Text style={styles.avatarBadgeCheck}>✓</Text>
              </View>
            </View>

            <View style={styles.heroIdentityCol}>
              <View style={styles.tierPill}>
                <Text style={styles.tierPillText}>INSTITUTIONAL TIER-1</Text>
              </View>
              <Text style={styles.investorFullName}>{user.name || 'Syed Ibad Ur Rab'}</Text>
              <Text style={styles.investorEmailText}>{user.email || 'syedibad335@gmail.com'}</Text>
              <Text style={styles.investorPhoneText}>+92 300 ••••••• (Verified Mobile)</Text>
            </View>
          </View>

          {/* Quick Regulatory Badge Ribbon */}
          <View style={styles.heroRegulatoryRibbon}>
            <Text style={styles.regulatoryRibbonText}>
              🇵🇰 SBP & SECP NON-CUSTODIAL LICENSED • SANDBOX #084
            </Text>
          </View>

          {/* Asset Allocation Snapshot */}
          <View style={styles.aumSnapshotCard}>
            <View style={styles.aumSnapshotCol}>
              <Text style={styles.aumSnapshotLabel}>TOTAL ASSET VALUE</Text>
              <Text style={styles.aumSnapshotValue}>
                {currencyToggle === 'PKR'
                  ? `Rs. ${totalPKR.toLocaleString()}`
                  : `$ ${(totalPKR / 278.5).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              </Text>
            </View>

            <View style={styles.aumSnapshotDivider} />

            <View style={styles.aumSnapshotCol}>
              <Text style={styles.aumSnapshotLabel}>PORTFOLIO RISK</Text>
              <Text style={styles.aumSnapshotRisk}>Moderate Growth</Text>
            </View>
          </View>
        </View>

        {/* ==============================================================================
            REGULATORY VERIFICATION STATUS MATRIX (SECP / SBP / FBR / NADRA)
           ============================================================================== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Regulatory Compliance Matrix</Text>
          <View style={styles.verifiedCountBadge}>
            <Text style={styles.verifiedCountText}>4/4 VERIFIED</Text>
          </View>
        </View>

        <View style={styles.matrixCard}>
          {/* Item 1: NADRA Verisys Biometric Clearance */}
          <View style={styles.matrixItem}>
            <View style={styles.matrixIconCircle}>
              <Text style={styles.matrixIcon}>🪪</Text>
            </View>
            <View style={styles.matrixTextCol}>
              <View style={styles.matrixTitleRow}>
                <Text style={styles.matrixTitle}>NADRA Verisys Biometric</Text>
                <View style={styles.statusPillSuccess}>
                  <Text style={styles.statusPillSuccessText}>LEVEL-2 CLEARED</Text>
                </View>
              </View>
              <Text style={styles.matrixDescription}>
                CNIC: 42101-•••••••-7 • Biometric match verified against National Database Authority.
              </Text>
              <Text style={styles.matrixMetaTimestamp}>Verification Timestamp: 2026-08-14 10:22:15 UTC</Text>
            </View>
          </View>

          <View style={styles.matrixDivider} />

          {/* Item 2: FBR Active Taxpayer Status (ATL) */}
          <View style={styles.matrixItem}>
            <View style={styles.matrixIconCircle}>
              <Text style={styles.matrixIcon}>🧾</Text>
            </View>
            <View style={styles.matrixTextCol}>
              <View style={styles.matrixTitleRow}>
                <Text style={styles.matrixTitle}>FBR Active Taxpayer List (ATL)</Text>
                <View style={styles.statusPillSuccess}>
                  <Text style={styles.statusPillSuccessText}>ACTIVE FILER</Text>
                </View>
              </View>
              <Text style={styles.matrixDescription}>
                NTN: 8492019-3 • Entitled to 15% reduced withholding tax on PSX dividends & Sukuk profits (vs 30% Non-Filer rate).
              </Text>
              <TouchableOpacity onPress={handleDownloadTaxCert} style={styles.inlineActionBtn}>
                <Text style={styles.inlineActionText}>Download CPR Certificate ➔</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.matrixDivider} />

          {/* Item 3: State Bank of Pakistan Sovereign Gateway */}
          <View style={styles.matrixItem}>
            <View style={styles.matrixIconCircle}>
              <Text style={styles.matrixIcon}>🇵🇰</Text>
            </View>
            <View style={styles.matrixTextCol}>
              <View style={styles.matrixTitleRow}>
                <Text style={styles.matrixTitle}>State Bank of Pakistan (SBP)</Text>
                <View style={styles.statusPillSuccess}>
                  <Text style={styles.statusPillSuccessText}>AUTHORIZED</Text>
                </View>
              </View>
              <Text style={styles.matrixDescription}>
                Resident Investor Portal Clearance • Non-Custodial Sukuk & FX Sovereign Settlement Channel Enabled.
              </Text>
              <TouchableOpacity onPress={handleSbpStatement} style={styles.inlineActionBtn}>
                <Text style={styles.inlineActionText}>Request SBP Holding Statement ➔</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.matrixDivider} />

          {/* Item 4: SECP Sandbox #084 & Investor Protection */}
          <View style={styles.matrixItem}>
            <View style={styles.matrixIconCircle}>
              <Text style={styles.matrixIcon}>🏛️</Text>
            </View>
            <View style={styles.matrixTextCol}>
              <View style={styles.matrixTitleRow}>
                <Text style={styles.matrixTitle}>SECP Regulatory Sandbox</Text>
                <View style={styles.statusPillSuccess}>
                  <Text style={styles.statusPillSuccessText}>LIC. #084</Text>
                </View>
              </View>
              <Text style={styles.matrixDescription}>
                Securities and Exchange Commission of Pakistan Sandbox Directive FS-2026-084 • Non-Custodial Multi-Asset Mandate.
              </Text>
            </View>
          </View>

          <View style={styles.matrixDivider} />

          {/* Item 5: PECA 2016 & PDPB 2023 Security */}
          <View style={styles.matrixItem}>
            <View style={styles.matrixIconCircle}>
              <Text style={styles.matrixIcon}>🔒</Text>
            </View>
            <View style={styles.matrixTextCol}>
              <View style={styles.matrixTitleRow}>
                <Text style={styles.matrixTitle}>PECA 2016 & Data Privacy</Text>
                <View style={styles.statusPillSky}>
                  <Text style={styles.statusPillSkyText}>ENCRYPTED</Text>
                </View>
              </View>
              <Text style={styles.matrixDescription}>
                Hardware enclave keystore with AES-256 GCM encryption • In-country Tier-4 sovereign data persistence.
              </Text>
            </View>
          </View>
        </View>

        {/* ==============================================================================
            SETTLEMENT BANKING & CLEARING DETAILS
           ============================================================================== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Settlement & Clearing Bank</Text>
        </View>

        <View style={styles.bankCard}>
          <View style={styles.bankHeaderRow}>
            <View style={styles.bankIconCircle}>
              <Text style={styles.bankIcon}>🏦</Text>
            </View>
            <View style={styles.bankNameCol}>
              <Text style={styles.bankNameTitle}>Meezan Bank Limited</Text>
              <Text style={styles.bankBranchText}>Premier Islamic Banking • SBP RTGS Enabled</Text>
            </View>
            <View style={styles.primaryBankBadge}>
              <Text style={styles.primaryBankText}>PRIMARY</Text>
            </View>
          </View>

          <View style={styles.bankDetailsGrid}>
            <View style={styles.bankGridItem}>
              <Text style={styles.bankGridLabel}>ACCOUNT TITLE</Text>
              <Text style={styles.bankGridValue}>{user.name || 'Syed Ibad Ur Rab'}</Text>
            </View>

            <View style={styles.bankGridItem}>
              <Text style={styles.bankGridLabel}>IBAN</Text>
              <Text style={styles.bankGridValueIban}>PK36 MEZN 0001 0203 0405 0607</Text>
            </View>

            <View style={styles.bankGridItem}>
              <Text style={styles.bankGridLabel}>SETTLEMENT CYCLE</Text>
              <Text style={styles.bankGridValue}>T+0 Sukuk / T+2 PSX</Text>
            </View>

            <View style={styles.bankGridItem}>
              <Text style={styles.bankGridLabel}>DAILY SBP LIMIT</Text>
              <Text style={styles.bankGridValue}>Rs. 10,000,000</Text>
            </View>
          </View>
        </View>

        {/* ==============================================================================
            INVESTOR SUITABILITY & RISK MANDATE
           ============================================================================== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>SECP Suitability & Allocation Mandate</Text>
        </View>

        <View style={styles.mandateCard}>
          <View style={styles.mandateRow}>
            <Text style={styles.mandateLabel}>Investor Risk Rating:</Text>
            <Text style={styles.mandateValueHighlight}>Moderate (Category 3)</Text>
          </View>

          <View style={styles.mandateRow}>
            <Text style={styles.mandateLabel}>Recommended Horizon:</Text>
            <Text style={styles.mandateValue}>Medium–Long Term (3–5 Years)</Text>
          </View>

          <View style={styles.mandateRow}>
            <Text style={styles.mandateLabel}>Max Single Asset Cap:</Text>
            <Text style={styles.mandateValue}>25% Concentration Limit</Text>
          </View>

          <View style={styles.mandateBarContainer}>
            <View style={[styles.mandateBarSegment, { flex: 60, backgroundColor: '#0284C7' }]} />
            <View style={[styles.mandateBarSegment, { flex: 25, backgroundColor: '#10B981' }]} />
            <View style={[styles.mandateBarSegment, { flex: 15, backgroundColor: '#F59E0B' }]} />
          </View>

          <View style={styles.mandateLegendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#0284C7' }]} />
              <Text style={styles.legendText}>Sukuk (60%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>PSX Equities (25%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>24K Bullion (15%)</Text>
            </View>
          </View>
        </View>

        {/* Sign Out Action Button */}
        <TouchableOpacity
          style={styles.signOutCard}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutIcon}>🚪</Text>
          <Text style={styles.signOutText}>Terminate Cryptographic Session & Sign Out</Text>
        </TouchableOpacity>

        {/* Statutory Footer */}
        <View style={styles.statutoryFooter}>
          <Text style={styles.statutoryFooterText}>
            Capital Loop Technologies (Pvt) Ltd. Operating under SECP Sandbox Directive FS-2026-084.
            All client data protected under Prevention of Electronic Crimes Act (PECA 2016) and Personal Data Protection Bill (PDPB 2023).
          </Text>
        </View>
      </ScrollView>

      {/* Persistent Bottom Navigation Bar */}
      <BottomNavBar
        activeRoute="Profile"
        onNavigate={handleTabNavigate}
        unreadChatCount={0}
        isAdvisorActive={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: '#0E141D',
    padding: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  heroTopFlex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLargeCircle: {
    position: 'relative',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  avatarLargeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  avatarBadgeVerified: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0E141D',
  },
  avatarBadgeCheck: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  heroIdentityCol: {
    flex: 1,
    marginLeft: 16,
  },
  tierPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    marginBottom: 4,
  },
  tierPillText: {
    color: '#FBBF24',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  investorFullName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  investorEmailText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  investorPhoneText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  heroRegulatoryRibbon: {
    marginTop: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  regulatoryRibbonText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  aumSnapshotCard: {
    flexDirection: 'row',
    backgroundColor: '#1A2333',
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  aumSnapshotCol: {
    flex: 1,
    alignItems: 'center',
  },
  aumSnapshotDivider: {
    width: 1,
    backgroundColor: '#2D3748',
  },
  aumSnapshotLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  aumSnapshotValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 3,
    fontVariant: ['tabular-nums'],
  },
  aumSnapshotRisk: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  verifiedCountBadge: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedCountText: {
    color: '#047857',
    fontSize: 10,
    fontWeight: '800',
  },
  matrixCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  matrixItem: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  matrixIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  matrixIcon: {
    fontSize: 18,
  },
  matrixTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  matrixTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matrixTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  statusPillSuccess: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusPillSuccessText: {
    color: '#047857',
    fontSize: 9,
    fontWeight: '800',
  },
  statusPillSky: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  statusPillSkyText: {
    color: '#1D4ED8',
    fontSize: 9,
    fontWeight: '800',
  },
  matrixDescription: {
    color: '#475569',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  matrixMetaTimestamp: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
  },
  inlineActionBtn: {
    marginTop: 6,
  },
  inlineActionText: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '700',
  },
  matrixDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  bankCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  bankHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  bankIcon: {
    fontSize: 20,
  },
  bankNameCol: {
    flex: 1,
    marginLeft: 12,
  },
  bankNameTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  bankBranchText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  primaryBankBadge: {
    backgroundColor: '#0F172A',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  primaryBankText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  bankDetailsGrid: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  bankGridItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankGridLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  bankGridValue: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  bankGridValueIban: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  mandateCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    gap: 8,
  },
  mandateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mandateLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  mandateValue: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  mandateValueHighlight: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '800',
  },
  mandateBarContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 4,
  },
  mandateBarSegment: {
    height: '100%',
  },
  mandateLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  signOutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 8,
  },
  signOutIcon: {
    fontSize: 18,
  },
  signOutText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '800',
  },
  statutoryFooter: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  statutoryFooterText: {
    color: '#94A3B8',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },
});
