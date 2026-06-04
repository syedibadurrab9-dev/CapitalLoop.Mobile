import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Slider from '@react-native-community/slider'; 
import { RootState, AppDispatch } from '../store';
import { fetchRiskAuditSummary } from '../store/portfolioSlice'; 
import { ActionButton } from '../components/ActionButton';
import { PaywallModal } from '../components/PaywallModal';

export default function AiAdvisorScreen() {
  const dispatch = useDispatch<AppDispatch>();
  
  // Extract state flags from the Redux configuration matrix
  const isPremium = useSelector((state: RootState) => state.portfolio.user.isPremiumUser);
  const { riskAudit, isLoading, error } = useSelector((state: RootState) => state.portfolio);
  
  // Local UI state hooks
  const [capPercentage, setCapPercentage] = useState<number>(30);
  const [displayPercentage, setDisplayPercentage] = useState<number>(30);
  const [paywall, setPaywall] = useState<boolean>(false);

  // Dispatches network payload requests over our secure backend pipeline
  const executeEngineAudit = (targetCap: number) => {
    if (!isPremium) {
      setPaywall(true);
      return;
    }
    dispatch(fetchRiskAuditSummary({ maxCap: targetCap }));
  };

  // Run automated baseline verification cleanly when screen finishes mounting
  useEffect(() => {
    if (isPremium) {
      executeEngineAudit(30);
    }
  }, [isPremium]);

  const handleSlidingComplete = (value: number) => {
    const roundedValue = Math.round(value);
    setCapPercentage(roundedValue);
    executeEngineAudit(roundedValue);
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content} 
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>AI Risk Insights</Text>
      <Text style={styles.sub}>
        Set your preferred exposure safety boundaries to run automated security audits across your integrated investment holdings.
      </Text>

      {/* Structural Risk Selection Form Component */}
      <View style={styles.sliderCard}>
        <View style={styles.sliderLabelRow}>
          <Text style={styles.sliderLabel}>Maximum Sector Limit</Text>
          <Text style={styles.sliderValue}>{displayPercentage}%</Text>
        </View>
        
        <Slider
          style={styles.sliderWidget}
          minimumValue={10}
          maximumValue={90}
          step={5}
          value={capPercentage}
          onValueChange={setDisplayPercentage}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor="#2563EB" /* Aligned to premium corporate sapphire blue */
          maximumTrackTintColor="#E2E8F0" /* Clean light track background tint */
          thumbTintColor="#2563EB"
        />
      </View>

      <ActionButton 
        title={isLoading ? "Analyzing Portfolio Allocation..." : "Run Allocation Analysis"} 
        onPress={() => executeEngineAudit(capPercentage)} 
        variant="primary" /* Drops seamlessly into our master ink-slate style action block */
        disabled={isLoading}
      />

      {/* Error Message Feedback Display */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTxt}>⚠️ {error}</Text>
        </View>
      )}

      {/* Dynamic API Response Logging Matrices Output */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        riskAudit && (
          <View style={[
            styles.auditResultBox, 
            riskAudit.safetyBreached ? styles.breachedBorder : styles.compliantBorder
          ]}>
            <View style={[
              styles.statusBadge, 
              riskAudit.safetyBreached ? styles.breachedBadge : styles.compliantBadge
            ]}>
              <Text style={[
                styles.badgeText, 
                riskAudit.safetyBreached ? styles.breachedBadgeText : styles.compliantBadgeText
              ]}>
                {riskAudit.safetyBreached ? '⚠️ Target Limit Exceeded' : '✅ Portfolio Balanced'}
              </Text>
            </View>

            {riskAudit.overConcentratedSectors && riskAudit.overConcentratedSectors.length > 0 && (
              <View style={styles.sectorListContainer}>
                <Text style={styles.sectionHeading}>Sectors Exceeding Target Guardrails:</Text>
                {riskAudit.overConcentratedSectors.map((sector: string, idx: number) => (
                  <Text key={idx} style={styles.sectorBulletNode}>• {sector}</Text>
                ))}
              </View>
            )}

            <Text style={styles.sectionHeading}>Strategic Wealth Action Plan:</Text>
            <Text style={styles.advisoryTxt}>{riskAudit.advisoryRemarks}</Text>
          </View>
        )
      )}

      <PaywallModal visible={paywall} onClose={() => setPaywall(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F1F5F9' /* Clean frosted slate canvas background */
  },
  content: { 
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40
  },
  title: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: '#0F172A', /* Deep elegant ink-slate primary color */
    marginBottom: 4,
    letterSpacing: -0.5
  },
  sub: { 
    fontSize: 13, 
    color: '#64748B', 
    marginBottom: 24, 
    lineHeight: 20,
    letterSpacing: -0.1
  },
  sliderCard: { 
    backgroundColor: '#FFFFFF', /* Pristine crisp paper white */
    padding: 24, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2
  },
  sliderLabelRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 14 
  },
  sliderLabel: { 
    fontSize: 13, 
    color: '#334155', 
    fontWeight: '600',
    letterSpacing: -0.1
  },
  sliderValue: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#2563EB',
    fontVariant: ['tabular-nums']
  },
  sliderWidget: { 
    width: '100%', 
    height: 40 
  },
  loaderContainer: { 
    marginTop: 40, 
    alignItems: 'center' 
  },
  errorBox: { 
    backgroundColor: '#FEF2F2', 
    padding: 16, 
    borderRadius: 16, 
    marginTop: 16, 
    borderWidth: 1, 
    borderColor: '#FEE2E2' 
  },
  errorTxt: { 
    color: '#DC2626', 
    fontSize: 13, 
    fontWeight: '600' 
  },
  auditResultBox: { 
    backgroundColor: '#FFFFFF', 
    padding: 24, 
    borderRadius: 24, 
    marginTop: 24, 
    borderWidth: 1 
  },
  compliantBorder: { 
    borderColor: '#A7F3D0' 
  },
  breachedBorder: { 
    borderColor: '#FCA5A5' 
  },
  statusBadge: { 
    alignSelf: 'flex-start', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 10, 
    marginBottom: 18,
    borderWidth: 1
  },
  compliantBadge: { 
    backgroundColor: '#E6F4EA',
    borderColor: '#A7F3D0'
  },
  breachedBadge: { 
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5'
  },
  badgeText: { 
    fontSize: 12, 
    fontWeight: '700',
    letterSpacing: -0.1
  },
  compliantBadgeText: { 
    color: '#059669' 
  },
  breachedBadgeText: { 
    color: '#DC2626' 
  },
  sectionHeading: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#475569', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5, 
    marginBottom: 8 
  },
  sectorListContainer: { 
    marginBottom: 18 
  },
  sectorBulletNode: { 
    fontSize: 14, 
    color: '#DC2626', 
    fontWeight: '600', 
    marginLeft: 4, 
    marginVertical: 3 
  },
  advisoryTxt: { 
    color: '#334155', 
    fontSize: 14, 
    lineHeight: 22, 
    fontWeight: '500',
    letterSpacing: -0.1
  }
});