import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

export interface TapeProps {
  gold?: number;
  silver?: number;
  kse100?: number;
  kseChangePct?: number;
  usdPkr?: number;
  stockQuotes?: Record<string, number>;
}

export const TickerTapeBar = ({ 
  gold = 284500, 
  silver = 3350, 
  kse100 = 85240.15, 
  kseChangePct = +0.73,
  usdPkr = 278.45,
  stockQuotes = {
    'SYS': 468.20,
    'ENGRO': 329.50,
    'HUBC': 126.80,
    'OGDC': 144.30,
    'LUCK': 895.00,
    'MEBL': 242.10
  }
}: TapeProps) => {
  const isKseUp = (kseChangePct ?? 0) >= 0;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* SBP Non-Custodial Marker */}
        <View style={styles.regBadge}>
          <Text style={styles.regText}>🏛️ SBP BPRD/2026</Text>
        </View>
        <Text style={styles.divider}>|</Text>

        {/* KSE-100 Index */}
        <Text style={styles.item}>
          <Text style={styles.symLabel}>KSE-100 </Text>
          <Text style={isKseUp ? styles.green : styles.red}>
            {kse100.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}{' '}
            {isKseUp ? '▲ +' : '▼ '}{kseChangePct?.toFixed(2)}%
          </Text>
        </Text>
        <Text style={styles.divider}>|</Text>

        {/* Gold Spot */}
        <Text style={styles.item}>
          <Text style={styles.symLabel}>24K GOLD </Text>
          <Text style={styles.gold}>₨ {gold.toLocaleString()}/Tola</Text>
        </Text>
        <Text style={styles.divider}>|</Text>

        {/* USD / PKR */}
        <Text style={styles.item}>
          <Text style={styles.symLabel}>USD/PKR </Text>
          <Text style={styles.blue}>₨ {usdPkr.toFixed(2)}</Text>
        </Text>
        <Text style={styles.divider}>|</Text>

        {/* KIBOR 6M */}
        <Text style={styles.item}>
          <Text style={styles.symLabel}>KIBOR 6M </Text>
          <Text style={styles.teal}>14.85%</Text>
        </Text>

        {/* PSX Top Stocks */}
        {stockQuotes && Object.entries(stockQuotes).map(([symbol, price]) => (
          <React.Fragment key={symbol}>
            <Text style={styles.divider}>|</Text>
            <Text style={styles.item}>
              <Text style={styles.symLabel}>{symbol} </Text>
              <Text style={styles.stockPrice}>₨ {price.toFixed(2)}</Text>
            </Text>
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    backgroundColor: '#04070D',
    paddingVertical: 9, 
    borderBottomWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  scroll: { 
    alignItems: 'center', 
    paddingHorizontal: 16 
  },
  regBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  regText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  item: { 
    fontSize: 11, 
    fontWeight: '600', 
    color: '#94A3B8',
    letterSpacing: -0.1 
  },
  symLabel: {
    color: '#64748B',
    fontWeight: '700',
  },
  green: { 
    color: '#34D399',
    fontWeight: '700',
    fontVariant: ['tabular-nums']
  },
  gold: {
    color: '#F59E0B',
    fontWeight: '700',
    fontVariant: ['tabular-nums']
  },
  red: {
    color: '#F87171',
    fontWeight: '700',
    fontVariant: ['tabular-nums']
  },
  blue: { 
    color: '#38BDF8',
    fontWeight: '700',
    fontVariant: ['tabular-nums']
  },
  teal: {
    color: '#2DD4BF',
    fontWeight: '700',
    fontVariant: ['tabular-nums']
  },
  stockPrice: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontVariant: ['tabular-nums']
  },
  divider: { 
    color: '#1E293B',
    marginHorizontal: 12, 
    fontWeight: '400' 
  }
});
