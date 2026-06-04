import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TapeProps {
  gold: number;
  silver: number;
}

export const TickerTapeBar = ({ gold, silver }: TapeProps) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.item}>⚡ GOLD SPOT COREGATE: <Text style={styles.green}>Rs.{gold.toLocaleString()}/Tola</Text></Text>
        <Text style={styles.divider}>|</Text>
        <Text style={styles.item}>⚡ SILVER SPOT COREGATE: <Text style={styles.green}>Rs.{silver.toLocaleString()}/Tola</Text></Text>
        <Text style={styles.divider}>|</Text>
        <Text style={styles.item}>🏛️ PSX INDEX RECONCILIATION: <Text style={styles.indigo}>ACTIVE</Text></Text>
      </ScrollView>
    </View>
  );
};
import { ScrollView } from 'react-native';
const styles = StyleSheet.create({
  container: { backgroundColor: '#1E293B', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#334155' },
  scroll: { alignItems: 'center', paddingHorizontal: 16 },
  item: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5 },
  green: { color: '#10B981' },
  indigo: { color: '#818CF8' },
  divider: { color: '#334155', marginHorizontal: 16, fontWeight: '700' }
});