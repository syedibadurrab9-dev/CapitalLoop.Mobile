import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { upgradeTier } from '../store/portfolioSlice';

export const PaywallModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const dispatch = useDispatch();
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.badge}>PRO ACCOUNT GATE</Text>
          <Text style={styles.title}>Unlock Premium Asset Features</Text>
          <Text style={styles.price}>$9.99 / Month</Text>
          <ScrollView style={styles.scroller} showsVerticalScrollIndicator={false}>
            <Text style={styles.feature}>🔄 Automated Core API Sync (Binance, PSX, Banks)</Text>
            <Text style={styles.feature}>📊 Live Streaming Multi-Asset Charts & Ticker Feeds</Text>
            <Text style={styles.feature}>🧠 Unlimited Real-time AI Portfolio Engine Chat</Text>
            <Text style={styles.feature}>🎯 Automated Age & Sector Cap Safety Guardrails</Text>
            <Text style={styles.feature}>🏢 Early Entry Notifications for Pre-Launch RE Files</Text>
            <Text style={styles.feature}>💬 Priority 24/7 Live Chat Support Desk Access</Text>
          </ScrollView>
          <TouchableOpacity style={styles.buyBtn} onPress={() => { dispatch(upgradeTier()); onClose(); }}>
            <Text style={styles.buyBtnTxt}>Upgrade Premium Layout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}><Text style={styles.closeBtnTxt}>Dismiss</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.9)', justifyContent: 'center', padding: 24 },
  content: { backgroundColor: '#1E293B', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  badge: { backgroundColor: '#6366F1', color: '#FFFFFF', fontSize: 10, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  price: { fontSize: 28, fontWeight: '900', color: '#10B981', marginVertical: 12 },
  scroller: { width: '100%', maxHeight: 180, marginBottom: 16 },
  feature: { color: '#94A3B8', fontSize: 13, fontWeight: '500', marginVertical: 6, lineHeight: 18 },
  buyBtn: { backgroundColor: '#FFFFFF', width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buyBtnTxt: { color: '#0F172A', fontWeight: '800', fontSize: 15 },
  closeBtn: { marginTop: 14 },
  closeBtnTxt: { color: '#64748B', fontWeight: '600', fontSize: 13 }
});