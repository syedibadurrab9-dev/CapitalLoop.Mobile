import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { upgradeTier } from '../store/portfolioSlice';

export const PaywallModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const dispatch = useDispatch();

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          
          {/* Aspirational Header Badge */}
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>CapitalLoop Premium</Text>
          </View>
          
          <Text style={styles.title}>Unlock Full Access</Text>
          
          {/* Premium Value Pricing Block */}
          <Text style={styles.price}>$9.99<Text style={styles.duration}> / Month</Text></Text>
          
          {/* Frosted Multi-Feature Comparison List */}
          <ScrollView style={styles.scroller} showsVerticalScrollIndicator={false}>
            <Text style={styles.feature}>🔄   Automated Live API Sync (Binance, PSX, Banks)</Text>
            <Text style={styles.feature}>📊   Real-Time Multi-Asset Charts & Feeds</Text>
            <Text style={styles.feature}>🧠   Unlimited AI Financial Copilot Insights</Text>
            <Text style={styles.feature}>🎯   Smart Risk Limits & Safe Asset Cap Alerts</Text>
            <Text style={styles.feature}>🏢   Early Notifications for Premium Real Estate</Text>
            <Text style={styles.feature}>💬   Priority 24/7 Live Support Lounge Access</Text>
          </ScrollView>
          
          {/* Primary Call To Action */}
          <TouchableOpacity 
            style={styles.buyBtn} 
            onPress={() => { dispatch(upgradeTier()); onClose(); }}
            activeOpacity={0.8}
          >
            <Text style={styles.buyBtnTxt}>Upgrade Workspace</Text>
          </TouchableOpacity>
          
          {/* Subdued Dismissal Option */}
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
    backgroundColor: 'rgba(15, 23, 42, 0.4)', /* Frosted elegant clear slate filter sheet */
    justifyContent: 'center', 
    padding: 24 
  },
  content: { 
    backgroundColor: '#FFFFFF', /* Pristine crisp paper white */
    borderRadius: 28, 
    padding: 26, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8
  },
  badgeContainer: {
    backgroundColor: '#EFF6FF', 
    paddingHorizontal: 12, 
    paddingVertical: 5, 
    borderRadius: 10, 
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  badgeText: { 
    color: '#2563EB', /* Bold institutional tech sapphire blue */
    fontSize: 11, 
    fontWeight: '700',
    letterSpacing: 0.2
  },
  title: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#0F172A', /* Elegant ink slate primary text color */
    letterSpacing: -0.4
  },
  price: { 
    fontSize: 34, 
    fontWeight: '800', 
    color: '#0F172A', 
    marginTop: 14,
    marginBottom: 20,
    letterSpacing: -0.5
  },
  duration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B'
  },
  scroller: { 
    width: '100%', 
    maxHeight: 190, 
    marginBottom: 20,
    backgroundColor: '#F8FAFC', /* Soft floating background deck */
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  feature: { 
    color: '#475569', /* Soft highly-readable slate description prose */
    fontSize: 13, 
    fontWeight: '600', 
    marginVertical: 6, 
    lineHeight: 20,
    letterSpacing: -0.1
  },
  buyBtn: { 
    backgroundColor: '#2563EB', /* Vibrant corporate conversion driver blue */
    width: '100%', 
    paddingVertical: 16, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginTop: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3
  },
  buyBtnTxt: { 
    color: '#FFFFFF', 
    fontWeight: '700', 
    fontSize: 15,
    letterSpacing: -0.1
  },
  closeBtn: { 
    marginTop: 16,
    paddingVertical: 4
  },
  closeBtnTxt: { 
    color: '#64748B', 
    fontWeight: '700', 
    fontSize: 13,
    letterSpacing: -0.1
  }
});