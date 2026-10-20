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
      return { icon: '📊', label: 'PSX Equity', tagBg: '#ECFDF5', tagTxt: '#059669', border: '#A7F3D0' };
    }
    if (upper.includes('GOLD') || upper.includes('COMMODITY') || upper.includes('BULLION')) {
      return { icon: '🪙', label: 'Physical Gold', tagBg: '#FFFBEB', tagTxt: '#D97706', border: '#FDE68A' };
    }
    if (upper.includes('REAL_ESTATE') || upper.includes('PROPERTY')) {
      return { icon: '🏢', label: 'Real Estate', tagBg: '#FEF2F2', tagTxt: '#DC2626', border: '#FCA5A5' };
    }
    if (upper.includes('FIXED') || upper.includes('SUKUK')) {
      return { icon: '📜', label: 'Sukuk / T-Bill', tagBg: '#EFF6FF', tagTxt: '#0284C7', border: '#BFDBFE' };
    }
    return { icon: '💵', label: cat.replace('_', ' '), tagBg: '#F1F5F9', tagTxt: '#475569', border: '#CBD5E1' };
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

            <View style={[styles.syncBadge, isAutoSynced ? styles.badgeAuto : styles.badgeManual]}>
              <Text style={[styles.syncTxt, { color: isAutoSynced ? '#059669' : '#64748B' }]}>
                {isAutoSynced ? '● LIVE SBP/PSX' : 'MANUAL'}
              </Text>
            </View>

            {isRealEstate && (
              <View style={styles.milestonePill}>
                <Text style={styles.milestoneTxt}>
                  {localPaid}/{total} Installments ({progressPercent}%)
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.valContainer}>
          <Text style={styles.val}>{valueDisplay}</Text>
          {isRealEstate && (
            <Text style={styles.expandHint}>
              {isExpanded ? 'Hide Schedule ▲' : 'Show Schedule ▼'}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Real Estate Installment Progress Bar Strip */}
      {isRealEstate && (
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      )}

      {/* Expanded Interactive Slider Drawer for Real Estate */}
      {isRealEstate && isExpanded && (
        <View style={styles.telemetryPanel}>
          <View style={styles.sliderHeaderRow}>
            <Text style={styles.sliderLabel}>Update Paid Installments</Text>
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

          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={total}
            step={1}
            value={localPaid}
            onValueChange={val => setLocalPaid(Math.round(val))}
            onSlidingComplete={handleSliderComplete}
            minimumTrackTintColor="#10B981"
            maximumTrackTintColor="#E2E8F0"
            thumbTintColor="#10B981"
          />

          <View style={styles.metricsGrid}>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Paid Equity</Text>
              <Text style={styles.metricVal}>
                ₨ {holdingValuePKR.toLocaleString()}
              </Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Total Asset Value</Text>
              <Text style={styles.metricVal}>
                ₨ {estimatedTotalCost.toLocaleString()}
              </Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Remaining Debt</Text>
              <Text style={[styles.metricVal, { color: '#DC2626' }]}>
                ₨ {remainingLiability.toLocaleString()}
              </Text>
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
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  meta: {
    flex: 1,
    paddingRight: 12,
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
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
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
  },
  badgeAuto: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  badgeManual: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  syncTxt: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  milestonePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  milestoneTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
  valContainer: {
    alignItems: 'flex-end',
  },
  val: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
  },
  expandHint: {
    fontSize: 10,
    color: '#0284C7',
    fontWeight: '700',
    marginTop: 4,
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  telemetryPanel: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
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
    color: '#64748B',
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
    opacity: 0.3,
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
    fontSize: 9,
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
