import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AssetNode } from '../store/portfolioSlice';

// Core light-mode color system aligned across the dashboard chart matrices
const CHART_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#0EA5E9', '#EC4899', '#8B5CF6'];

export const PortfolioChart = ({ assets }: { assets: AssetNode[] }) => {
  // Aggregate absolute overall portfolio value in localized PKR
  const total = assets.reduce((sum, a) => sum + a.holdingValuePKR, 0);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Asset Allocation</Text>
      
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
              
              {/* 🚀 FIXED: Dynamic flex-shrink layout allows text to utilize maximum space without cutting off early */}
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
    padding: 24, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    marginVertical: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2
  },
  title: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#334155', 
    letterSpacing: -0.2, 
    marginBottom: 16 
  },
  barContainer: { 
    height: 14, 
    width: '100%', 
    backgroundColor: '#F1F5F9', 
    borderRadius: 7, 
    flexDirection: 'row', 
    overflow: 'hidden',
    gap: 1 
  },
  segment: { 
    height: '100%' 
  },
  legendRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginTop: 18,
    rowGap: 12,
    columnGap: 16 /* Generates premium negative space gaps between wrapped legend items */
  },
  legendItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
    // 🚀 FIXED: Dynamic width behavior lets items size themselves gracefully based on layout density
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
    color: '#475569', 
    fontSize: 12, 
    fontWeight: '600',
    letterSpacing: -0.1,
    marginRight: 6,
    // 🚀 FIXED: Safely compresses text labels to allow adjacent percentage metrics to render flawlessly
    flexShrink: 1
  },
  percentageTxt: {
    color: '#2563EB', 
    fontWeight: '700',
    fontSize: 12,
    fontVariant: ['tabular-nums']
  }
});