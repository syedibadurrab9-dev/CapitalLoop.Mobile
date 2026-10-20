import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Platform 
} from 'react-native';

export type TabRouteName = 'Dashboard' | 'LiveCharts' | 'AssetInput' | 'LiveChat' | 'Profile';

interface BottomNavBarProps {
  activeRoute: TabRouteName;
  onNavigate: (route: TabRouteName) => void;
  unreadChatCount?: number;
  isAdvisorActive?: boolean;
}

interface TabItemConfig {
  key: TabRouteName;
  label: string;
  icon: string;
  activeIcon: string;
}

const TABS: TabItemConfig[] = [
  { key: 'Dashboard', label: 'Portfolio', icon: '🏛️', activeIcon: '🏛️' },
  { key: 'LiveCharts', label: 'Markets', icon: '📈', activeIcon: '📊' },
  { key: 'AssetInput', label: 'Vault', icon: '💼', activeIcon: '💼' },
  { key: 'LiveChat', label: 'Advisory', icon: '💬', activeIcon: '💬' },
  { key: 'Profile', label: 'Profile', icon: '👤', activeIcon: '🛡️' },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeRoute,
  onNavigate,
  unreadChatCount = 0,
  isAdvisorActive = true
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeRoute === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
              onPress={() => onNavigate(tab.key)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tab.label} tab`}
            >
              <View style={styles.iconContainer}>
                <Text style={[styles.tabIcon, isActive && styles.activeTabIcon]}>
                  {isActive ? tab.activeIcon : tab.icon}
                </Text>
                
                {/* Real-time Indicator for Advisory Chat */}
                {tab.key === 'LiveChat' && isAdvisorActive && (
                  <View style={styles.onlineBadgeDot} />
                )}

                {/* Unread badge if any */}
                {tab.key === 'LiveChat' && unreadChatCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>
                      {unreadChatCount > 9 ? '9+' : unreadChatCount}
                    </Text>
                  </View>
                )}

                {/* Active Indicator Top Pill */}
                {isActive && <View style={styles.activeIndicatorDot} />}
              </View>

              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    elevation: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 48,
    borderRadius: 12,
  },
  activeTabButton: {
    backgroundColor: '#F8FAFC',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 28,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.7,
  },
  activeTabIcon: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  onlineBadgeDot: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  activeIndicatorDot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0F172A',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  activeTabLabel: {
    color: '#0F172A',
    fontWeight: '700',
  },
});
