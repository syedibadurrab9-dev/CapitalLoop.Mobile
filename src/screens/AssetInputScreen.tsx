import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, ScrollView, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { CameraView } from 'expo-camera'; 
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootState, AppDispatch } from '../store';
import { addNewAsset, linkBinanceWallet, clearSliceErrors } from '../store/portfolioSlice';
import { requestCameraPermission, setScannerState } from '../store/cameraSlice';
import { CustomInput } from '../components/CustomInput';
import { ActionButton } from '../components/ActionButton';

export default function AssetInputScreen({ navigation }: NativeStackScreenProps<any>) {
  const dispatch = useDispatch<AppDispatch>();

  // --- STATE REGISTRY EXTRACTION CONSOLE ---
  const { isLoading, error: portfolioError } = useSelector((state: RootState) => state.portfolio);
  const { hasPermission, isScannerActive, error: cameraError } = useSelector((state: RootState) => state.camera);
  
  // --- INTERFACE MODE SELECTION TOGGLES ---
  const [entryMode, setEntryMode] = useState<'Manual' | 'AutoExchange'>('Manual');

  // --- MANUAL ENTRY CONTROL DATA HOOKS ---
  const [name, setName] = useState('');
  const [valStr, setValStr] = useState('');
  const [cat, setCat] = useState<'PSX_Equity' | 'Crypto' | 'Mutual_Fund' | 'Real_Estate'>('PSX_Equity');
  const [paidIns, setPaidIns] = useState('');
  const [totalIns, setTotalIns] = useState('');

  // --- AUTOMATED EXCHANGE CONTROL DATA HOOKS ---
  const [exchangeApiKey, setExchangeApiKey] = useState('');
  const [exchangeSecretKey, setExchangeSecretKey] = useState('');

  // Flush legacy api and slice errors when switching operational context profiles
  useEffect(() => {
    dispatch(clearSliceErrors());
  }, [entryMode]);

  // Handles raw barcode line telemetry patterns streaming out of device lenses
  const handleQrCodeDecoded = ({ data }: { data: string }) => {
    dispatch(setScannerState(false));
    
    try {
      let parsedApiKey = '';
      let parsedSecretKey = '';

      if (data.startsWith('{')) {
        const jsonMetadata = JSON.parse(data);
        parsedApiKey = jsonMetadata.apiKey;
        parsedSecretKey = jsonMetadata.secretKey;
      } else if (data.includes('|')) {
        const stringSegments = data.split('|');
        parsedApiKey = stringSegments[0].trim();
        parsedSecretKey = stringSegments[1].trim();
      }

      if (parsedApiKey && parsedSecretKey) {
        setExchangeApiKey(parsedApiKey);
        setExchangeSecretKey(parsedSecretKey);
        triggerBinanceCoreSync(parsedApiKey, parsedSecretKey);
      } else {
        throw new Error();
      }
    } catch {
      Alert.alert('Scan Matrix Error', 'Unable to parse structural credential formats from decrypted QR stream.');
    }
  };

  const triggerBinanceCoreSync = (apiKey: string, secretKey: string) => {
    if (!apiKey || !secretKey) {
      Alert.alert('Input Parameters Void', 'Please configure explicit API strings prior to initializing sync tracks.');
      return;
    }

    dispatch(linkBinanceWallet({ apiKey, secretKey }))
      .unwrap()
      .then(() => {
        Alert.alert('Integration Finalized', 'Exchanges balance vectors auto-hydrated safely into local PKR metrics.');
        navigation.goBack();
      })
      .catch((backendErr) => {
        Alert.alert('Handshake Faulted', backendErr);
      });
  };

  const initializeHardwareScanner = () => {
    dispatch(requestCameraPermission())
      .unwrap()
      .then((granted) => {
        if (granted) {
          dispatch(setScannerState(true));
        } else {
          Alert.alert('Hardware Restriction', 'Please toggle camera privacy permissions manually inside mobile hardware config.');
        }
      });
  };

  const handleManualSave = () => {
    const numeric = parseFloat(valStr);
    if (!name || isNaN(numeric) || numeric <= 0) {
      Alert.alert('Validation Rejection', 'Please enter valid allocation parameters.');
      return;
    }
    
    dispatch(addNewAsset({ 
      id: Math.random().toString(), 
      name, 
      category: cat, 
      holdingValuePKR: numeric, 
      isAutoSynced: false,
      installmentsPaid: cat === 'Real_Estate' ? parseInt(paidIns) || 0 : undefined,
      totalInstallments: cat === 'Real_Estate' ? parseInt(totalIns) || 0 : undefined
    }));
    
    Alert.alert('Position Logged', 'Manual asset node pinned to tracking runtime successfully.');
    navigation.goBack();
  };

  // --- RENDERING MODAL VIEWPORT OVERLAYS ---
  if (isScannerActive && hasPermission) {
    return (
      <CameraView 
        style={StyleSheet.absoluteFillObject} 
        onBarcodeScanned={handleQrCodeDecoded}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        <View style={styles.scannerOverlayContainer}>
          <Text style={styles.scannerPromptTxt}>Align desktop API Management QR inside box frame</Text>
          <TouchableOpacity style={styles.closeScannerBtn} onPress={() => dispatch(setScannerState(false))}>
            <Text style={styles.closeScannerBtnTxt}>Abort Scanner Hardware</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Asset Ingestion Control</Text>
      <Text style={styles.sub}>Select synchronization method vector to lock down distributed capital items.</Text>

      {/* Mode Operational Segmentation Toggle Switches */}
      <View style={styles.segmentControlTrack}>
        <TouchableOpacity 
          style={[styles.segmentBtn, entryMode === 'Manual' && styles.activeSegmentBtn]} 
          onPress={() => setEntryMode('Manual')}
        >
          <Text style={[styles.segmentTxt, entryMode === 'Manual' && styles.activeSegmentTxt]}>Manual Ledger</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.segmentBtn, entryMode === 'AutoExchange' && styles.activeSegmentBtn]} 
          onPress={() => setEntryMode('AutoExchange')}
        >
          <Text style={[styles.segmentTxt, entryMode === 'AutoExchange' && styles.activeSegmentTxt]}>Automated Sync</Text>
        </TouchableOpacity>
      </View>

      {portfolioError && (
        <View style={styles.errorBanner}><Text style={styles.errorBannerTxt}>⚠️ {portfolioError}</Text></View>
      )}
      {cameraError && (
        <View style={styles.errorBanner}><Text style={styles.errorBannerTxt}>📷 {cameraError}</Text></View>
      )}

      {/* --- CONDITIONAL CONTEXT CONVERSIONS INTERFACE BLOCKS --- */}

      {entryMode === 'Manual' ? (
        <View>
          <CustomInput label="Asset Position Title" value={name} onChangeText={setName} placeholder="e.g., DHA Phase 9 File / Silver Vault" />
          <CustomInput label="Current Evaluation Principal (PKR)" value={valStr} onChangeText={setValStr} placeholder="e.g., 2000000" keyboardType="numeric" />
          
          <Text style={styles.label}>Classification Category</Text>
          <View style={styles.row}>
            {(['PSX_Equity', 'Crypto', 'Mutual_Fund', 'Real_Estate'] as const).map((t) => (
              <TouchableOpacity key={t} style={[styles.chip, cat === t && styles.activeChip]} onPress={() => setCat(t)}>
                <Text style={[styles.chipTxt, cat === t && styles.activeChipTxt]}>{t.replace('_', ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {cat === 'Real_Estate' && (
            <View style={styles.reBlock}>
              <Text style={styles.reTitle}>Housing Society Installment Telemetry</Text>
              <View style={styles.reRow}>
                <View style={{ flex: 0.47 }}><CustomInput label="Installments Paid" value={paidIns} onChangeText={setPaidIns} placeholder="3" keyboardType="numeric" /></View>
                <View style={{ flex: 0.47 }}><CustomInput label="Total Contract Matrix" value={totalIns} onChangeText={setTotalIns} placeholder="12" keyboardType="numeric" /></View>
              </View>
            </View>
          )}

          <ActionButton title="Synchronize Portfolio Allocation" onPress={handleManualSave} variant="accent" />
        </View>
      ) : (
        <View style={styles.autoBlock}>
          <Text style={styles.autoBlockHeaderTitle}>Binance Brokerage Live Integration Layer</Text>
          <Text style={styles.autoBlockDescriptionSub}>
            Authorizes CapitalLoop downstream endpoints to fetch Spot positions, Staking Earn yields, and Futures allocations securely. Keep your account safe by ensuring your keys use Read-Only access permissions.
          </Text>

          <TouchableOpacity style={styles.cameraTriggerWidgetBtn} onPress={initializeHardwareScanner}>
            <Text style={styles.cameraTriggerWidgetBtnTxt}>📷 Open Hardware Scanner & Parse Desktop QR</Text>
          </TouchableOpacity>

          <Text style={styles.inlineComponentSplitDivider}>— OR MANUAL INJECTION TRACK —</Text>

          <CustomInput label="Binance Rest-Api Token (Key)" value={exchangeApiKey} onChangeText={setExchangeApiKey} placeholder="Paste long hexadecimal API key string" />
          <CustomInput label="Binance Cryptographic Signed Security Signature (Secret)" value={exchangeSecretKey} onChangeText={setExchangeSecretKey} placeholder="Paste long secret hash string" secureTextEntry={true} />

          <ActionButton 
            title={isLoading ? "Interrogating Node Pipelines..." : "Establish Cryptographic Brokerage Handshake"} 
            onPress={() => triggerBinanceCoreSync(exchangeApiKey, exchangeSecretKey)} 
            variant="accent" 
            disabled={isLoading}
          />

          {isLoading && <ActivityIndicator style={{ marginTop: 20 }} size="small" color="#6366F1" />}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  sub: { fontSize: 13, color: '#64748B', marginBottom: 24 },
  segmentControlTrack: { flexDirection: 'row', backgroundColor: '#1E293B', padding: 4, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#334155' },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeSegmentBtn: { 
    backgroundColor: '#0F172A', 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41
  },
  segmentTxt: { color: '#64748B', fontSize: 13, fontWeight: '700' },
  activeSegmentTxt: { color: '#38BDF8' },
  errorBanner: { backgroundColor: '#7F1D1D', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#F87171', marginBottom: 16 },
  errorBannerTxt: { color: '#FCA5A5', fontSize: 12, fontWeight: '600' },
  label: { fontSize: 11, color: '#94A3B8', fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  chip: { width: '48%', backgroundColor: '#1E293B', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  activeChip: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  chipTxt: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  activeChipTxt: { color: '#FFFFFF' },
  reBlock: { backgroundColor: '#1E293B', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 24 },
  reTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginBottom: 14 },
  reRow: { flexDirection: 'row', justifyContent: 'space-between' },
  autoBlock: { backgroundColor: '#1E293B', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  autoBlockHeaderTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginBottom: 6 },
  autoBlockDescriptionSub: { color: '#64748B', fontSize: 12, lineHeight: 18, marginBottom: 20 },
  cameraTriggerWidgetBtn: { backgroundColor: '#F3BA2F', padding: 16, borderRadius: 12, alignItems: 'center', marginVertical: 8 },
  cameraTriggerWidgetBtnTxt: { color: '#0F172A', fontWeight: '800', fontSize: 13, letterSpacing: 0.25 },
  inlineComponentSplitDivider: { textAlign: 'center', color: '#475569', fontSize: 10, fontWeight: '700', marginVertical: 18, letterSpacing: 1 },
  scannerOverlayContainer: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 120 },
  scannerPromptTxt: { color: '#FFFFFF', backgroundColor: 'rgba(15, 23, 42, 0.85)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, fontSize: 12, fontWeight: '700', overflow: 'hidden', textAlign: 'center' },
  closeScannerBtn: { backgroundColor: '#EF4444', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  closeScannerBtnTxt: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});