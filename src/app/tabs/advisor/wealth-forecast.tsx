import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, SafeAreaView, Dimensions, Platform } from 'react-native';
import { useAdvisorStore } from '../../../core/store/advisor.store';
import { ChartDataCoordinates } from '../../../core/types/advisor.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WealthForecastScreen() {
  // ⚡ Hook straight into your global advisory store container slice
  const { projections, isLoading, fetchForecastProjectionsAsync } = useAdvisorStore();
  
  // 🎛️ Active Sub-Timeline Filter Handle Configuration
  const [activeTimeline, setActiveTimeline] = useState<'36' | '120'>('36');

  useEffect(() => {
    fetchForecastProjectionsAsync();
  }, []);

  const activePoints: ChartDataCoordinates[] = activeTimeline === '36' 
    ? projections?.thirtySixMonthTrend || [] 
    : projections?.oneHundredTwentyMonthTrend || [] ;

  // 📐 Pure Inline Geometric Scalar Layout Calculators
  const maxProjectedValue = activePoints.length > 0 
    ? Math.max(...activePoints.map(p => p.projectedValuePkr)) 
    : 1000000;

  const minProjectedValue = activePoints.length > 0 
    ? Math.min(...activePoints.map(p => p.projectedValuePkr)) 
    : 0;

  const chartHeight = 180;
  const graphCanvasWidth = SCREEN_WIDTH - 48; // Account for full horizontal screen padding fields

  return (
    <SafeAreaView style={styles.masterContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0c111d" />

      {/* HEADER CONTROLS SECTION */}
      <View style={styles.headerFlexRow}>
        <View>
          <Text style={styles.screenTitleHeader}>Wealth Forecast</Text>
          <Text style={styles.screenSubTitleHeader}>Algorithmic Compound Trajectories</Text>
        </View>
        
        {projections && (
          <View style={styles.cagrBadgeHighlightContainer}>
            <Text style={styles.cagrBadgePercentageLabel}>
              +{projections.compoundAnnualGrowthRateExpected}% CAGR
            </Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainerModifier} showsVerticalScrollIndicator={false}>
        
        {/* TIMELINE TIMEFRAME HORIZONTAL SEGMENT BUTTON SELECTOR */}
        <View style={styles.segmentedFilterRowFrame}>
          <TouchableOpacity 
            onPress={() => setActiveTimeline('36')}
            activeOpacity={0.8}
            style={[styles.timeframeSegmentButton, activeTimeline === '36' && styles.timeframeSegmentButtonActive]}
          >
            <Text style={[styles.timeframeButtonText, activeTimeline === '36' && styles.timeframeButtonTextActive]}>
              36-Month Horizon (Medium-Term SIP)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setActiveTimeline('120')}
            activeOpacity={0.8}
            style={[styles.timeframeSegmentButton, activeTimeline === '120' && styles.timeframeSegmentButtonActive]}
          >
            <Text style={[styles.timeframeButtonText, activeTimeline === '120' && styles.timeframeButtonTextActive]}>
              120-Month Pool (Long-Term Wealth)
            </Text>
          </TouchableOpacity>
        </View>

        {/* =============================================================================
            📈 CONTAINERIZED VECTOR GRAPH VISUALIZATION ENGINE 
           ============================================================================= */}
        <View style={styles.chartCanvasDisplayCard}>
          <Text style={styles.chartCardMiniTitleLabel}>COMPOUND INTEREST ACCUMULATION GAP</Text>

          {isLoading ? (
            <View style={styles.chartLoaderFallbackWrapper}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={styles.loadingAwaitingLabelText}>Querying local projection metrics matrices...</Text>
            </View>
          ) : activePoints.length === 0 ? (
            <View style={styles.chartLoaderFallbackWrapper}>
              <Text style={styles.loadingAwaitingLabelText}>No coordinates returned over active proxy gateway link.</Text>
            </View>
          ) : (
            <View>
              {/* Top Peak Value Readout HUD */}
              <View style={styles.topPeakValueReadoutHeaderRow}>
                <Text style={styles.peakMetricLabelValue}>
                  Peak: PKR {maxProjectedValue.toLocaleString('en-PK')}
                </Text>
              </View>

              {/* Core Bar Graph Distribution Elements Grid */}
              <View style={[styles.barsLayoutFlexContainerRow, { height: chartHeight }]}>
                {activePoints.map((point, index) => {
                  // Normalize heights relative to maximum projected array baseline thresholds
                  const normalizedBarHeight = maxProjectedValue > 0 
                    ? (point.projectedValuePkr / maxProjectedValue) * chartHeight 
                    : 10;

                  return (
                    <View key={`${point.monthIndex}-${index}`} style={styles.individualBarAnchorColumn}>
                      {/* Bar Fill Vector */}
                      <View 
                        style={[
                          styles.verticalGraphInteractiveBarFill, 
                          { 
                            height: Math.max(normalizedBarHeight, 6),
                            backgroundColor: index === activePoints.length - 1 ? '#10b981' : '#1e293b'
                          }
                        ]} 
                      />
                      {/* Bottom Time Interval Tag Token Label */}
                      <Text style={styles.barIntervalLabelToken}>{point.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* FORECASTING METRICS ANALYTICS INFORMATION TABLE */}
        <Text style={styles.sectionHeadingTitleText}>Trajectory Milestones</Text>
        
        {activePoints.map((point, idx) => (
          <View key={`list-${point.monthIndex}-${idx}`} style={styles.milestoneItemizedTableRow}>
            <View style={styles.milestoneLeftContentFlex}>
              <View style={[styles.statusMarkerCircleDot, { backgroundColor: idx === activePoints.length - 1 ? '#10b981' : '#334155' }]} />
              <Text style={styles.milestoneIntervalPrimaryText}>{point.label === "0" ? "Inception" : `End of ${point.label}`}</Text>
            </View>
            <Text style={styles.milestoneCalculatedPkrValuationText}>
              PKR {Math.round(point.projectedValuePkr).toLocaleString('en-PK')}
            </Text>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

// =============================================================================
// 🎨 PREMIUM ULTRA-SLATE ADVANCED GRAPH VISUAL ENGINE STYLING
// =============================================================================
const styles = StyleSheet.create({
  masterContainer: { flex: 1, backgroundColor: '#0c111d' },
  headerFlexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.select({ ios: 16, android: 24 }), paddingBottom: 16, borderBottomWidth: 1, borderColor: '#1e293b' },
  screenTitleHeader: { fontSize: 18, fontWeight: '900', color: '#ffffff', letterSpacing: -0.4 },
  screenSubTitleHeader: { fontSize: 10, fontWeight: '600', color: '#64748b', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  cagrBadgeHighlightContainer: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  cagrBadgePercentageLabel: { fontSize: 11, fontWeight: '800', color: '#10b981' },
  scrollContainerModifier: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 120 },
  segmentedFilterRowFrame: { flexDirection: 'row', backgroundColor: '#0f172a', padding: 4, borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', marginBottom: 24 },
  timeframeSegmentButton: { flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  timeframeSegmentButtonActive: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  timeframeButtonText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  timeframeButtonTextActive: { color: '#ffffff' },
  chartCanvasDisplayCard: { width: '100%', backgroundColor: '#10172a', borderRadius: 24, borderWidth: 1, borderColor: '#1e293b', padding: 20, marginBottom: 32 },
  chartCardMiniTitleLabel: { fontSize: 9, fontWeight: '800', color: '#64748b', letterSpacing: 1.5, marginBottom: 16 },
  chartLoaderFallbackWrapper: { width: '100%', height: 200, alignItems: 'center', justifyContent: 'center' },
  loadingAwaitingLabelText: { fontSize: 12, fontWeight: '500', color: '#475569', marginTop: 12 },
  topPeakValueReadoutHeaderRow: { marginBottom: 16 },
  peakMetricLabelValue: { fontSize: 16, fontWeight: '900', color: '#ffffff', letterSpacing: -0.2 },
  barsLayoutFlexContainerRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 10 },
  individualBarAnchorColumn: { flex: 1, alignItems: 'center', marginHorizontal: 2 },
  verticalGraphInteractiveBarFill: { width: '100%', maxWidth: 18, borderRadius: 4 },
  barIntervalLabelToken: { fontSize: 9, fontWeight: '700', color: '#475569', marginTop: 8 },
  sectionHeadingTitleText: { fontSize: 14, fontWeight: '900', color: '#ffffff', letterSpacing: -0.2, marginBottom: 16 },
  milestoneItemizedTableRow: { width: '100%', backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  milestoneLeftContentFlex: { flexDirection: 'row', alignItems: 'center' },
  statusMarkerCircleDot: { width: 6, height: 6, borderRadius: 3, marginRight: 12 },
  milestoneIntervalPrimaryText: { fontSize: 12, fontWeight: '700', color: '#ffffff' },
  milestoneCalculatedPkrValuationText: { fontSize: 12, fontWeight: '800', color: '#94a3b8' }
});