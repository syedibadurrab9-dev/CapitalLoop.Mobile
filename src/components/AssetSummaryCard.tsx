import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CardProps {
  name: string;
  category: string;
  valueDisplay: string;
  isAutoSynced: boolean;
}

export const AssetSummaryCard = ({ name, category, valueDisplay, isAutoSynced }: CardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>{name}</Text>
        <View style={styles.badgeRow}>
          <Text style={styles.categoryTxt}>{category.replace('_', ' ')}</Text>
          <View style={[styles.syncBadge, { backgroundColor: isAutoSynced ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)' }]}>
            <Text style={[styles.syncTxt, { color: isAutoSynced ? '#10B981' : '#94A3B8' }]}>
              {isAutoSynced ? '● API SYNCED' : 'MANUAL'}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.val}>{valueDisplay}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', padding: 18, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  meta: { flex: 1, paddingRight: 12 },
  title: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  categoryTxt: { fontSize: 12, color: '#64748B', fontWeight: '600', textTransform: 'uppercase' },
  syncBadge: { marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  syncTxt: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  val: { fontSize: 16, fontWeight: '800', color: '#F8FAFC' }
});