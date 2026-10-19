import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { RootState, AppDispatch } from '../store';
import { submitKycVerification } from '../store/portfolioSlice';
import { ActionButton } from '../components/ActionButton';

export default function KycScreen(): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const kycStatus = useSelector((state: RootState) => state.portfolio.user.kycStatus);
  const isLoading = useSelector((state: RootState) => state.portfolio.isLoading);

  // Form State
  const [docType, setDocType] = useState<'Smart_CNIC' | 'Passport'>('Smart_CNIC');
  const [docNumber, setDocNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [pdpbConsent, setPdpbConsent] = useState(false);
  const [frontImageBase64, setFrontImageBase64] = useState<string | null>(null);
  const [backImageBase64, setBackImageBase64] = useState<string | null>(null);

  // Camera & Viewfinder Modal State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraSide, setCameraSide] = useState<'front' | 'back'>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // CNIC Auto-hyphenation formatting (XXXXX-XXXXXXX-X)
  const handleCnicChange = (text: string) => {
    if (docType === 'Smart_CNIC') {
      const digits = text.replace(/\D/g, '').slice(0, 13);
      let formatted = '';
      if (digits.length <= 5) {
        formatted = digits;
      } else if (digits.length <= 12) {
        formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`;
      } else {
        formatted = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
      }
      setDocNumber(formatted);
    } else {
      setDocNumber(text.toUpperCase().slice(0, 9));
    }
  };

  // DOB Auto-formatting (YYYY-MM-DD)
  const handleDobChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    if (digits.length <= 4) {
      formatted = digits;
    } else if (digits.length <= 6) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    } else {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    }
    setDateOfBirth(formatted);
  };

  // Age calculation and validation helper
  const calculateAge = (dobString: string): number | null => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dobString)) return null;
    const parts = dobString.split('-').map(Number);
    const birthDate = new Date(parts[0], parts[1] - 1, parts[2]);
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculatedAge = calculateAge(dateOfBirth);
  const isAdultInvestor = calculatedAge !== null && calculatedAge >= 18;

  // Open Camera Viewfinder
  const openViewfinder = async (side: 'front' | 'back') => {
    setCameraSide(side);
    if (!permission?.granted) {
      const status = await requestPermission();
      if (!status.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Camera access is required to capture your CNIC/Passport viewfinder image. You can also use the sample capture button in simulated environments.'
        );
      }
    }
    setIsCameraOpen(true);
  };

  // Capture Image via expo-camera
  const handleCapturePhoto = async () => {
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.7,
        });

        if (photo?.base64) {
          if (cameraSide === 'front') {
            setFrontImageBase64(photo.base64);
          } else {
            setBackImageBase64(photo.base64);
          }
          setIsCameraOpen(false);
          Alert.alert('Capture Success', `${cameraSide === 'front' ? 'Front' : 'Back'} side captured successfully.`);
        }
      }
    } catch (err: any) {
      Alert.alert('Capture Error', err?.message || 'Failed to capture frame from camera sensor.');
    }
  };

  // Fallback simulator mock capture
  const handleSimulateCapture = () => {
    const mockBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    if (cameraSide === 'front') {
      setFrontImageBase64(mockBase64);
    } else {
      setBackImageBase64(mockBase64);
    }
    setIsCameraOpen(false);
    Alert.alert('Simulated Capture', `Sample ${cameraSide === 'front' ? 'Front' : 'Back'} document loaded for testing.`);
  };

  // Submit Handler
  const handleSubmit = async () => {
    // 1. Validation
    if (docType === 'Smart_CNIC') {
      if (!/^\d{5}-\d{7}-\d{1}$/.test(docNumber)) {
        Alert.alert('Invalid CNIC', 'Please provide a valid 13-digit Pakistani CNIC in format XXXXX-XXXXXXX-X.');
        return;
      }
    } else {
      if (!/^[A-Z0-9]{8,9}$/.test(docNumber)) {
        Alert.alert('Invalid Passport', 'Please enter a valid 8-9 character Passport number.');
        return;
      }
    }

    if (!calculatedAge) {
      Alert.alert('Invalid Date of Birth', 'Please enter a complete date of birth (YYYY-MM-DD).');
      return;
    }

    if (calculatedAge < 18) {
      Alert.alert(
        'Underage Investor Blocked',
        'Under SECP Regulatory Framework 2026, wealth management accounts cannot be opened by individuals under 18 years old.'
      );
      return;
    }

    if (!pdpbConsent) {
      Alert.alert('Consent Required', 'You must agree to the PDPB sovereign biometric data consent to proceed.');
      return;
    }

    try {
      const result = await dispatch(
        submitKycVerification({
          documentType: docType,
          documentNumber: docNumber,
          dateOfBirth,
          documentFileBase64: frontImageBase64 || undefined,
        })
      ).unwrap();

      Alert.alert(
        'SECP Compliance Dossier Submitted',
        `Your verification dossier has been recorded in the sovereign storage vault.\nDocument ID: ${result.documentId || 'Recorded'}\nStatus: PENDING REVIEW`
      );
    } catch (err: any) {
      Alert.alert('Submission Failed', typeof err === 'string' ? err : 'Compliance gateway rejected submission.');
    }
  };

  // Status Styling
  const getStatusCardStyles = () => {
    switch (kycStatus) {
      case 'Approved':
        return {
          bg: '#ECFDF5',
          border: '#6EE7B7',
          color: '#059669',
          badge: 'VERIFIED INVESTOR',
          desc: 'Your identity has been authenticated against SECP, NADRA, and FBR databases. Unrestricted asset synchronization is active.',
        };
      case 'Pending':
        return {
          bg: '#FFFBEB',
          border: '#FDE68A',
          color: '#D97706',
          badge: 'PENDING COMPLIANCE REVIEW',
          desc: 'Your CNIC documentation is currently being reviewed by compliance officers. Verification takes 12-24 business hours.',
        };
      default:
        return {
          bg: '#FEF2F2',
          border: '#FCA5A5',
          color: '#DC2626',
          badge: 'UNVERIFIED ACCOUNT',
          desc: 'Submit your 13-digit Smart CNIC or Passport with sovereign PDPB biometric consent to unlock live broker portfolio sync.',
        };
    }
  };

  const statusInfo = getStatusCardStyles();

  return (
    <ScrollView
      style={styles.canvas}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <Text style={styles.title}>Identity Compliance</Text>
        <Text style={styles.sub}>
          SECP, SBP & NADRA regulatory identity verification with Pakistan Personal Data Protection Bill (PDPB) sovereign compliance.
        </Text>

        {/* Dynamic Status Card */}
        <View style={[styles.statusBox, { backgroundColor: statusInfo.bg, borderColor: statusInfo.border }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
            <Text style={[styles.statusBadge, { color: statusInfo.color }]}>{statusInfo.badge}</Text>
          </View>
          <Text style={styles.statusDesc}>{statusInfo.desc}</Text>
        </View>

        {kycStatus === 'Unverified' && (
          <View style={styles.formSection}>
            {/* Document Type Selector */}
            <Text style={styles.sectionLabel}>DOCUMENT TYPE</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[styles.segmentBtn, docType === 'Smart_CNIC' && styles.segmentBtnActive]}
                onPress={() => setDocType('Smart_CNIC')}
              >
                <Text style={[styles.segmentText, docType === 'Smart_CNIC' && styles.segmentTextActive]}>
                  Smart CNIC / SNIC
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentBtn, docType === 'Passport' && styles.segmentBtnActive]}
                onPress={() => setDocType('Passport')}
              >
                <Text style={[styles.segmentText, docType === 'Passport' && styles.segmentTextActive]}>
                  Pakistani Passport
                </Text>
              </TouchableOpacity>
            </View>

            {/* Document Number Input */}
            <Text style={styles.sectionLabel}>
              {docType === 'Smart_CNIC' ? '13-DIGIT SMART CNIC NUMBER' : 'PASSPORT NUMBER'}
            </Text>
            <TextInput
              style={styles.textInput}
              value={docNumber}
              onChangeText={handleCnicChange}
              placeholder={docType === 'Smart_CNIC' ? '42101-1234567-1' : 'AB1234567'}
              placeholderTextColor="#94A3B8"
              keyboardType={docType === 'Smart_CNIC' ? 'numeric' : 'default'}
              maxLength={docType === 'Smart_CNIC' ? 15 : 9}
              autoCapitalize="characters"
            />
            {docType === 'Smart_CNIC' && docNumber.length > 0 && docNumber.length < 15 && (
              <Text style={styles.hintText}>Enter all 13 digits (auto-hyphenated)</Text>
            )}

            {/* Date of Birth Input */}
            <Text style={styles.sectionLabel}>DATE OF BIRTH (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              value={dateOfBirth}
              onChangeText={handleDobChange}
              placeholder="1998-05-14"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              maxLength={10}
            />
            {calculatedAge !== null && (
              <View style={[styles.ageBadge, { backgroundColor: isAdultInvestor ? '#ECFDF5' : '#FEF2F2' }]}>
                <Text style={[styles.ageBadgeText, { color: isAdultInvestor ? '#059669' : '#DC2626' }]}>
                  {isAdultInvestor
                    ? `Investor Age: ${calculatedAge} yrs • SECP Eligible (18+)`
                    : `Underage: ${calculatedAge} yrs • SECP prohibits investing under 18`}
                </Text>
              </View>
            )}

            {/* Viewfinder Capture Buttons */}
            <Text style={styles.sectionLabel}>BIOMETRIC DOCUMENT CAPTURE (EXPO-CAMERA)</Text>
            <View style={styles.captureRow}>
              <TouchableOpacity
                style={[styles.captureCard, frontImageBase64 ? styles.captureCardDone : null]}
                onPress={() => openViewfinder('front')}
              >
                <Text style={styles.captureIcon}>{frontImageBase64 ? '✓' : '📷'}</Text>
                <Text style={styles.captureTitle}>Front Viewfinder</Text>
                <Text style={styles.captureSub}>
                  {frontImageBase64 ? 'Front Captured (Tap to Retake)' : 'Scan Front of Card'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.captureCard, backImageBase64 ? styles.captureCardDone : null]}
                onPress={() => openViewfinder('back')}
              >
                <Text style={styles.captureIcon}>{backImageBase64 ? '✓' : '📷'}</Text>
                <Text style={styles.captureTitle}>Back Viewfinder</Text>
                <Text style={styles.captureSub}>
                  {backImageBase64 ? 'Back Captured (Tap to Retake)' : 'Scan Back of Card'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* PDPB / PECA 2026 Sovereign Consent Checkbox */}
            <TouchableOpacity
              style={styles.consentRow}
              onPress={() => setPdpbConsent(!pdpbConsent)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, pdpbConsent && styles.checkboxChecked]}>
                {pdpbConsent && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.consentText}>
                I hereby grant explicit consent under the <Text style={styles.boldText}>Pakistan Personal Data Protection Bill (PDPB)</Text> and PECA for Capital Loop to securely process my CNIC and biometric data strictly for <Text style={styles.boldText}>SECP KYC regulatory compliance</Text>. My data will be encrypted and stored in sovereign Pakistani storage.
              </Text>
            </TouchableOpacity>

            {/* Submit Action Button */}
            <View style={styles.submitContainer}>
              <ActionButton
                title={isLoading ? 'Submitting to Sovereign Vault...' : 'Submit SECP Compliance Verification'}
                onPress={handleSubmit}
                variant="primary"
                loading={isLoading}
                disabled={!pdpbConsent || !isAdultInvestor || docNumber.length < 9}
              />
            </View>
          </View>
        )}
      </View>

      {/* Expo-Camera Viewfinder Modal */}
      <Modal
        visible={isCameraOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsCameraOpen(false)}
      >
        <View style={styles.cameraContainer}>
          {permission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFillObject}
              facing="back"
            />
          ) : (
            <View style={styles.noCameraView}>
              <Text style={styles.noCameraText}>Camera access is not available or permission was denied.</Text>
            </View>
          )}

          {/* Viewfinder Framing Overlay */}
          <View style={styles.overlayContainer}>
            <View style={styles.overlayTop}>
              <Text style={styles.overlayTitle}>
                Capture {cameraSide === 'front' ? 'Front Side' : 'Back Side'} of {docType === 'Smart_CNIC' ? 'CNIC' : 'Passport'}
              </Text>
              <Text style={styles.overlaySubtitle}>Position document cleanly inside the card frame</Text>
            </View>

            {/* Card Alignment Bounding Frame */}
            <View style={styles.cardFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              <Text style={styles.frameGuideText}>PAKISTAN SOVEREIGN IDENTITY</Text>
            </View>

            {/* Viewfinder Action Buttons */}
            <View style={styles.overlayBottom}>
              <TouchableOpacity
                style={styles.shutterButton}
                onPress={handleCapturePhoto}
              >
                <View style={styles.shutterInner} />
              </TouchableOpacity>

              <View style={styles.cameraAuxRow}>
                <TouchableOpacity
                  style={styles.auxBtn}
                  onPress={handleSimulateCapture}
                >
                  <Text style={styles.auxBtnText}>Use Sample ID (Simulator)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.auxBtn, styles.cancelBtn]}
                  onPress={() => setIsCameraOpen(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  statusBox: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusDesc: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  formSection: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  hintText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    marginLeft: 4,
  },
  ageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 8,
  },
  ageBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  captureRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  captureCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
  },
  captureCardDone: {
    borderColor: '#10B981',
    borderStyle: 'solid',
    backgroundColor: '#F0FDF4',
  },
  captureIcon: {
    fontSize: 24,
    marginBottom: 6,
    color: '#2563EB',
  },
  captureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  captureSub: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  consentText: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  submitContainer: {
    marginTop: 24,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  noCameraView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noCameraText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  overlayTop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  overlayTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  overlaySubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  cardFrame: {
    width: '90%',
    aspectRatio: 1.586, // Standard ID Card aspect ratio (85.60 × 53.98)
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#38BDF8',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  frameGuideText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  overlayBottom: {
    alignItems: 'center',
    width: '100%',
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  },
  cameraAuxRow: {
    flexDirection: 'row',
    gap: 12,
  },
  auxBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  auxBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cancelBtn: {
    backgroundColor: 'rgba(239,68,68,0.3)',
  },
  cancelBtnText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600',
  },
});