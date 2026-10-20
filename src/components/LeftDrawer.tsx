import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { clearAuth, toggleCurrency } from '../store/portfolioSlice';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 0.82, 340);

interface LeftDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export const LeftDrawer: React.FC<LeftDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentRoute,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, currencyToggle, assets } = useSelector((state: RootState) => state.portfolio);

  const totalPKR = assets.reduce((sum, item) => sum + item.holdingValuePKR, 0);
  const initials = (user.name || 'Investor')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleNavigate = (route: string) => {
    onClose();
    setTimeout(() => {
      onNavigate(route);
    }, 150);
  };

  const handleSignOut = () => {
    onClose();
    setTimeout(() => {
      dispatch(clearAuth());
    }, 200);
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop overlay */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Drawer panel */}
        <View style={styles.drawerSurface}>
          <ScrollView
            style={styles.drawerScroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header branding */}
            <View style={styles.drawerHeader}>
              <View style={styles.brandRow}>
                <View style={styles.logoBadge}>
                  <Text style={styles.logoIcon}>🏛️</Text>
                </View>
                <View style={styles.brandTextCol}>
                  <Text style={styles.brandTitle}>CAPITAL LOOP</Text>
                  <Text style={styles.brandSubtitle}>Sovereign Wealth Platform</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Regulatory ribbon */}
              <View style={styles.regRibbon}>
                <Text style={styles.regRibbonText}>
                  🇵🇰 SBP & SECP SANDBOX #084 AUTHORIZED
                </Text>
              </View>
            </View>

            {/* Investor Identity Card */}
            <TouchableOpacity
              style={styles.investorIdentityCard}
              onPress={() => handleNavigate('Profile')}
              activeOpacity={0.8}
            >
              <View style={styles.identityTopRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                  <View style={styles.avatarCheckBadge}>
                    <Text style={styles.avatarCheckText}>✓</Text>
                  </View>
                </View>

                <View style={styles.identityTextCol}>
                  <Text style={styles.investorName} numberOfLines={1}>
                    {user.name || 'Verified Investor'}
                  </Text>
                  <Text style={styles.investorEmail} numberOfLines={1}>
                    {user.email || 'investor@capitalloop.pk'}
                  </Text>
                  <Text style={styles.accountIdText}>ID: SBP-INV-99214</Text>
                </View>
              </View>

              {/* Status pills */}
              <View style={styles.badgesRow}>
                <View style={styles.statusPillEmerald}>
                  <Text style={styles.statusPillTextEmerald}>✓ NADRA Cleared</Text>
                </View>
                <View style={styles.statusPillGold}>
                  <Text style={styles.statusPillTextGold}>✓ FBR Active Filer</Text>
                </View>
              </View>

              <View style={styles.netWorthSummaryRow}>
                <Text style={styles.netWorthLabel}>AUM Allocation:</Text>
                <Text style={styles.netWorthValue}>
                  {currencyToggle === 'PKR'
                    ? `Rs. ${totalPKR.toLocaleString()}`
                    : `$ ${(totalPKR / 278.5).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Section 1: Core Navigation Stations */}
            <Text style={styles.menuGroupHeader}>CORE PLATFORM</Text>

            <TouchableOpacity
              style={[styles.menuItem, currentRoute === 'Dashboard' && styles.menuItemActive]}
              onPress={() => handleNavigate('Dashboard')}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemIcon}>🏛️</Text>
              <Text style={[styles.menuItemLabel, currentRoute === 'Dashboard' && styles.menuItemLabelActive]}>
                Portfolio Overview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, currentRoute === 'LiveCharts' && styles.menuItemActive]}
              onPress={() => handleNavigate('LiveCharts')}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemIcon}>📈</Text>
              <Text style={[styles.menuItemLabel, currentRoute === 'LiveCharts' && styles.menuItemLabelActive]}>
                Market Intelligence & Signals
              </Text>
              <View style={styles.newBadgePill}>
                <Text style={styles.newBadgeText}>LIVE</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, currentRoute === 'AssetInput' && styles.menuItemActive]}
              onPress={() => handleNavigate('AssetInput')}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemIcon}>💼</Text>
              <Text style={[styles.menuItemLabel, currentRoute === 'AssetInput' && styles.menuItemLabelActive]}>
                Asset Vault & Installments
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, currentRoute === 'AiAdvisor' && styles.menuItemActive]}
              onPress={() => handleNavigate('AiAdvisor')}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemIcon}>🤖</Text>
              <Text style={[styles.menuItemLabel, currentRoute === 'AiAdvisor' && styles.menuItemLabelActive]}>
                AI Sovereign Wealth Advisor
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, currentRoute === 'LiveChat' && styles.menuItemActive]}
              onPress={() => handleNavigate('LiveChat')}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemIcon}>💬</Text>
              <Text style={[styles.menuItemLabel, currentRoute === 'LiveChat' && styles.menuItemLabelActive]}>
                Advisory Support Desk
              </Text>
              <View style={styles.liveIndicatorDot} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, currentRoute === 'KycRoute' && styles.menuItemActive]}
              onPress={() => handleNavigate('KycRoute')}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemIcon}>🪪</Text>
              <Text style={[styles.menuItemLabel, currentRoute === 'KycRoute' && styles.menuItemLabelActive]}>
                NADRA Biometric KYC
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, currentRoute === 'Profile' && styles.menuItemActive]}
              onPress={() => handleNavigate('Profile')}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemIcon}>👤</Text>
              <Text style={[styles.menuItemLabel, currentRoute === 'Profile' && styles.menuItemLabelActive]}>
                Investor Profile & Compliance
              </Text>
            </TouchableOpacity>

            {/* Section 2: Statutory Compliance */}
            <Text style={styles.menuGroupHeader}>REGULATORY & AUDIT</Text>

            <View style={styles.complianceCard}>
              <View style={styles.complianceRow}>
                <Text style={styles.complianceIcon}>🇵🇰</Text>
                <View style={styles.complianceTextCol}>
                  <Text style={styles.complianceTitle}>State Bank of Pakistan</Text>
                  <Text style={styles.complianceSub}>FX & Sovereign Sukuk Gateway</Text>
                </View>
              </View>

              <View style={styles.complianceRow}>
                <Text style={styles.complianceIcon}>🏛️</Text>
                <View style={styles.complianceTextCol}>
                  <Text style={styles.complianceTitle}>SECP Sandbox Directive</Text>
                  <Text style={styles.complianceSub}>Lic. #084 Non-Custodial Multi-Asset</Text>
                </View>
              </View>

              <View style={styles.complianceRow}>
                <Text style={styles.complianceIcon}>🧾</Text>
                <View style={styles.complianceTextCol}>
                  <Text style={styles.complianceTitle}>FBR Active Taxpayer List</Text>
                  <Text style={styles.complianceSub}>15% Reduced WHT Rate Applied</Text>
                </View>
              </View>

              <View style={styles.complianceRow}>
                <Text style={styles.complianceIcon}>🔒</Text>
                <View style={styles.complianceTextCol}>
                  <Text style={styles.complianceTitle}>PECA 2016 & PDPB 2023</Text>
                  <Text style={styles.complianceSub}>Hardware Key Encryption Active</Text>
                </View>
              </View>
            </View>

            {/* Section 3: Preferences & Actions */}
            <Text style={styles.menuGroupHeader}>PREFERENCES</Text>

            {/* Currency Switcher */}
            <TouchableOpacity
              style={styles.currencyToggleAction}
              onPress={() => dispatch(toggleCurrency())}
              activeOpacity={0.7}
            >
              <View style={styles.currencyLeftCol}>
                <Text style={styles.currencyActionIcon}>💱</Text>
                <Text style={styles.currencyActionLabel}>Reporting Currency</Text>
              </View>
              <View style={styles.currencyValPill}>
                <Text style={styles.currencyValText}>{currencyToggle} ⇄</Text>
              </View>
            </TouchableOpacity>

            {/* Sign Out Button */}
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
              activeOpacity={0.8}
            >
              <Text style={styles.signOutIcon}>🚪</Text>
              <Text style={styles.signOutText}>Secure Sign Out</Text>
            </TouchableOpacity>

            {/* Build & Version Stamp */}
            <View style={styles.versionFooter}>
              <Text style={styles.versionText}>Capital Loop Mobile v1.0.0 (Build 12)</Text>
              <Text style={styles.versionSubText}>SECP Sandbox Framework • SECP-FS-2026-084</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  drawerSurface: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    elevation: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  drawerScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  drawerHeader: {
    backgroundColor: '#0E141D',
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoIcon: {
    fontSize: 20,
  },
  brandTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  regRibbon: {
    marginTop: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  regRibbonText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  investorIdentityCard: {
    backgroundColor: '#F8FAFC',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  identityTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  avatarCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarCheckText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  identityTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  investorName: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  investorEmail: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  accountIdText: {
    color: '#0284C7',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  statusPillEmerald: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusPillTextEmerald: {
    color: '#047857',
    fontSize: 10,
    fontWeight: '700',
  },
  statusPillGold: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusPillTextGold: {
    color: '#B45309',
    fontSize: 10,
    fontWeight: '700',
  },
  netWorthSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  netWorthLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  netWorthValue: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  menuGroupHeader: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  menuItemActive: {
    backgroundColor: '#F1F5F9',
  },
  menuItemIcon: {
    fontSize: 18,
    width: 28,
  },
  menuItemLabel: {
    flex: 1,
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  menuItemLabelActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  newBadgePill: {
    backgroundColor: '#10B981',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  complianceCard: {
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  complianceIcon: {
    fontSize: 16,
    width: 24,
  },
  complianceTextCol: {
    flex: 1,
  },
  complianceTitle: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
  },
  complianceSub: {
    color: '#64748B',
    fontSize: 10,
  },
  currencyToggleAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  currencyLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyActionIcon: {
    fontSize: 16,
  },
  currencyActionLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  currencyValPill: {
    backgroundColor: '#0F172A',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  currencyValText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 8,
  },
  signOutIcon: {
    fontSize: 16,
  },
  signOutText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  versionFooter: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  versionText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  versionSubText: {
    color: '#CBD5E1',
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
});
