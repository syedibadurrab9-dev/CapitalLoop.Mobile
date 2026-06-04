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
    Alert.alert('Identity Submitted', 'Your compliance verification documentation has been successfully uploaded.');
  };

  // Determine elegant light-mode status card boundary colors dynamically
  const getStatusCardStyles = () => {
    switch (kycStatus) {
      case 'Unverified':
        return { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', color: '#DC2626' };
      case 'Approved':
        return { backgroundColor: '#E6F4EA', borderColor: '#A7F3D0', color: '#059669' };
      default: // Pending status variations
        return { backgroundColor: '#FFFBEB', borderColor: '#FDE68A', color: '#D97706' };
    }
  };

  const statusStyle = getStatusCardStyles();

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Verify Identity</Text>
        <Text style={styles.sub}>
          Verify your identity document (CNIC or Passport) to enable unrestricted asset synchronization securely.
        </Text>
        
        {/* Dynamic State Feedback Container */}
        <View style={[styles.statusBox, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
          <Text style={styles.statusLabel}>Verification Status</Text>
          <Text style={[styles.statusVal, { color: statusStyle.color }]}>
            {kycStatus.toUpperCase()}
          </Text>
        </View>
      </View>
      
      {kycStatus === 'Unverified' && (
        <ActionButton 
          title="Upload CNIC / Document Data" 
          onPress={handleSubmit} 
          variant="primary" 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F1F5F9', /* Premium soft light grey slate base canvas */
    padding: 24, 
    justifyContent: 'space-between' 
  },
  title: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: '#0F172A', /* Saturated deep ink slate */
    marginBottom: 4,
    letterSpacing: -0.5
  },
  sub: { 
    fontSize: 13, 
    color: '#64748B', 
    lineHeight: 20,
    marginBottom: 24,
    letterSpacing: -0.1
  },
  statusBox: { 
    padding: 24, 
    borderRadius: 24, 
    borderWidth: 1, 
    alignItems: 'center', 
    marginTop: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1
  },
  statusLabel: { 
    color: '#475569', /* Soft highly-readable slate description prose */
    fontSize: 12, 
    fontWeight: '700', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5 
  },
  statusVal: { 
    fontSize: 24, 
    fontWeight: '800', 
    marginTop: 8,
    letterSpacing: -0.2
  }
});