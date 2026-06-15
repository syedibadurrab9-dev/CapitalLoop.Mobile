import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, StatusBar, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAdvisorStore } from '../../../core/store/advisor.store';
import { SuitabilitySurveyAnswers } from '../../../core/types/advisor.types';

export default function SuitabilitySurveyScreen() {
  const router = useRouter();
  const submitSuitabilitySurveyAsync = useAdvisorStore((state) => state.submitSuitabilitySurveyAsync);

  // 🎛️ Wizard Step Tracker
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  // 🔄 Local Form Captured States
  const [investmentHorizon, setInvestmentHorizon] = useState<string>('3');
  const [riskTolerance, setRiskTolerance] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [sipBudget, setSipBudget] = useState<string>('300000'); // Defaults to your 300,000 PKR Master SIP preference
  const [objective, setObjective] = useState<SuitabilitySurveyAnswers['primaryObjective']>('Shariah Wealth Growth');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * 📤 SUBMIT SECP COMPLIANCE RISK DATA
   * Maps local states cleanly into an EvaluateSuitabilityCommand payload signature
   */
  const handleCalculateSuitabilityProfileAsync = async () => {
    try {
      setErrorMessage(null);
      
      const parsedSipBudget = parseFloat(sipBudget);
      const parsedHorizon = parseInt(investmentHorizon, 10);

      if (isNaN(parsedSipBudget) || parsedSipBudget <= 0) {
        setErrorMessage("Please input a valid positive Monthly Systematic Investment Plan (SIP) budget.");
        return;
      }

      setIsSubmitting(true);
      console.log("[ADVISOR LOG] Packing user survey responses into EvaluateSuitabilityCommand format...");

      const commandPayload: SuitabilitySurveyAnswers = {
        investmentHorizonYears: parsedHorizon,
        riskToleranceScore: riskTolerance,
        monthlySipBudgetPkr: parsedSipBudget,
        primaryObjective: objective
      };

      // 🔥 Fire actual state store writer endpoint to commit data into SQL Server
      const success = await submitSuitabilitySurveyAsync(commandPayload);

      if (success) {
        console.log("[ADVISOR LOG] Profile analyzed successfully. Rerouting to allocation matrix workspace.");
        // Push user along the blueprint pipeline directly onto the allocation breakdown screen
        router.replace('/advisor/allocation-metrics');
      } else {
        setErrorMessage("Failed to calculate advisory profile. Check Kestrel core server framework logs.");
      }
    } catch (error: any) {
      console.error("[SURVEY DISPATCH CRASH]", error);
      setErrorMessage("Network socket interface failure while communicating with local Home LAN gateway.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.masterContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0c111d" />

      {/* HEADER SECTION & STEPS TRACKING PROGRESS BAR */}
      <View style={styles.headerFlexRow}>
        <View>
          <Text style={styles.screenTitleHeader}>Risk Suitability</Text>
          <Text style={styles.screenSubTitleHeader}>SECP COMPLIANCE ONBOARDING WIZARD</Text>
        </View>
        <Text style={styles.stepIndicatorTextLabel}>Step {currentStep} of {totalSteps}</Text>
      </View>
      
      <View style={styles.progressBarWrapperBackground}>
        <View style={[styles.progressBarActiveFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainerModifier} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {errorMessage && (
          <View style={styles.errorBannerContainer}>
            <Text style={styles.errorTextLabel}>{errorMessage}</Text>
          </View>
        )}

        {/* ── STEP 1: INVESTMENT HORIZON TIMELINE ── */}
        {currentStep === 1 && (
          <View style={styles.wizardStepContainer}>
            <Text style={styles.stepQuestionHeadingTitle}>What is your intended target investment horizon timeline?</Text>
            <Text style={styles.stepQuestionDescription}>This helps the engine calculate optimal asset duration matrices and liquidity parameters.</Text>
            
            {(['3', '5', '10', '20'] as string[]).map((years) => (
              <TouchableOpacity
                key={years}
                onPress={() => setInvestmentHorizon(years)}
                activeOpacity={0.8}
                style={[styles.selectableOptionCard, investmentHorizon === years && styles.selectableOptionCardActive]}
              >
                <Text style={[styles.optionCardPrimaryText, investmentHorizon === years && styles.optionCardTextActive]}>
                  {years} Year Active Horizon {years === '3' ? '(Short-Term Blueprint)' : years === '10' ? '(Long-Term Wealth Pool)' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── STEP 2: RISK TOLERANCE SCALE ── */}
        {currentStep === 2 && (
          <View style={styles.wizardStepContainer}>
            <Text style={styles.stepQuestionHeadingTitle}>Select your subjective risk tolerance threshold allocation:</Text>
            <Text style={styles.stepQuestionDescription}>Balances volatility limits against required multi-asset target returns.</Text>
            
            {([1, 2, 3, 4, 5] as const).map((score) => {
              const labels = ["Pure Capital Preservation", "Conservative Growth", "Moderate Balanced Allocation", "Aggressive Growth Tracking", "Speculative Market Alpha"];
              return (
                <TouchableOpacity
                  key={score}
                  onPress={() => setRiskTolerance(score)}
                  activeOpacity={0.8}
                  style={[styles.selectableOptionCard, riskTolerance === score && styles.selectableOptionCardActive]}
                >
                  <Text style={[styles.optionCardPrimaryText, riskTolerance === score && styles.optionCardTextActive]}>
                    Level {score} — {labels[score - 1]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── STEP 3: MONTHLY SIP ALLOCATION BUDGET ── */}
        {currentStep === 3 && (
          <View style={styles.wizardStepContainer}>
            <Text style={styles.stepQuestionHeadingTitle}>Specify your target monthly Systematic Investment Plan (SIP) budget:</Text>
            <Text style={styles.stepQuestionDescription}>Allocates capital inputs symmetrically across your recommended asset class breakdowns.</Text>
            
            <Text style={styles.inputFieldSectionLabel}>MONTHLY SIP BUDGET AMOUNT (PKR)</Text>
            <TextInput
              value={sipBudget}
              onChangeText={setSipBudget}
              placeholder="e.g., 300000"
              placeholderTextColor="#475569"
              keyboardType="numeric"
              style={styles.primaryTextInputElement}
            />
          </View>
        )}

        {/* ── STEP 4: PRIMARY FINANCIAL OBJECTIVE ── */}
        {currentStep === 4 && (
          <View style={styles.wizardStepContainer}>
            <Text style={styles.stepQuestionHeadingTitle}>Define your core wealth ledger primary milestone objective:</Text>
            <Text style={styles.stepQuestionDescription}>Enforces structural filters across matching equity selection engines.</Text>
            
            {(['Capital Preservation', 'Shariah Wealth Growth', 'Speculative Alpha'] as const).map((obj) => (
              <TouchableOpacity
                key={obj}
                onPress={() => setObjective(obj)}
                activeOpacity={0.8}
                style={[styles.selectableOptionCard, objective === obj && styles.selectableOptionCardActive]}
              >
                <Text style={[styles.optionCardPrimaryText, objective === obj && styles.optionCardTextActive]}>
                  {obj}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* NAVIGATION CONTROL FOOTER BUTTON BAR */}
        <View style={styles.navigationButtonBarFlexRow}>
          {currentStep > 1 ? (
            <TouchableOpacity onPress={handlePreviousStep} style={styles.backStepActionButton}>
              <Text style={styles.backButtonTextLabel}>Previous</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} /> // Layout Spacer balance placeholder
          )}

          {currentStep < totalSteps ? (
            <TouchableOpacity onPress={handleNextStep} style={styles.forwardStepActionButton}>
              <Text style={styles.forwardButtonTextLabel}>Continue</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleCalculateSuitabilityProfileAsync}
              activeOpacity={0.85}
              disabled={isSubmitting}
              style={styles.submitProfileActionButton}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#0c111d" />
              ) : (
                <Text style={styles.submitButtonTextLabel}>Process Allocation Model</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================================================================
// 🎨 ADVANCED WIZARD STEP ENGINE CUSTOM VISUAL STYLING
// =============================================================================
const styles = StyleSheet.create({
  masterContainer: { flex: 1, backgroundColor: '#0c111d' },
  headerFlexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.select({ ios: 16, android: 24 }), paddingBottom: 16 },
  screenTitleHeader: { fontSize: 18, fontWeight: '900', color: '#ffffff', letterSpacing: -0.4 },
  screenSubTitleHeader: { fontSize: 9, fontWeight: '800', color: '#64748b', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  stepIndicatorTextLabel: { fontSize: 11, fontWeight: '800', color: '#10b981' },
  progressBarWrapperBackground: { width: '100%', height: 2, backgroundColor: '#1e293b' },
  progressBarActiveFill: { height: '100%', backgroundColor: '#10b981' },
  scrollContainerModifier: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 140 },
  errorBannerContainer: { width: '100%', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', padding: 14, borderRadius: 16, marginBottom: 24 },
  errorTextLabel: { fontSize: 11, fontWeight: '600', color: '#f87171', textAlign: 'center' },
  wizardStepContainer: { width: '100%', minHeight: 280 },
  stepQuestionHeadingTitle: { fontSize: 15, fontWeight: '800', color: '#ffffff', lineHeight: 22, marginBottom: 8 },
  stepQuestionDescription: { fontSize: 12, fontWeight: '500', color: '#64748b', lineHeight: 18, marginBottom: 24 },
  selectableOptionCard: { width: '100%', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 12 },
  selectableOptionCardActive: { backgroundColor: '#1e293b', borderColor: '#10b981' },
  optionCardPrimaryText: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  optionCardTextActive: { color: '#ffffff' },
  inputFieldSectionLabel: { fontSize: 9, fontWeight: '800', color: '#64748b', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },
  primaryTextInputElement: { width: '100%', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, fontSize: 13, fontWeight: '600', color: '#ffffff' },
  navigationButtonBarFlexRow: { flexDirection: 'row', width: '100%', marginTop: 32, justifyContent: 'space-between' },
  backStepActionButton: { flex: 1, backgroundColor: '#1e293b', paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: '#334155' },
  backButtonTextLabel: { fontSize: 12, fontWeight: '800', color: '#94a3b8' },
  forwardStepActionButton: { flex: 1, backgroundColor: '#ffffff', paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  forwardButtonTextLabel: { fontSize: 12, fontWeight: '800', color: '#0c111d' },
  submitProfileActionButton: { flex: 1, backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginLeft: 10, shadowColor: '#10b981', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  submitButtonTextLabel: { fontSize: 12, fontWeight: '800', color: '#0c111d' }
});