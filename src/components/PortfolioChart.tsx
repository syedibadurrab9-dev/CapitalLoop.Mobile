import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AssetNode } from '../store/portfolioSlice';

// Core color system aligned across the dashboard chart matrices
const CHART_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#0EA5E9', '#EC4899', '#8B5CF6'];

export const PortfolioChart = ({ assets }: { assets: AssetNode[] }) => {
  // Aggregate absolute overall portfolio value in localized PKR
  const total = assets.reduce((sum, a) => sum + a.holdingValuePKR, 0);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visual Asset Density</Text>
      
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
              <Text style={styles.legendTxt}>
                {asset.name} <Text style={styles.percentageTxt}>{pct.toFixed(1)}%</Text>
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
    backgroundColor: '#1E293B', 
    padding: 20, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#334155', 
    marginVertical: 16 
  },
  title: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#94A3B8', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5, 
    marginBottom: 14 
  },
  barContainer: { 
    height: 12, 
    width: '100%', 
    backgroundColor: '#0F172A', 
    borderRadius: 6, 
    flexDirection: 'row', 
    overflow: 'hidden' 
  },
  segment: { height: '100%' },
  legendRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginTop: 16 
  },
  legendItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 14, 
    marginVertical: 4 
  },
  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    marginRight: 6 
  },
  legendTxt: { 
    color: '#94A3B8', // Lifted visibility to align with dark mode card layouts
    fontSize: 12, 
    fontWeight: '600' 
  },
  percentageTxt: {
    color: '#38BDF8', // Cyan callout styling for clear visual scanning
    fontWeight: '700',
    fontSize: 11,
    marginLeft: 2
  }
});