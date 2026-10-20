import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { CameraView } from 'expo-camera'; 
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootState, AppDispatch } from '../store';
import { addNewAsset, linkBinanceWallet, clearSliceErrors } from '../store/portfolioSlice';
import { requestCameraPermission, setScannerState } from '../store/cameraSlice';
import { CustomInput } from '../components/CustomInput';
import { ActionButton } from '../components/ActionButton';
import { InstitutionalHeader } from '../components/InstitutionalHeader';
import { BottomNavBar, TabRouteName } from '../components/BottomNavBar';
import { LeftDrawer } from '../components/LeftDrawer';

export default function AssetInputScreen({ navigation }: NativeStackScreenProps<any>) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
      Alert.alert('Scan Error', 'Could not read API keys from the QR code pattern.');
    }
  };

  const triggerBinanceCoreSync = (apiKey: string, secretKey: string) => {
    if (!apiKey || !secretKey) {
      Alert.alert('Missing Keys', 'Please provide or scan your API keys before syncing.');
      return;
    }

    dispatch(linkBinanceWallet({ apiKey, secretKey }))
      .unwrap()
      .then(() => {
        Alert.alert('Sync Complete', 'Exchange balances successfully added to your net worth.');
        navigation.goBack();
      })
      .catch((backendErr) => {
        Alert.alert('Sync Failed', backendErr);
      });
  };

  const initializeHardwareScanner = () => {
    dispatch(requestCameraPermission())
      .unwrap()
      .then((granted) => {
        if (granted) {
          dispatch(setScannerState(true));
        } else {
          Alert.alert('Camera Access Required', 'Please enable camera access permissions in your mobile system settings.');
        }
      });
  };

  const handleManualSave = () => {
    const numeric = parseFloat(valStr);
    if (!name || isNaN(numeric) || numeric <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid position name and evaluation amount.');
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
    
    Alert.alert('Asset Added', 'Manual entry successfully pinned to your dynamic ledger.');
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
          <Text style={styles.scannerPromptTxt}>Align your desktop API QR code inside the camera frame</Text>
          <TouchableOpacity style={styles.closeScannerBtn} onPress={() => dispatch(setScannerState(false))}>
            <Text style={styles.closeScannerBtnTxt}>Cancel Scan</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    );
  }

  return (
    <View style={styles.rootWrapper}>
      {/* Institutional Top Header */}
      <InstitutionalHeader
        title="ASSET VAULT"
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenProfile={() => navigation.navigate('Profile')}
      />

      {/* Slide-out Left Navigation Drawer */}
      <LeftDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={(route) => navigation.navigate(route)}
        currentRoute="AssetInput"
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Add Asset</Text>
      <Text style={styles.sub}>Choose a tracking method to securely log your capital holdings.</Text>

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
          <CustomInput label="Asset Name" value={name} onChangeText={setName} placeholder="e.g., Physical Silver Vault / DHA File" />
          <CustomInput label="Current Value (PKR)" value={valStr} onChangeText={setValStr} placeholder="e.g., 2000000" keyboardType="numeric" />
          
          <Text style={styles.label}>Asset Type</Text>
          <View style={styles.row}>
            {(['PSX_Equity', 'Crypto', 'Mutual_Fund', 'Real_Estate'] as const).map((t) => (
              <TouchableOpacity key={t} style={[styles.chip, cat === t && styles.activeChip]} onPress={() => setCat(t)}>
                <Text style={[styles.chipTxt, cat === t && styles.activeChipTxt]}>{t.replace('_', ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {cat === 'Real_Estate' && (
            <View style={styles.reBlock}>
              <Text style={styles.reTitle}>Installment Plan Progress</Text>
              <View style={styles.reRow}>
                <View style={{ flex: 0.47 }}><CustomInput label="Installments Paid" value={paidIns} onChangeText={setPaidIns} placeholder="3" keyboardType="numeric" /></View>
                <View style={{ flex: 0.47 }}><CustomInput label="Total Installments" value={totalIns} onChangeText={setTotalIns} placeholder="12" keyboardType="numeric" /></View>
              </View>
            </View>
          )}

          <ActionButton title="Save Position to Portfolio" onPress={handleManualSave} variant="primary" />
        </View>
      ) : (
        <View style={styles.autoBlock}>
          <Text style={styles.autoBlockHeaderTitle}>Binance Exchange Integration</Text>
          <Text style={styles.autoBlockDescriptionSub}>
            Securely link your Spot portfolio, Staking fields, and asset holdings. For optimal security, ensure your generated API keys use Read-Only access profiles.
          </Text>

          <TouchableOpacity style={styles.cameraTriggerWidgetBtn} onPress={initializeHardwareScanner} activeOpacity={0.8}>
            <Text style={styles.cameraTriggerWidgetBtnTxt}>📷 Scan Desktop Account QR Code</Text>
          </TouchableOpacity>

          <Text style={styles.inlineComponentSplitDivider}>— OR ENTER MANUALLY —</Text>

          <CustomInput label="Binance Read-Only API Key" value={exchangeApiKey} onChangeText={setExchangeApiKey} placeholder="Paste long API key string" />
          <CustomInput label="Binance Secret Key" value={exchangeSecretKey} onChangeText={setExchangeSecretKey} placeholder="Paste your secret hash string" secureTextEntry={true} />

          <ActionButton 
            title={isLoading ? "Connecting Secure Node..." : "Link API Account"} 
            onPress={() => triggerBinanceCoreSync(exchangeApiKey, exchangeSecretKey)} 
            variant="primary" 
            disabled={isLoading}
          />

          {isLoading && <ActivityIndicator style={{ marginTop: 20 }} size="small" color="#2563EB" />}
        </View>
      )}
    </ScrollView>

      {/* Persistent FinTech Bottom Navigation Bar */}
      <BottomNavBar
        activeRoute="AssetInput"
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
    backgroundColor: '#F1F5F9' /* Premium soft light grey slate base */
  },
  content: { 
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40
  },
  title: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: '#0F172A', /* Saturated deep ink slate typography */
    marginBottom: 4,
    letterSpacing: -0.5
  },
  sub: { 
    fontSize: 13, 
    color: '#64748B', 
    marginBottom: 24,
    lineHeight: 20
  },
  segmentControlTrack: { 
    flexDirection: 'row', 
    backgroundColor: '#E2E8F0', 
    padding: 4, 
    borderRadius: 14, 
    marginBottom: 24, 
    borderWidth: 1, 
    borderColor: '#CBD5E1' 
  },
  segmentBtn: { 
    flex: 1, 
    paddingVertical: 10, 
    alignItems: 'center', 
    borderRadius: 10 
  },
  activeSegmentBtn: { 
    backgroundColor: '#FFFFFF', /* Frosted selector highlight */
    shadowColor: '#0F172A', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2
  },
  segmentTxt: { 
    color: '#64748B', 
    fontSize: 13, 
    fontWeight: '700' 
  },
  activeSegmentTxt: { 
    color: '#2563EB' /* Active brand blue color highlight */
  },
  errorBanner: { 
    backgroundColor: '#FEF2F2', 
    padding: 14, 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: '#FEE2E2', 
    marginBottom: 16 
  },
  errorBannerTxt: { 
    color: '#DC2626', 
    fontSize: 13, 
    fontWeight: '600' 
  },
  label: { 
    fontSize: 13, 
    color: '#334155', 
    fontWeight: '600', 
    marginBottom: 10,
    letterSpacing: -0.1
  },
  row: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginBottom: 16 
  },
  chip: { 
    width: '48%', 
    backgroundColor: '#FFFFFF', 
    paddingVertical: 14, 
    borderRadius: 14, 
    alignItems: 'center', 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1
  },
  activeChip: { 
    backgroundColor: '#EFF6FF', 
    borderColor: '#BFDBFE' 
  },
  chipTxt: { 
    color: '#475569', 
    fontSize: 13, 
    fontWeight: '600' 
  },
  activeChipTxt: { 
    color: '#2563EB',
    fontWeight: '700' 
  },
  reBlock: { 
    backgroundColor: '#FFFFFF', 
    padding: 20, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1
  },
  reTitle: { 
    color: '#334155', 
    fontSize: 14, 
    fontWeight: '700', 
    marginBottom: 16,
    letterSpacing: -0.1
  },
  reRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  autoBlock: { 
    backgroundColor: '#FFFFFF', 
    padding: 24, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1
  },
  autoBlockHeaderTitle: { 
    color: '#0F172A', 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 6,
    letterSpacing: -0.2
  },
  autoBlockDescriptionSub: { 
    color: '#64748B', 
    fontSize: 13, 
    lineHeight: 18, 
    marginBottom: 20 
  },
  cameraTriggerWidgetBtn: { 
    backgroundColor: '#2563EB', /* Clean brand signature sapphire */
    // 🚀 FIXED: Changed 'paddingScale' to 'paddingHorizontal' to clear type mismatch error
    paddingHorizontal: 16, 
    paddingVertical: 14,
    borderRadius: 14, 
    alignItems: 'center', 
    marginVertical: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2
  },
  cameraTriggerWidgetBtnTxt: { 
    color: '#FFFFFF', 
    fontWeight: '700', 
    fontSize: 13 
  },
  inlineComponentSplitDivider: { 
    textAlign: 'center', 
    color: '#94A3B8', 
    fontSize: 11, 
    fontWeight: '700', 
    marginVertical: 20, 
    letterSpacing: 0.5 
  },
  scannerOverlayContainer: { 
    flex: 1, 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 120 
  },
  scannerPromptTxt: { 
    color: '#0F172A', 
    backgroundColor: 'rgba(255, 255, 255, 0.92)', /* Soft frosted overlay prompt box */
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: 24, 
    fontSize: 13, 
    fontWeight: '600', 
    textAlign: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  closeScannerBtn: { 
    backgroundColor: '#DC2626', 
    paddingHorizontal: 24, 
    paddingVertical: 14, 
    borderRadius: 14, 
    shadowColor: '#000', 
    shadowOpacity: 0.2, 
    shadowRadius: 6, 
    elevation: 4 
  },
  closeScannerBtnTxt: { 
    color: '#FFFFFF', 
    fontWeight: '700', 
    fontSize: 13 
  },
});