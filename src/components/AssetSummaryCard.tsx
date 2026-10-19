import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';

interface CardProps {
  id?: string;
  name: string;
  category: string;
  valueDisplay: string;
  isAutoSynced: boolean;
  installmentsPaid?: number;
  totalInstallments?: number;
  holdingValuePKR?: number;
  onUpdateInstallment?: (paid: number, total: number) => void;
}

export const AssetSummaryCard = ({
  name,
  category,
  valueDisplay,
  isAutoSynced,
  installmentsPaid,
  totalInstallments,
  holdingValuePKR = 0,
  onUpdateInstallment,
}: CardProps) => {
  const isRealEstate = category === 'Real_Estate' && totalInstallments !== undefined && totalInstallments > 0;
  const [localPaid, setLocalPaid] = useState<number>(installmentsPaid ?? 0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Sync internal slider state if prop updates from outside
  React.useEffect(() => {
    if (installmentsPaid !== undefined) {
      setLocalPaid(installmentsPaid);
    }
  }, [installmentsPaid]);

  const total = totalInstallments ?? 1;
  const progressPercent = total > 0 ? Math.round((localPaid / total) * 100) : 0;

  // Real estate cashflow calculations
  const fraction = localPaid > 0 ? localPaid / total : 1 / total;
  const estimatedTotalCost = holdingValuePKR > 0 && localPaid > 0
    ? Math.round(holdingValuePKR / (localPaid / total))
    : holdingValuePKR * total;
  const remainingLiability = Math.max(0, estimatedTotalCost - holdingValuePKR);

  const handleSliderComplete = (value: number) => {
    const rounded = Math.round(value);
    setLocalPaid(rounded);
    if (onUpdateInstallment && totalInstallments) {
      onUpdateInstallment(rounded, totalInstallments);
    }
  };

  const handleStep = (delta: number) => {
    if (!totalInstallments) return;
    const nextVal = Math.min(totalInstallments, Math.max(0, localPaid + delta));
    setLocalPaid(nextVal);
    if (onUpdateInstallment) {
      onUpdateInstallment(nextVal, totalInstallments);
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Top Asset Header Row */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => isRealEstate && setIsExpanded(!isExpanded)}
        activeOpacity={isRealEstate ? 0.7 : 1}
      >
        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={1}>{name}</Text>
          <View style={styles.badgeRow}>
            <Text style={styles.categoryTxt}>{category.replace('_', ' ')}</Text>
            <View style={[
              styles.syncBadge,
              isAutoSynced ? styles.badgeAuto : styles.badgeManual,
            ]}>
              <Text style={[
                styles.syncTxt,
                { color: isAutoSynced ? '#059669' : '#475569' },
              ]}>
                {isAutoSynced ? 'Auto Synced' : 'Manual Ledger'}
              </Text>
            </View>

            {isRealEstate && (
              <View style={styles.milestonePill}>
                <Text style={styles.milestoneTxt}>
                  {localPaid}/{total} ({progressPercent}%)
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.valContainer}>
          <Text style={styles.val}>{valueDisplay}</Text>
          {isRealEstate && (
            <Text style={styles.expandHint}>
              {isExpanded ? '▲ Hide Milestones' : '▼ Track Plan'}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Real Estate Installment Progress Bar */}
      {isRealEstate && (
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${Math.min(100, progressPercent)}%` }]} />
        </View>
      )}

      {/* Expanded Real Estate Telemetry & Slider Controls */}
      {isRealEstate && isExpanded && (
        <View style={styles.telemetryPanel}>
          <View style={styles.sliderHeaderRow}>
            <Text style={styles.sliderLabel}>Milestone Slider (Paid: {localPaid} of {total})</Text>
            <View style={styles.stepperCluster}>
              <TouchableOpacity
                style={[styles.stepBtn, localPaid <= 0 && styles.stepBtnDisabled]}
                onPress={() => handleStep(-1)}
                disabled={localPaid <= 0}
              >
                <Text style={styles.stepBtnTxt}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.stepBtn, localPaid >= total && styles.stepBtnDisabled]}
                onPress={() => handleStep(1)}
                disabled={localPaid >= total}
              >
                <Text style={styles.stepBtnTxt}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Interactive Milestone Slider */}
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={total}
            step={1}
            value={localPaid}
            onValueChange={(val) => setLocalPaid(Math.round(val))}
            onSlidingComplete={handleSliderComplete}
            minimumTrackTintColor="#2563EB"
            maximumTrackTintColor="#CBD5E1"
            thumbTintColor="#2563EB"
          />

          {/* Cashflow Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Paid Equity</Text>
              <Text style={styles.metricVal}>Rs. {holdingValuePKR.toLocaleString()}</Text>
            </View>

            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Remaining Liability</Text>
              <Text style={[styles.metricVal, { color: '#D97706' }]}>
                Rs. {remainingLiability.toLocaleString()}
              </Text>
            </View>

            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Est. Total Cost</Text>
              <Text style={styles.metricVal}>Rs. {estimatedTotalCost.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  meta: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 8,
  },
  categoryTxt: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  syncBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeAuto: {
    backgroundColor: '#E6F4EA',
  },
  badgeManual: {
    backgroundColor: '#F1F5F9',
  },
  syncTxt: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  milestonePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  milestoneTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  valContainer: {
    alignItems: 'flex-end',
  },
  val: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
  },
  expandHint: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '700',
    marginTop: 4,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },
  telemetryPanel: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sliderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  stepperCluster: {
    flexDirection: 'row',
    gap: 8,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.4,
  },
  stepBtnTxt: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
  },
  slider: {
    width: '100%',
    height: 36,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricCell: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
});