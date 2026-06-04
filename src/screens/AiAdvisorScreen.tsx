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
  const [displayPercentage, setDisplayPercentage] = useState<number>(30); // ✅ FIXED: Prevents UI stuttering during active drags
  const [paywall, setPaywall] = useState<boolean>(false);

  // Dispatches network payload requests over our secure .NET pipeline
  const executeEngineAudit = (targetCap: number) => {
    if (!isPremium) {
      setPaywall(true);
      return;
    }
    dispatch(fetchRiskAuditSummary({ maxCap: targetCap }));
  };

  // Run automated baseline verification cleanly when screen finishes mounting
  useEffect(() => {
    // ✅ FIXED: Quiet verification block ensures non-premium profiles aren't hit with an instant paywall modal on mount
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
      <Text style={styles.title}>AI Strategic Risk Engine</Text>
      <Text style={styles.sub}>
        Configure dynamic sector safety boundaries to run automated rebalancing audits across your integrated holdings.
      </Text>

      {/* Structural Risk Selection Form Component */}
      <View style={styles.sliderCard}>
        <View style={styles.sliderLabelRow}>
          <Text style={styles.sliderLabel}>Max Allowed Sector Concentration</Text>
          <Text style={styles.sliderValue}>{displayPercentage}%</Text>
        </View>
        
        <Slider
          style={styles.sliderWidget}
          minimumValue={10}
          maximumValue={90}
          step={5}
          value={capPercentage}
          onValueChange={setDisplayPercentage} // ✅ FIXED: Updates local number text instantly without forcing full screen repaints
          onSlidingComplete={handleSlidingComplete} // ✅ FIXED: Hits the backend endpoint only when the user releases the slider thumb
          minimumTrackTintColor="#38BDF8" 
          maximumTrackTintColor="#334155"
          thumbTintColor="#38BDF8"
        />
      </View>

      <ActionButton 
        title={isLoading ? "Processing Auditing Tracks..." : "Trigger Risk Engine Evaluation"} 
        onPress={() => executeEngineAudit(capPercentage)} 
        variant="accent"
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
          <ActivityIndicator size="large" color="#38BDF8" />
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
                {riskAudit.safetyBreached ? '⚠️ ALIGNMENT BREACH' : '✅ FRAMEWORK SECURE'}
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
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  sub: { fontSize: 13, color: '#64748B', marginBottom: 24, lineHeight: 18 },
  sliderCard: { 
    backgroundColor: '#1E293B', 
    padding: 20, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#334155', 
    marginBottom: 20 
  },
  sliderLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sliderLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.75 },
  sliderValue: { fontSize: 20, fontWeight: '800', color: '#38BDF8' },
  sliderWidget: { width: '100%', height: 40 },
  loaderContainer: { marginTop: 40, alignItems: 'center' },
  errorBox: { backgroundColor: '#7F1D1D', padding: 14, borderRadius: 12, marginTop: 16, borderWidth: 1, borderColor: '#F87171' },
  errorTxt: { color: '#FCA5A5', fontSize: 13, fontWeight: '600' },
  auditResultBox: { 
    backgroundColor: '#1E293B', 
    padding: 20, 
    borderRadius: 16, 
    marginTop: 24, 
    borderWidth: 1.5 
  },
  compliantBorder: { borderColor: '#10B981' },
  breachedBorder: { borderColor: '#EF4444' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
  compliantBadge: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  breachedBadge: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  compliantBadgeText: { color: '#10B981' },
  breachedBadgeText: { color: '#EF4444' },
  sectionHeading: { fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  sectorListContainer: { marginBottom: 16 },
  sectorBulletNode: { fontSize: 14, color: '#F87171', fontWeight: '600', marginLeft: 6, marginVertical: 2 },
  advisoryTxt: { color: '#E2E8F0', fontSize: 13, lineHeight: 22, fontWeight: '400' }
});