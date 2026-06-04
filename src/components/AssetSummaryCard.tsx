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
          <View style={[
            styles.syncBadge, 
            isAutoSynced ? styles.badgeAuto : styles.badgeManual
          ]}>
            <Text style={[
              styles.syncTxt, 
              { color: isAutoSynced ? '#059669' : '#475569' }
            ]}>
              {isAutoSynced ? 'Auto Synced' : 'Manual Ledger'}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.val}>{valueDisplay}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', /* Pristine crisp paper white */
    paddingHorizontal: 20, 
    paddingVertical: 18, 
    borderRadius: 20, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', /* Feather-light tracking border lines */
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2
  },
  meta: { 
    flex: 1, 
    paddingRight: 16 
  },
  title: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#0F172A', /* High-contrast elegant slate ink */
    letterSpacing: -0.2
  },
  badgeRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 6 
  },
  categoryTxt: { 
    fontSize: 11, 
    color: '#64748B', 
    fontWeight: '600', 
    textTransform: 'uppercase',
    letterSpacing: 0.2
  },
  syncBadge: { 
    marginLeft: 10, 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 8 
  },
  badgeAuto: {
    backgroundColor: '#E6F4EA' /* Soft moss-mint container */
  },
  badgeManual: {
    backgroundColor: '#F1F5F9' /* Clean cool slate tint container */
  },
  syncTxt: { 
    fontSize: 10, 
    fontWeight: '700',
    letterSpacing: -0.1
  },
  val: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#0F172A',
    fontVariant: ['tabular-nums'] /* Ensures numerical stacks align uniformly without shifts */
  }
});