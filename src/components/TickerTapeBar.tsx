import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

interface TapeProps {
  gold: number;
  silver: number;
}

export const TickerTapeBar = ({ gold, silver }: TapeProps) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.item}>
          ⚡  Gold Spot Price: <Text style={styles.green}>Rs. {gold.toLocaleString()}/Tola</Text>
        </Text>
        <Text style={styles.divider}>|</Text>
        <Text style={styles.item}>
          ⚡  Silver Spot Price: <Text style={styles.green}>Rs. {silver.toLocaleString()}/Tola</Text>
        </Text>
        <Text style={styles.divider}>|</Text>
        <Text style={styles.item}>
          📊  PSX Market Feed: <Text style={styles.blue}>Live</Text>
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    backgroundColor: '#F8FAFC', /* Soft floating frosted ice strip canvas */
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderColor: '#E2E8F0' /* Subtle bounding light layout border line */
  },
  scroll: { 
    alignItems: 'center', 
    paddingHorizontal: 16 
  },
  item: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#475569', /* Deep readable slate-ink text labels */
    letterSpacing: -0.1 
  },
  green: { 
    color: '#059669', /* Deep organic moss-emerald green for safe reading */
    fontWeight: '700',
    fontVariant: ['tabular-nums']
  },
  blue: { 
    color: '#2563EB', /* Bold institutional tech sapphire blue */
    fontWeight: '700' 
  },
  divider: { 
    color: '#CBD5E1', /* Blends away harsh contrast dividers gracefully */
    marginHorizontal: 16, 
    fontWeight: '400' 
  }
});