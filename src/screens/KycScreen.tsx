import React from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { submitKycPayload } from '../store/portfolioSlice';
import { ActionButton } from '../components/ActionButton';

export default function KycScreen() {
  const dispatch = useDispatch();
  const kycStatus = useSelector((state: RootState) => state.portfolio.user.kycStatus);

  const handleSubmit = () => {
    dispatch(submitKycPayload());
    Alert.alert('CNIC Ingested', 'Identity compliance telemetry dispatched cleanly to the secure .NET API gateway.');
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>National Compliance Infrastructure</Text>
        <Text style={styles.sub}>Verify your identity (CNIC/Passport) to access domestic banking wallet deposits securely.</Text>
        <View style={[styles.statusBox, { borderColor: kycStatus === 'Unverified' ? '#EF4444' : '#F59E0B' }]}>
          <Text style={styles.statusLabel}>Verification Status Parameters</Text>
          <Text style={styles.statusVal}>{kycStatus.toUpperCase()}</Text>
        </View>
      </View>
      {kycStatus === 'Unverified' && (
        <ActionButton title="Upload Smart CNIC / Document Data" onPress={handleSubmit} variant="accent" />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24, justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  sub: { fontSize: 13, color: '#64748B', marginBottom: 24 },
  statusBox: { backgroundColor: '#1E293B', padding: 24, borderRadius: 16, borderWidth: 1, alignItems: 'center', borderColor: '#334155', marginTop: 12 },
  statusLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  statusVal: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 8 }
});