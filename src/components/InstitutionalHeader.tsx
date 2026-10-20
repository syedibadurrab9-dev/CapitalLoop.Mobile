import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { toggleCurrency } from '../store/portfolioSlice';

interface InstitutionalHeaderProps {
  title?: string;
  onOpenDrawer: () => void;
  onOpenProfile: () => void;
  showBack?: boolean;
  onBack?: () => void;
}

export const InstitutionalHeader: React.FC<InstitutionalHeaderProps> = ({
  title = 'CAPITAL LOOP',
  onOpenDrawer,
  onOpenProfile,
  showBack = false,
  onBack,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, currencyToggle } = useSelector((state: RootState) => state.portfolio);

  const initials = (user.name || 'Investor')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        {/* Left Action: Hamburger or Back */}
        <View style={styles.leftGroup}>
          {showBack && onBack ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onBack}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Back button"
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onOpenDrawer}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Open navigation menu"
            >
              <Text style={styles.hamburgerIcon}>☰</Text>
            </TouchableOpacity>
          )}

          {/* Logo or Title */}
          <View style={styles.titleCol}>
            <Text style={styles.brandTitleText} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.brandSubText}>SECP #084 • SBP GATEWAY</Text>
          </View>
        </View>

        {/* Right Actions: Currency Toggle + User Profile Avatar */}
        <View style={styles.rightGroup}>
          {/* Currency Toggle */}
          <TouchableOpacity
            style={styles.currencyTogglePill}
            onPress={() => dispatch(toggleCurrency())}
            activeOpacity={0.8}
            accessibilityLabel="Switch currency"
          >
            <Text style={styles.currencyToggleText}>{currencyToggle} ⇄</Text>
          </TouchableOpacity>

          {/* User Profile Avatar with Verification Badge */}
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={onOpenProfile}
            activeOpacity={0.8}
            accessibilityLabel="Open investor profile"
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitialsText}>{initials}</Text>
              <View
                style={[
                  styles.statusDot,
                  user.kycStatus === 'Approved' ? styles.statusDotApproved : styles.statusDotPending,
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#0E141D',
    paddingTop: Platform.OS === 'ios' ? 48 : 32,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  hamburgerIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  titleCol: {
    marginLeft: 12,
    flex: 1,
  },
  brandTitleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandSubText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currencyTogglePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  currencyToggleText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  avatarButton: {
    padding: 2,
  },
  avatarCircle: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  avatarInitialsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  statusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#0E141D',
  },
  statusDotApproved: {
    backgroundColor: '#10B981',
  },
  statusDotPending: {
    backgroundColor: '#F59E0B',
  },
});
