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

  const getCategoryTheme = (cat: string) => {
    const upper = cat.toUpperCase();
    if (upper.includes('EQUITY') || upper.includes('STOCK')) {
      return { icon: '📊', label: 'PSX Equity', tagBg: 'rgba(16, 185, 129, 0.12)', tagTxt: '#34D399', border: 'rgba(16, 185, 129, 0.25)' };
    }
    if (upper.includes('GOLD') || upper.includes('COMMODITY') || upper.includes('BULLION')) {
      return { icon: '🪙', label: 'Physical Gold', tagBg: 'rgba(245, 158, 11, 0.12)', tagTxt: '#FBBF24', border: 'rgba(245, 158, 11, 0.25)' };
    }
    if (upper.includes('REAL_ESTATE') || upper.includes('PROPERTY')) {
      return { icon: '🏢', label: 'Real Estate', tagBg: 'rgba(239, 68, 68, 0.12)', tagTxt: '#F87171', border: 'rgba(239, 68, 68, 0.25)' };
    }
    if (upper.includes('FIXED') || upper.includes('SUKUK')) {
      return { icon: '📜', label: 'Sukuk / T-Bill', tagBg: 'rgba(139, 92, 246, 0.12)', tagTxt: '#A78BFA', border: 'rgba(139, 92, 246, 0.25)' };
    }
    return { icon: '💵', label: cat.replace('_', ' '), tagBg: 'rgba(56, 189, 248, 0.12)', tagTxt: '#38BDF8', border: 'rgba(56, 189, 248, 0.25)' };
  };

  const catTheme = getCategoryTheme(category);

  return (
    <View style={styles.cardContainer}>
      {/* Top Asset Header Row */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => isRealEstate && setIsExpanded(!isExpanded)}
        activeOpacity={isRealEstate ? 0.7 : 1}
      >
        <View style={styles.meta}>
          <View style={styles.titleRow}>
            <Text style={styles.assetIcon}>{catTheme.icon}</Text>
            <Text style={styles.title} numberOfLines={1}>{name}</Text>
          </View>

          <View style={styles.badgeRow}>
            <View style={[styles.categoryBadge, { backgroundColor: catTheme.tagBg, borderColor: catTheme.border }]}>
              <Text style={[styles.categoryTxt, { color: catTheme.tagTxt }]}>{catTheme.label}</Text>
            </View>

            <View style={[
              styles.syncBadge,
              isAutoSynced ? styles.badgeAuto : styles.badgeManual,
            ]}>
              <Text style={[
                styles.syncTxt,
                { color: isAutoSynced ? '#34D399' : '#94A3B8' },
              ]}>
                {isAutoSynced ? '● PSX Live' : '○ Verified'}
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
              {isExpanded ? 'Hide ▲' : 'Schedule ▼'}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Real Estate Micro Progress Line */}
      {isRealEstate && (
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      )}

      {/* Expanded Real Estate Installment Manager */}
      {isRealEstate && isExpanded && (
        <View style={styles.telemetryPanel}>
          <View style={styles.sliderHeaderRow}>
            <Text style={styles.sliderLabel}>Installments Disbursed: {localPaid} of {total}</Text>
            <View style={styles.stepperCluster}>
              <TouchableOpacity
                style={[styles.stepBtn, localPaid <= 0 && styles.stepBtnDisabled]}
                onPress={() => handleStep(-1)}
                disabled={localPaid <= 0}
              >
                <Text style={styles.stepBtnTxt}>-</Text>
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

          {/* Interactive Installment Slider */}
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={total}
            step={1}
            value={localPaid}
            onValueChange={(val) => setLocalPaid(Math.round(val))}
            onSlidingComplete={handleSliderComplete}
            minimumTrackTintColor="#10B981"
            maximumTrackTintColor="#1E293B"
            thumbTintColor="#34D399"
          />

          {/* Cashflow Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Paid Equity</Text>
              <Text style={styles.metricVal}>₨ {holdingValuePKR.toLocaleString()}</Text>
            </View>

            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Remaining Liability</Text>
              <Text style={[styles.metricVal, { color: '#FBBF24' }]}>
                ₨ {remainingLiability.toLocaleString()}
              </Text>
            </View>

            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Est. Total Cost</Text>
              <Text style={styles.metricVal}>₨ {estimatedTotalCost.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#0D1524',
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  meta: {
    flex: 1,
    paddingRight: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assetIcon: {
    fontSize: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.2,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 6,
  },
  categoryBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryTxt: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  syncBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  badgeAuto: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  badgeManual: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  syncTxt: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  milestonePill: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  milestoneTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
  },
  valContainer: {
    alignItems: 'flex-end',
  },
  val: {
    fontSize: 16,
    fontWeight: '800',
    color: '#34D399',
    fontVariant: ['tabular-nums'],
  },
  expandHint: {
    fontSize: 10,
    color: '#38BDF8',
    fontWeight: '700',
    marginTop: 4,
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: '#06090F',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  telemetryPanel: {
    padding: 16,
    backgroundColor: '#06090F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  sliderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  stepperCluster: {
    flexDirection: 'row',
    gap: 8,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#0D1524',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.3,
  },
  stepBtnTxt: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
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
    backgroundColor: '#0D1524',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricCell: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
});
