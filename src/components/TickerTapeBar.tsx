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
  gold = 278500, 
  silver = 3250, 
  kse100 = 104850.25, 
  kseChangePct = +0.52,
  usdPkr = 278.50,
  stockQuotes = {
    'SYS': 465.80,
    'ENGRO': 325.40,
    'HUBC': 124.60,
    'OGDC': 142.10,
    'LUCK': 890.50
  }
}: TapeProps) => {
  const isKseUp = (kseChangePct ?? 0) >= 0;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* KSE-100 Index */}
        <Text style={styles.item}>
          📈 KSE-100:{' '}
          <Text style={isKseUp ? styles.green : styles.red}>
            {kse100.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}{' '}
            ({isKseUp ? '+' : ''}{kseChangePct?.toFixed(2)}%)
          </Text>
        </Text>
        <Text style={styles.divider}>|</Text>

        {/* Gold Spot */}
        <Text style={styles.item}>
          🪙 Gold 24K: <Text style={styles.green}>Rs. {gold.toLocaleString()}/Tola</Text>
        </Text>
        <Text style={styles.divider}>|</Text>

        {/* Silver Spot */}
        <Text style={styles.item}>
          🪙 Silver: <Text style={styles.green}>Rs. {silver.toLocaleString()}/Tola</Text>
        </Text>
        <Text style={styles.divider}>|</Text>

        {/* USD / PKR */}
        <Text style={styles.item}>
          💵 USD/PKR: <Text style={styles.blue}>Rs. {usdPkr.toFixed(2)}</Text>
        </Text>

        {/* PSX Top Stocks */}
        {stockQuotes && Object.entries(stockQuotes).map(([symbol, price]) => (
          <React.Fragment key={symbol}>
            <Text style={styles.divider}>|</Text>
            <Text style={styles.item}>
              ⚡ {symbol}: <Text style={styles.stockPrice}>Rs. {price.toFixed(2)}</Text>
            </Text>
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    backgroundColor: '#F8FAFC',
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderColor: '#E2E8F0'
  },
  scroll: { 
    alignItems: 'center', 
    paddingHorizontal: 16 
  },
  item: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#475569',
    letterSpacing: -0.1 
  },
  green: { 
    color: '#059669',
    fontWeight: '700',
    fontVariant: ['tabular-nums']
  },
  red: {
    color: '#DC2626',
    fontWeight: '700',
    fontVariant: ['tabular-nums']
  },
  blue: { 
    color: '#2563EB',
    fontWeight: '700' 
  },
  stockPrice: {
    color: '#0F172A',
    fontWeight: '700',
    fontVariant: ['tabular-nums']
  },
  divider: { 
    color: '#CBD5E1',
    marginHorizontal: 14, 
    fontWeight: '400' 
  }
});