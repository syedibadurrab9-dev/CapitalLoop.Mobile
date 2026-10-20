import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  Modal 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Slider from '@react-native-community/slider'; 
import { RootState, AppDispatch } from '../store';
import { 
  fetchRiskAuditSummary, 
  evaluateSuitability, 
  fetchSuitabilityProfile 
} from '../store/portfolioSlice'; 
import { ActionButton } from '../components/ActionButton';
import { PaywallModal } from '../components/PaywallModal';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InstitutionalHeader } from '../components/InstitutionalHeader';
import { BottomNavBar, TabRouteName } from '../components/BottomNavBar';
import { LeftDrawer } from '../components/LeftDrawer';

interface QuestionDef {
  id: number;
  title: string;
  subtitle: string;
  options: { label: string; score: number }[];
}

const SECP_QUESTIONS: QuestionDef[] = [
  {
    id: 1,
    title: 'Primary Investment Objective',
    subtitle: 'What is your fundamental wealth objective in the Pakistani financial market?',
    options: [
      { label: 'Capital Preservation (Inflation protection & principal security)', score: 1 },
      { label: 'Regular Income (Dividend yields, National Savings & Sukuk)', score: 2 },
      { label: 'Balanced Growth (Equities and fixed-income blended)', score: 3 },
      { label: 'Aggressive Capital Growth (High PSX beta & real estate)', score: 4 },
      { label: 'Speculative Maximization (High volatility assets & crypto)', score: 5 },
    ],
  },
  {
    id: 2,
    title: 'Market Volatility Tolerance',
    subtitle: 'If PSX drops 20% over 30 days due to macroeconomic devaluation, how do you react?',
    options: [
      { label: 'Liquidate all holdings immediately to avoid further losses', score: 1 },
      { label: 'Worry significantly but hold current positions', score: 2 },
      { label: 'Maintain positions and wait patiently for cyclical recovery', score: 3 },
      { label: 'Deploy additional reserves to buy high-dividend blue chips at discount', score: 4 },
      { label: 'Aggressively average down and take leveraged growth positions', score: 5 },
    ],
  },
  {
    id: 3,
    title: 'Target Investment Horizon',
    subtitle: 'How long do you intend to keep your capital invested before liquidation?',
    options: [
      { label: 'Less than 6 Months (Short-term liquidity pool)', score: 1 },
      { label: '6 to 12 Months (Short-to-medium holding period)', score: 2 },
      { label: '1 to 3 Years (Medium-term investment horizon)', score: 3 },
      { label: '3 to 5 Years (Long-term compounding target)', score: 4 },
      { label: 'Over 5 Years (Generational wealth & multi-cycle compounding)', score: 5 },
    ],
  },
  {
    id: 4,
    title: 'Financial Market Knowledge',
    subtitle: 'How familiar are you with PSX equities, mutual funds, and digital assets?',
    options: [
      { label: 'No prior financial knowledge or trading experience', score: 1 },
      { label: 'Basic understanding of bank deposits and National Savings Certificates', score: 2 },
      { label: 'Moderate knowledge of mutual funds, T-Bills, and Shariah Sukuk', score: 3 },
      { label: 'Active PSX equity investor familiar with KSE-100 fundamentals', score: 4 },
      { label: 'Sophisticated investor in derivatives, real estate files, and crypto', score: 5 },
    ],
  },
  {
    id: 5,
    title: 'Surplus Income Allocation Capacity',
    subtitle: 'What portion of monthly cashflow can you allocate without touching emergency reserves?',
    options: [
      { label: 'Under 5% of monthly disposable surplus', score: 1 },
      { label: '5% to 15% of regular monthly surplus', score: 2 },
      { label: '15% to 30% of monthly surplus capital', score: 3 },
      { label: '30% to 50% of monthly cashflow', score: 4 },
      { label: 'Over 50% of monthly cashflow with high risk resilience', score: 5 },
    ],
  },
];

export default function AiAdvisorScreen({ navigation }: NativeStackScreenProps<any>) {
  const dispatch = useDispatch<AppDispatch>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Extract state flags from Redux
  const isPremium = useSelector((state: RootState) => state.portfolio.user.isPremiumUser);
  const { assets, riskAudit, suitabilityProfile, isLoading, error } = useSelector(
    (state: RootState) => state.portfolio
  );
  
  // Local UI state hooks
  const [capPercentage, setCapPercentage] = useState<number>(30);
  const [displayPercentage, setDisplayPercentage] = useState<number>(30);
  const [paywall, setPaywall] = useState<boolean>(false);

  // Questionnaire Wizard state
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([3, 3, 3, 3, 3]);

  // Initial load
  useEffect(() => {
    dispatch(fetchSuitabilityProfile());
    if (isPremium) {
      dispatch(fetchRiskAuditSummary({ maxCap: 30 }));
    }
  }, [dispatch, isPremium]);

  const executeEngineAudit = (targetCap: number) => {
    if (!isPremium) {
      setPaywall(true);
      return;
    }
    dispatch(fetchRiskAuditSummary({ maxCap: targetCap }));
  };

  const handleSlidingComplete = (value: number) => {
    const roundedValue = Math.round(value);
    setCapPercentage(roundedValue);
    executeEngineAudit(roundedValue);
  };

  const openWizard = () => {
    setWizardStep(0);
    setShowWizard(true);
  };

  const handleSelectOption = (score: number) => {
    const updated = [...selectedAnswers];
    updated[wizardStep] = score;
    setSelectedAnswers(updated);
  };

  const handleNextStep = () => {
    if (wizardStep < SECP_QUESTIONS.length - 1) {
      setWizardStep(wizardStep + 1);
    } else {
      // Submit questionnaire
      dispatch(evaluateSuitability({ answers: selectedAnswers }));
      setShowWizard(false);
    }
  };

  const handlePrevStep = () => {
    if (wizardStep > 0) {
      setWizardStep(wizardStep - 1);
    }
  };

  // Calculate actual category allocations
  const totalPortfolioValue = assets.reduce((sum, a) => sum + a.holdingValuePKR, 0);
  const categoryWeights: Record<string, number> = {};
  assets.forEach((a) => {
    categoryWeights[a.category] = (categoryWeights[a.category] || 0) + a.holdingValuePKR;
  });

  const getProfileColor = (profile?: string) => {
    switch (profile) {
      case 'Conservative':
        return '#059669';
      case 'Balanced':
        return '#2563EB';
      case 'Growth':
        return '#7C3AED';
      case 'Speculative':
        return '#D97706';
      default:
        return '#64748B';
    }
  };

  const currentQ = SECP_QUESTIONS[wizardStep];
  const profileColor = getProfileColor(suitabilityProfile?.riskProfile);

  return (
    <View style={styles.rootWrapper}>
      <InstitutionalHeader
        title="SECP AI ADVISOR"
        showBack={true}
        onBack={() => navigation.goBack()}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenProfile={() => navigation.navigate('Profile')}
      />

      <LeftDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={(route) => navigation.navigate(route)}
        currentRoute="AiAdvisor"
      />

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
      <Text style={styles.title}>SECP AI Advisor</Text>
      <Text style={styles.sub}>
        Automated regulatory suitability profiling, concentration risk audits, and 2026 SECP Sandbox hard allocation caps.
      </Text>

      {/* --- SECP SUITABILITY PROFILE SECTION --- */}
      <View style={styles.suitabilityCard}>
        <View style={styles.cardHeaderRow}>
          <View>
            <Text style={styles.cardSuperTitle}>SECP REGULATORY SUITABILITY</Text>
            <Text style={styles.cardTitle}>
              {suitabilityProfile ? suitabilityProfile.riskProfile : 'Unassigned Profile'}
            </Text>
          </View>
          <View style={[styles.profilePill, { backgroundColor: `${profileColor}18`, borderColor: profileColor }]}>
            <Text style={[styles.profilePillText, { color: profileColor }]}>
              {suitabilityProfile ? `Score: ${suitabilityProfile.suitabilityScore}/25` : 'Pending'}
            </Text>
          </View>
        </View>

        {suitabilityProfile ? (
          <>
            {/* Compliance Status Banner */}
            <View
              style={[
                styles.complianceBanner,
                suitabilityProfile.currentPortfolioCompliant
                  ? styles.compliantBannerBg
                  : styles.breachedBannerBg,
              ]}
            >
              <Text
                style={[
                  styles.complianceBannerText,
                  suitabilityProfile.currentPortfolioCompliant
                    ? styles.compliantBannerText
                    : styles.breachedBannerText,
                ]}
              >
                {suitabilityProfile.currentPortfolioCompliant
                  ? '✅ SECP ALLOCATION COMPLIANT'
                  : '⚠️ SECP ALLOCATION CEILING BREACHED'}
              </Text>
              <Text style={styles.complianceRemarks}>
                {suitabilityProfile.advisoryRemarks}
              </Text>
            </View>

            {/* Hard Caps Breakdown Table */}
            <View style={styles.capsContainer}>
              <Text style={styles.capsSectionHeading}>SECP Regulatory Allocation Hard Ceilings</Text>
              {Object.entries(suitabilityProfile.hardCaps).map(([category, cap]) => {
                const currentVal = categoryWeights[category] || 0;
                const currentPct = totalPortfolioValue > 0 
                  ? Math.round((currentVal / totalPortfolioValue) * 1000) / 10 
                  : 0;
                const isOver = currentPct > cap;

                return (
                  <View key={category} style={styles.capRow}>
                    <View style={styles.capLabelRow}>
                      <Text style={styles.capCategoryName}>{category.replace('_', ' ')}</Text>
                      <Text style={[styles.capValues, isOver ? styles.capOver : styles.capNormal]}>
                        {currentPct}% / Max {cap}%
                      </Text>
                    </View>
                    <View style={styles.progressBarTrack}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { 
                            width: `${Math.min(100, (currentPct / (cap > 0 ? cap : 1)) * 100)}%`,
                            backgroundColor: isOver ? '#DC2626' : profileColor,
                          }
                        ]} 
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            <TouchableOpacity 
              style={styles.retakeButton} 
              onPress={openWizard}
              activeOpacity={0.8}
            >
              <Text style={styles.retakeButtonText}>🔄 Retake SECP Suitability Questionnaire</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptySuitabilityBox}>
            <Text style={styles.emptySuitabilityText}>
              Complete the SECP 5-Question Digital Suitability Questionnaire to assign your legal risk profile and activate automated concentration guardrails.
            </Text>
            <ActionButton 
              title="Start SECP Questionnaire" 
              onPress={openWizard} 
              variant="primary" 
            />
          </View>
        )}
      </View>

      {/* --- SECTOR CONCENTRATION AUDIT SECTION --- */}
      <View style={styles.sliderCard}>
        <Text style={styles.cardSuperTitle}>DYNAMIC EXPOSURE AUDIT</Text>
        <View style={styles.sliderLabelRow}>
          <Text style={styles.sliderLabel}>Maximum Sector Concentration Limit</Text>
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
          minimumTrackTintColor="#2563EB"
          maximumTrackTintColor="#E2E8F0"
          thumbTintColor="#2563EB"
        />

        <View style={{ marginTop: 14 }}>
          <ActionButton 
            title={isLoading ? "Analyzing Portfolio Allocation..." : "Run Sector Stress Audit"} 
            onPress={() => executeEngineAudit(capPercentage)} 
            variant="primary"
            disabled={isLoading}
          />
        </View>
      </View>

      {/* Error Message Display */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTxt}>⚠️ {error}</Text>
        </View>
      )}

      {/* Risk Audit Output Box */}
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
                {riskAudit.safetyBreached ? '⚠️ Sector Target Limit Exceeded' : '✅ Sector Allocation Balanced'}
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

      {/* --- QUESTIONNAIRE WIZARD MODAL --- */}
      <Modal
        visible={showWizard}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWizard(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.wizardContainer}>
            {/* Wizard Header */}
            <View style={styles.wizardHeader}>
              <View>
                <Text style={styles.wizardHeaderSuper}>SECP 2026 REGULATORY AUDIT</Text>
                <Text style={styles.wizardHeaderTitle}>
                  Question {wizardStep + 1} of {SECP_QUESTIONS.length}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.closeBtn} 
                onPress={() => setShowWizard(false)}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Step Progress Indicators */}
            <View style={styles.stepDotsRow}>
              {SECP_QUESTIONS.map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.stepDot, 
                    i === wizardStep ? styles.stepDotActive : (i < wizardStep ? styles.stepDotDone : styles.stepDotPending)
                  ]} 
                />
              ))}
            </View>

            {/* Question Details */}
            <ScrollView style={styles.questionBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.questionTitle}>{currentQ.title}</Text>
              <Text style={styles.questionSubtitle}>{currentQ.subtitle}</Text>

              {/* Options */}
              <View style={styles.optionsList}>
                {currentQ.options.map((opt) => {
                  const isSelected = selectedAnswers[wizardStep] === opt.score;
                  return (
                    <TouchableOpacity
                      key={opt.score}
                      style={[
                        styles.optionCard,
                        isSelected && styles.optionCardSelected,
                      ]}
                      onPress={() => handleSelectOption(opt.score)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <View style={styles.radioInnerDot} />}
                      </View>
                      <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Wizard Actions */}
            <View style={styles.wizardActions}>
              {wizardStep > 0 ? (
                <TouchableOpacity 
                  style={styles.prevBtn} 
                  onPress={handlePrevStep}
                >
                  <Text style={styles.prevBtnText}>Previous</Text>
                </TouchableOpacity>
              ) : <View style={{ flex: 1 }} />}

              <TouchableOpacity 
                style={styles.nextBtn} 
                onPress={handleNextStep}
              >
                <Text style={styles.nextBtnText}>
                  {wizardStep === SECP_QUESTIONS.length - 1 ? 'Evaluate Profile' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <PaywallModal visible={paywall} onClose={() => setPaywall(false)} />
    </ScrollView>

    {/* Persistent FinTech Bottom Navigation Bar */}
    <BottomNavBar
      activeRoute="Profile"
      onNavigate={(route: TabRouteName) => navigation.navigate(route)}
      unreadChatCount={0}
      isAdvisorActive={true}
    />
  </View>
);
}

const styles = StyleSheet.create({
  rootWrapper: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#F1F5F9' 
  },
  content: { 
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40
  },
  title: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.5
  },
  sub: { 
    fontSize: 13, 
    color: '#64748B', 
    marginBottom: 20, 
    lineHeight: 20,
    letterSpacing: -0.1
  },
  suitabilityCard: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardSuperTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  profilePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  profilePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  complianceBanner: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 18,
  },
  compliantBannerBg: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  breachedBannerBg: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  complianceBannerText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  compliantBannerText: {
    color: '#15803D',
  },
  breachedBannerText: {
    color: '#DC2626',
  },
  complianceRemarks: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  capsContainer: {
    marginBottom: 18,
  },
  capsSectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  capRow: {
    marginBottom: 10,
  },
  capLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  capCategoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  capValues: {
    fontSize: 12,
    fontWeight: '700',
  },
  capNormal: {
    color: '#0F172A',
  },
  capOver: {
    color: '#DC2626',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  retakeButton: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  retakeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  emptySuitabilityBox: {
    paddingVertical: 10,
  },
  emptySuitabilityText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  sliderCard: { 
    backgroundColor: '#FFFFFF',
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
    marginTop: 8,
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
    marginTop: 8, 
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
  },
  // Modal & Wizard styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  wizardContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 22,
    paddingBottom: 36,
    maxHeight: '90%',
  },
  wizardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  wizardHeaderSuper: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.8,
  },
  wizardHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '700',
  },
  stepDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  stepDot: {
    height: 4,
    borderRadius: 2,
    flex: 1,
  },
  stepDotActive: {
    backgroundColor: '#2563EB',
  },
  stepDotDone: {
    backgroundColor: '#93C5FD',
  },
  stepDotPending: {
    backgroundColor: '#E2E8F0',
  },
  questionBody: {
    maxHeight: 380,
  },
  questionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  questionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 16,
  },
  optionsList: {
    gap: 10,
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: '#2563EB',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  optionLabel: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: '#1E40AF',
    fontWeight: '700',
  },
  wizardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  prevBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  prevBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  nextBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  nextBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});