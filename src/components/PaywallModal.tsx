import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { upgradeTier } from '../store/portfolioSlice';
import { RootState } from '../store';
import axios from 'axios';
import { getApiBaseUrl } from '../services/gatewayService';

export const PaywallModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.portfolio.user.token);
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      if (token) {
        await axios.post(
          `${getApiBaseUrl()}/api/Subscriptions/upgrade`,
          {},
          { headers: { Authorization: `Bearer ${token}`, 'X-Requested-With': 'XMLHttpRequest' } }
        );
      }
    } catch (e) {
      console.log('Online upgrade failed, applying local entitlement:', e);
    } finally {
      dispatch(upgradeTier());
      setIsUpgrading(false);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          
          {/* Header Badge */}
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>⭐ INSTITUTIONAL WEALTH TIER</Text>
          </View>
          
          <Text style={styles.title}>Unlock CapitalLoop Premium</Text>
          <Text style={styles.subtitle}>
            Full compliance suite, SECP Sandbox robo-advisory, and automated Pakistani asset sync.
          </Text>

          {/* Billing Switcher */}
          <View style={styles.billingToggle}>
            <TouchableOpacity 
              style={[styles.toggleBtn, billingPeriod === 'MONTHLY' && styles.toggleBtnActive]} 
              onPress={() => setBillingPeriod('MONTHLY')}
            >
              <Text style={[styles.toggleBtnText, billingPeriod === 'MONTHLY' && styles.toggleBtnTextActive]}>
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, billingPeriod === 'ANNUAL' && styles.toggleBtnActive]} 
              onPress={() => setBillingPeriod('ANNUAL')}
            >
              <Text style={[styles.toggleBtnText, billingPeriod === 'ANNUAL' && styles.toggleBtnTextActive]}>
                Annual (Save 17%)
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Price Block */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {billingPeriod === 'MONTHLY' ? 'Rs. 4,999' : 'Rs. 49,999'}
            </Text>
            <Text style={styles.duration}>
              {billingPeriod === 'MONTHLY' ? ' / month' : ' / year'}
            </Text>
          </View>
          
          {/* Features Comparison List */}
          <ScrollView style={styles.scroller} showsVerticalScrollIndicator={false}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔄</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Multi-Asset Automated Sync</Text>
                <Text style={styles.featureDesc}>Live Binance crypto tracking, AKD brokerage statement scraper & Gold Tolas.</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🛡️</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>SECP Sandbox Allocation Caps</Text>
                <Text style={styles.featureDesc}>Automatic portfolio stress testing against 2026 Pakistani legal ceiling limits.</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📑</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>FBR ATL Net-of-Tax Forecasting</Text>
                <Text style={styles.featureDesc}>36 & 120-month compounding wealth projections with Active Taxpayer savings.</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💬</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Accredited Consultant Desk</Text>
                <Text style={styles.featureDesc}>Real-time verified SECP advisors & FBR tax practitioners via priority channel.</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📉</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>PKR Devaluation Stress Testing</Text>
                <Text style={styles.featureDesc}>Simulate -5% to -50% currency shocks and calculate real purchasing power loss.</Text>
              </View>
            </View>
          </ScrollView>

          {/* Payment Rail Badges */}
          <View style={styles.paymentRailsRow}>
            <Text style={styles.paymentRailText}>Supported: 💳 Visa/Mastercard • 🏦 1Bill • ⚡ Raast</Text>
          </View>
          
          {/* Primary CTA */}
          <TouchableOpacity 
            style={[styles.buyBtn, isUpgrading && styles.buyBtnDisabled]} 
            onPress={handleUpgrade}
            disabled={isUpgrading}
            activeOpacity={0.8}
          >
            {isUpgrading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buyBtnTxt}>Upgrade Workspace</Text>
            )}
          </TouchableOpacity>
          
          {/* Dismissal */}
          <TouchableOpacity 
            style={styles.closeBtn} 
            onPress={onClose}
            activeOpacity={0.6}
          >
            <Text style={styles.closeBtnTxt}>Maybe Later</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center', 
    padding: 20 
  },
  content: { 
    backgroundColor: '#FFFFFF',
    borderRadius: 28, 
    padding: 24, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 8,
    maxHeight: '90%'
  },
  badgeContainer: {
    backgroundColor: '#EFF6FF', 
    paddingHorizontal: 12, 
    paddingVertical: 5, 
    borderRadius: 10, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  badgeText: { 
    color: '#2563EB',
    fontSize: 10, 
    fontWeight: '800',
    letterSpacing: 0.5
  },
  title: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#0F172A',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  price: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#0F172A',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums']
  },
  duration: { 
    fontSize: 14, 
    color: '#64748B', 
    fontWeight: '600',
    marginLeft: 4,
  },
  scroller: { 
    width: '100%', 
    maxHeight: 220,
    marginVertical: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 8,
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  paymentRailsRow: {
    marginVertical: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  paymentRailText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  buyBtn: { 
    backgroundColor: '#0F172A',
    width: '100%', 
    paddingVertical: 14, 
    borderRadius: 14, 
    alignItems: 'center', 
    marginTop: 4,
  },
  buyBtnDisabled: {
    opacity: 0.7,
  },
  buyBtnTxt: { 
    color: '#FFFFFF', 
    fontSize: 15, 
    fontWeight: '700',
    letterSpacing: -0.2
  },
  closeBtn: { 
    marginTop: 10, 
    paddingVertical: 8,
    alignItems: 'center' 
  },
  closeBtnTxt: { 
    color: '#64748B', 
    fontSize: 13, 
    fontWeight: '600' 
  }
});