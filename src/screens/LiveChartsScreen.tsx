import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { PortfolioChart } from '../components/PortfolioChart';

export default function LiveChartsScreen() {
  const assets = useSelector((state: RootState) => state.portfolio.assets);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Market Analytics</Text>
      <Text style={styles.subtitle}>Real-time performance tracking and live allocation data metrics.</Text>
      
      {/* Dynamic allocation chart module */}
      <PortfolioChart assets={assets} />

      {/* Live Activity Stream Feed */}
      <View style={styles.feedCard}>
        <Text style={styles.feedHeader}>Live Data Feeds</Text>
        
        <View style={styles.feedItemRow}>
          <Text style={styles.feedStatusDot}>🟢</Text>
          <Text style={styles.feedItem}>AKD PSX Connection: Data feed verified (+1.08%)</Text>
        </View>
        
        <View style={styles.feedItemRow}>
          <Text style={styles.feedStatusDot}>🟢</Text>
          <Text style={styles.feedItem}>Binance Socket: Stream pipeline secure and steady.</Text>
        </View>
        
        <View style={styles.feedItemRow}>
          <Text style={styles.feedStatusDot}>🏢</Text>
          <Text style={styles.feedItem}>Real Estate Updates: Market price variances updated.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F1F5F9' /* Premium soft light grey slate base canvas */
  },
  content: { 
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40
  },
  title: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: '#0F172A', /* Saturated deep ink slate */
    marginBottom: 4,
    letterSpacing: -0.5
  },
  subtitle: { 
    fontSize: 13, 
    color: '#64748B', 
    marginBottom: 16,
    lineHeight: 20,
    letterSpacing: -0.1
  },
  feedCard: { 
    backgroundColor: '#FFFFFF', /* Pristine crisp paper white icon backplate */
    padding: 24, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    marginTop: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2
  },
  feedHeader: { 
    color: '#0F172A', 
    fontSize: 15, 
    fontWeight: '700', 
    marginBottom: 16,
    letterSpacing: -0.2
  },
  feedItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
  },
  feedStatusDot: {
    fontSize: 12,
    marginRight: 10,
    marginTop: 2,
  },
  feedItem: { 
    flex: 1,
    color: '#475569', /* Muted premium description slate text */
    fontSize: 13, 
    fontWeight: '500',
    lineHeight: 18,
    letterSpacing: -0.1
  }
});