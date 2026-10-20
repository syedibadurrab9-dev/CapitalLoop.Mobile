import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AssetNode } from '../store/portfolioSlice';

// Sovereign palette matching institutional asset classes
const CHART_COLORS = ['#10B981', '#F59E0B', '#0284C7', '#8B5CF6', '#EC4899', '#14B8A6'];

export const PortfolioChart = ({ assets }: { assets: AssetNode[] }) => {
  // Aggregate absolute overall portfolio value in localized PKR
  const total = assets.reduce((sum, a) => sum + a.holdingValuePKR, 0);
  
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Asset Allocation Breakdown</Text>
        <Text style={styles.badge}>SECP DIVERSIFIED</Text>
      </View>
      
      {/* Structural Distribution Bar Stack */}
      <View style={styles.barContainer}>
        {assets.map((asset, index) => {
          const pct = total > 0 ? (asset.holdingValuePKR / total) * 100 : 0;
          if (pct === 0) return null;
          
          return (
            <View 
              key={asset.id} 
              style={[
                styles.segment, 
                { 
                  width: `${pct}%`, 
                  backgroundColor: CHART_COLORS[index % CHART_COLORS.length] 
                }
              ]} 
            />
          );
        })}
      </View>
      
      {/* Comprehensive Metric Legend Matrix */}
      <View style={styles.legendRow}>
        {assets.map((asset, index) => {
          const pct = total > 0 ? (asset.holdingValuePKR / total) * 100 : 0;
          
          return (
            <View key={asset.id} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }]} />
              
              <Text style={styles.legendTxt} numberOfLines={1}>
                {asset.name}
              </Text>
              
              <Text style={styles.percentageTxt}>
                {pct.toFixed(1)}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    backgroundColor: '#FFFFFF', 
    padding: 20, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    marginVertical: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: { 
    fontSize: 12.5, 
    fontWeight: '800', 
    color: '#0F172A', 
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  badge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  barContainer: { 
    height: 10, 
    width: '100%', 
    backgroundColor: '#F1F5F9', 
    borderRadius: 5, 
    flexDirection: 'row', 
    overflow: 'hidden',
    gap: 1.5 
  },
  segment: { 
    height: '100%' 
  },
  legendRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginTop: 14,
    rowGap: 10,
    columnGap: 14
  },
  legendItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
    minWidth: '45%',
    maxWidth: '100%',
    paddingVertical: 2
  },
  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    marginRight: 8 
  },
  legendTxt: { 
    color: '#334155', 
    fontSize: 12, 
    fontWeight: '600', 
    letterSpacing: -0.1,
    marginRight: 6,
    flexShrink: 1
  },
  percentageTxt: {
    color: '#059669', 
    fontWeight: '800',
    fontSize: 12,
    fontVariant: ['tabular-nums']
  }
});
