import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { PortfolioChart } from '../components/PortfolioChart';

export default function LiveChartsScreen() {
  const assets = useSelector((state: RootState) => state.portfolio.assets);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dynamic Allocation Streams</Text>
      <Text style={styles.subtitle}>Streaming live metrics reflecting multi-asset ledger density flags.</Text>
      
      <PortfolioChart assets={assets} />

      <View style={styles.feedCard}>
        <Text style={styles.feedHeader}>Live API Stream Delta Log</Text>
        <Text style={styles.feedItem}>🟢 AKD PSX API: Order Book Delta Verified (+1.08%)</Text>
        <Text style={styles.feedItem}>🟢 Binance Socket: Stream pipeline steady.</Text>
        <Text style={styles.feedItem}>🏢 Real Estate Notice: Bahria Town File variance updated.</Text>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 20 },
  title: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#64748B', marginBottom: 10 },
  feedCard: { backgroundColor: '#1E293B', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#334155', marginTop: 12 },
  feedHeader: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  feedItem: { color: '#94A3B8', fontSize: 12, marginVertical: 4, fontFamily: 'monospace', lineHeight: 18 }
});