import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { completeOnboarding, setGoogleAuth } from '../store/portfolioSlice';
import { ActionButton } from '../components/ActionButton';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  badge: string;
  icon: string;
  title: string;
  description: string;
  highlights: string[];
  statLabel: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 0,
    badge: 'MULTI-ASSET WEALTH ENGINE',
    icon: '🏛️',
    title: 'Consolidate All Your Pakistani & Global Holdings',
    description:
      'Track PSX equities, mutual funds, 24K Sarafa gold tolas, DHA plot files, and SBP-compliant Binance crypto in a single sovereign dashboard.',
    highlights: [
      'Live KSE-100 & bullion exchange scraping',
      'Real estate installment equity tracker',
      'Instant PKR / USD currency conversion',
    ],
    statLabel: 'Rs. 242,000 / Tola Gold • KSE-100 Live',
  },
  {
    id: 1,
    badge: 'SECP REGULATORY RISK GUARD',
    icon: '🛡️',
    title: 'Automated Concentration Limits & AI Suitability',
    description:
      'Safeguard your capital from catastrophic drawdowns with automatic 30% sector concentration alerts and statutory SECP digital suitability profiling.',
    highlights: [
      'SECP 5-step digital risk profiling wizard',
      'Concentration violation detection (CL-305)',
      'PKR currency devaluation stress sandboxes',
    ],
    statLabel: 'SECP FinTech Sandbox Directive 2026',
  },
  {
    id: 2,
    badge: 'TAX-OPTIMIZED COMPOUNDING',
    icon: '📈',
    title: '120-Month Wealth Forecasting with FBR Filer Drag',
    description:
      'Model your long-term compounding trajectory with dynamic tax drag calculations comparing FBR Active Taxpayer (ATL) Filers vs Non-Filers.',
    highlights: [
      '120-Month multi-asset compounding projection',
      '15% Filer vs 30% Non-Filer CGT differential',
      'Direct SignalR chat with SECP-licensed advisors',
    ],
    statLabel: '15% vs 30% CGT Differential Engine',
  },
];

export default function OnboardingScreen({ navigation }: NativeStackScreenProps<any>) {
  const dispatch = useDispatch();
  const [activeSlide, setActiveSlide] = useState(0);

  const currentSlide = SLIDES[activeSlide];

  const handleNext = () => {
    if (activeSlide < SLIDES.length - 1) {
      setActiveSlide(activeSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    dispatch(completeOnboarding());
    navigation.navigate('Auth');
  };

  const handleExploreSample = () => {
    dispatch(completeOnboarding());
    dispatch(
      setGoogleAuth({
        name: 'Demo Citizen Investor',
        email: 'demo.investor@capitalloop.pk',
        token: `demo-token-${Date.now()}`,
        isPremiumUser: false,
        role: 'Investor',
        tier: 'free',
        kycStatus: 'Unverified',
        licenseNumber: null,
      })
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top Brand Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>♾️</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>CapitalLoop</Text>
            <Text style={styles.brandSub}>Pakistan Sovereign Wealth</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleGetStarted} style={styles.skipBtn}>
          <Text style={styles.skipTxt}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slide Carousel Card */}
      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <View style={styles.slideCard}>
          {/* Regulatory Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryTxt}>{currentSlide.badge}</Text>
          </View>

          {/* Visual Hero Icon */}
          <View style={styles.iconCircle}>
            <Text style={styles.heroIcon}>{currentSlide.icon}</Text>
          </View>

          {/* Title & Description */}
          <Text style={styles.slideTitle}>{currentSlide.title}</Text>
          <Text style={styles.slideDesc}>{currentSlide.description}</Text>

          {/* Feature Highlights Checklist */}
          <View style={styles.highlightsContainer}>
            {currentSlide.highlights.map((item, idx) => (
              <View key={idx} style={styles.highlightRow}>
                <View style={styles.checkDot}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
                <Text style={styles.highlightTxt}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Stat Footer Pill */}
          <View style={styles.statPill}>
            <Text style={styles.statPillTxt}>💡 {currentSlide.statLabel}</Text>
          </View>
        </View>

        {/* Carousel Pagination Dots */}
        <View style={styles.paginationRow}>
          {SLIDES.map((slide, idx) => (
            <TouchableOpacity
              key={slide.id}
              style={[
                styles.dot,
                activeSlide === idx ? styles.dotActive : styles.dotInactive,
              ]}
              onPress={() => setActiveSlide(idx)}
              activeOpacity={0.7}
            />
          ))}
        </View>

        {/* Action Button Cluster */}
        <View style={styles.actionCluster}>
          <ActionButton
            title={activeSlide === SLIDES.length - 1 ? 'Get Started with Google SSO (PKCE)' : 'Continue Journey →'}
            onPress={handleNext}
            variant="primary"
          />

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={handleExploreSample}
            activeOpacity={0.7}
          >
            <Text style={styles.demoBtnText}>🚀 Explore Sample Portfolio Demo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginRedirectBtn}
            onPress={handleGetStarted}
            activeOpacity={0.7}
          >
            <Text style={styles.loginRedirectText}>
              Already have an account? <Text style={styles.loginLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Regulatory Governance Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerNotice}>
            🔒 Regulated under SECP FinTech Sandbox Directive 2026
          </Text>
          <Text style={styles.footerLegal}>
            Biometric and Smart CNIC documents protected under Pakistan Personal Data Protection Bill (PDPB).
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  logoIcon: {
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  skipTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  scrollBody: {
    padding: 20,
    paddingBottom: 40,
  },
  slideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 16,
  },
  categoryTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.4,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIcon: {
    fontSize: 32,
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
    marginBottom: 10,
    lineHeight: 28,
  },
  slideDesc: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 21,
    marginBottom: 20,
  },
  highlightsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '800',
  },
  highlightTxt: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  statPill: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statPillTxt: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#2563EB',
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#CBD5E1',
  },
  actionCluster: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  demoBtn: {
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  demoBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  loginRedirectBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  loginRedirectText: {
    fontSize: 13,
    color: '#64748B',
  },
  loginLink: {
    color: '#2563EB',
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerNotice: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  footerLegal: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 14,
  },
});
