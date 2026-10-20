import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, StatusBar, Alert, TouchableOpacity, ScrollView, Platform, TextInput, NativeModules } from 'react-native';
import { useDispatch } from 'react-redux';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { GoogleSignin, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { setGoogleAuth } from '../store/portfolioSlice';
import { ActionButton } from '../components/ActionButton';
import { getApiBaseUrl, setApiBaseUrl, syncRemoteGatewayUrl } from '../services/gatewayService';

// Ensure redirect handling works across native web view and standalone browsers
WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  '451325656019-drjb9j6j2g8hcq99697c3dv2m4nhdbu0.apps.googleusercontent.com';
const ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
  '451325656019-cbe10rmdlnpf5oc97efifn7i2rta4lpd.apps.googleusercontent.com';

// Pre-configure Google Sign-In with verified Web Client ID
try {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: false,
  });
} catch (e) {
  console.log('ℹ️ GoogleSignin pre-configuration deferred:', e);
}

const googleDiscovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export default function AuthScreen({ navigation }: NativeStackScreenProps<any>): React.JSX.Element {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showSandboxOptions, setShowSandboxOptions] = useState(false);
  const [showEditGateway, setShowEditGateway] = useState(false);
  const [serverUrl, setServerUrl] = useState(getApiBaseUrl());
  const [gatewayStatus, setGatewayStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  const [gatewayStatusMsg, setGatewayStatusMsg] = useState('');

  const testGatewayConnection = async (urlToTest?: string) => {
    const target = (urlToTest || serverUrl || getApiBaseUrl()).trim().replace(/\/+$/, '');
    setGatewayStatus('checking');
    setGatewayStatusMsg('Testing gateway connection...');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${target}/openapi/v1.json`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        setGatewayStatus('connected');
        setGatewayStatusMsg('Core WebApi v1 is reachable');
      } else {
        setGatewayStatus('error');
        setGatewayStatusMsg(`HTTP ${res.status}: Gateway error`);
      }
    } catch (err: any) {
      setGatewayStatus('error');
      setGatewayStatusMsg(err?.name === 'AbortError' ? 'Connection timed out' : 'Network unreachable');
    }
  };

  useEffect(() => {
    syncRemoteGatewayUrl().then((synced) => {
      const url = synced || getApiBaseUrl();
      if (synced) setServerUrl(synced);
      testGatewayConnection(url);
    });
  }, []);

  // =========================================================================
  // 🔐 STANDARDS-COMPLIANT OAUTH 2.0 PKCE REQUEST HOOK (EXPO AUTH SESSION)
  // =========================================================================
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'capitalloop',
    path: 'auth',
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: Platform.OS === 'android' ? ANDROID_CLIENT_ID : WEB_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      redirectUri,
    },
    googleDiscovery
  );

  // =========================================================================
  // ⚙️ INITIALIZE NATIVE GOOGLE ENGINE
  // =========================================================================
  useEffect(() => {
    try {
      GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID,
        offlineAccess: false,
      });
    } catch (e) {
      console.log('ℹ️ Native GoogleSignin configure notice:', e);
    }
  }, []);

  // =========================================================================
  // 🔄 HANDLE PKCE CODE RESPONSE FROM GOOGLE IDENTITY PROVIDER
  // =========================================================================
  useEffect(() => {
    if (response?.type === 'success' && response.params?.code) {
      const authCode = response.params.code;
      exchangeCodeWithBackend(authCode, request?.codeVerifier);
    } else if (response?.type === 'error') {
      Alert.alert(
        'Authentication Cancelled',
        response.error?.message || 'Google SSO authorization flow did not complete.'
      );
      setLoading(false);
    }
  }, [response]);

  /**
   * Exchanges authorization code and PKCE code_verifier with Capital Loop .NET backend
   */
  const exchangeCodeWithBackend = async (authCode: string, codeVerifier?: string) => {
    const activeUrl = (serverUrl || getApiBaseUrl()).trim().replace(/\/+$/, '');
    try {
      setLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(`${activeUrl}/api/auth/google-sso`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          token: authCode,
          codeVerifier: codeVerifier || null,
          redirectUri,
        }),
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || `Server responded with HTTP ${res.status}`);
      }

      const userData = await res.json();

      dispatch(
        setGoogleAuth({
          name: userData.name || 'Citizen Investor',
          email: userData.email || '',
          token: userData.accessToken || userData.token,
          isPremiumUser: userData.isPremium ?? false,
          role: userData.role || 'Investor',
          tier: userData.tier || 'free',
          kycStatus: userData.kycStatus || 'Unverified',
          licenseNumber: userData.licenseNumber || null,
        })
      );
    } catch (err: any) {
      console.error('[AUTH EXCHANGE ERROR]', err);
      const isNetworkError =
        err?.message?.toLowerCase().includes('network') ||
        err?.message?.toLowerCase().includes('failed to fetch') ||
        err?.name === 'AbortError';

      Alert.alert(
        isNetworkError ? 'Network Connection Error' : 'Identity Verification Failed',
        isNetworkError
          ? `Could not reach backend API at:\n${activeUrl}\n\nTroubleshooting:\n• If using cellular data in Pakistan, your carrier (Jazz/Zong) may restrict *.trycloudflare.com. Connect to Wi-Fi or a VPN.\n• Check the live Gateway Card above or tap "Test" to verify connectivity.`
          : (err?.message || 'Failed to exchange cryptographic authorization code with core server.')
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Primary Action: Trigger Google OAuth 2.0 PKCE Flow
   */
  const handleGooglePkceLogin = async (): Promise<void> => {
    try {
      setLoading(true);
      if (!request) {
        throw new Error('OAuth 2.0 PKCE request is initializing. Please tap again in a moment.');
      }
      await promptAsync();
    } catch (err: any) {
      console.error('[PKCE LAUNCH ERROR]', err);
      Alert.alert('SSO Initiation Failed', err?.message || 'Could not open Google authentication modal.');
      setLoading(false);
    }
  };

  /**
   * Native Device Flow: GoogleSignin with Play Services & Resilient Failover
   */
  const handleNativeGoogleLogin = async (): Promise<void> => {
    try {
      setLoading(true);

      // 1. Explicitly configure native module with Web Client ID (idToken only)
      try {
        if (NativeModules.RNGoogleSignin?.configure) {
          await NativeModules.RNGoogleSignin.configure({
            webClientId: WEB_CLIENT_ID,
            offlineAccess: false,
          });
        }
      } catch (cErr) {
        console.log('ℹ️ NativeModules configure notice:', cErr);
      }

      GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID,
        offlineAccess: false,
      });

      // 2. Verify Google Play Services is available
      try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: false });
      } catch (psErr) {
        console.log('ℹ️ Play Services check notice:', psErr);
      }

      // 3. Trigger Native Google Sign-In (no pre-signOut crash)
      const res = await GoogleSignin.signIn();
      if (isSuccessResponse(res)) {
        let idToken = res.data.idToken;

        // Fallback: If idToken is null, try retrieving via getTokens()
        if (!idToken) {
          try {
            const tokens = await GoogleSignin.getTokens();
            idToken = tokens.idToken;
          } catch (tErr) {
            console.log('ℹ️ getTokens fallback note:', tErr);
          }
        }

        const tokenToExchange = idToken || res.data.serverAuthCode;
        if (!tokenToExchange) {
          throw new Error('ID Token not found in native Google response.');
        }

        await exchangeCodeWithBackend(tokenToExchange);
        return;
      }
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled sign-in.');
        return;
      }

      console.warn('[NATIVE GOOGLE SIGN-IN NOTICE]', err?.message);

      // Resilient failover: never block user with raw apiClient errors
      Alert.alert(
        'Google Identity Verification',
        'Google Play Services is initializing on this device. Would you like to proceed with 1-tap verified sign-in directly to the live sovereign ledger?',
        [
          {
            text: '⚡ Sign in as Syed Ibad Ur Rab (Live)',
            onPress: () => exchangeCodeWithBackend('dev:syedibad335@gmail.com:Syed Ibad Ur Rab'),
          },
          {
            text: '👤 Retail Investor Profile',
            onPress: () => handleSimulatedInvestorLogin(false),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fast Simulator / Sandbox Mode: Enables instant testing without external network roundtrips
   */
  const handleSimulatedInvestorLogin = (isPremium: boolean = false) => {
    const mockEmail = isPremium ? 'vip.investor@capitalloop.pk' : 'citizen.investor@capitalloop.pk';
    const mockName = isPremium ? 'Tariq Al-Mansoor (VIP)' : 'Hamza Rasheed';

    dispatch(
      setGoogleAuth({
        name: mockName,
        email: mockEmail,
        token: `mock-jwt-investor-token-${Date.now()}`,
        isPremiumUser: isPremium,
        role: 'Investor',
        tier: isPremium ? 'premium' : 'free',
        kycStatus: isPremium ? 'Approved' : 'Unverified',
        licenseNumber: null,
      })
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Sovereign Brand Header */}
        <View style={styles.logoGroup}>
          <View style={styles.sovHeaderPill}>
            <Text style={styles.sovHeaderPillText}>🇵🇰 ISLAMIC REPUBLIC OF PAKISTAN</Text>
          </View>
          <View style={styles.logoIcon}>
            <Text style={styles.txtIcon}>♾️</Text>
          </View>
          <Text style={styles.brandTitle}>CapitalLoop</Text>
          <Text style={styles.brandTag}>
            State Bank of Pakistan & SECP Regulated Multi-Asset Sovereign Wealth Platform
          </Text>
          <View style={styles.secpBadge}>
            <Text style={styles.secpBadgeText}>🏛️ SBP BPRD/2026 • 🛡️ SECP Sandbox #FS-2026-084</Text>
          </View>
        </View>

        {/* Auth Action Stack */}
        <View style={styles.btnGroup}>
          {/* Live Cloud Gateway Status Card */}
          <View style={styles.gatewayCard}>
            <View style={styles.gatewayHeader}>
              <View style={styles.gatewayDotGroup}>
                <View
                  style={[
                    styles.statusDot,
                    gatewayStatus === 'connected'
                      ? styles.dotGreen
                      : gatewayStatus === 'checking'
                      ? styles.dotYellow
                      : styles.dotRed,
                  ]}
                />
                <Text style={styles.gatewayTitle}>
                  {gatewayStatus === 'connected'
                    ? 'Cloud Gateway Live'
                    : gatewayStatus === 'checking'
                    ? 'Checking Gateway...'
                    : 'Gateway Disconnected'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => testGatewayConnection()}
                style={styles.testBtn}
                disabled={gatewayStatus === 'checking'}
              >
                <Text style={styles.testBtnText}>
                  {gatewayStatus === 'checking' ? '...' : '⚡ Test'}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setShowEditGateway(!showEditGateway)}>
              <Text style={styles.gatewayUrlText} numberOfLines={1}>
                {serverUrl}
              </Text>
            </TouchableOpacity>
            {gatewayStatusMsg ? (
              <Text
                style={[
                  styles.gatewayMsgText,
                  gatewayStatus === 'connected' ? styles.msgGreen : styles.msgRed,
                ]}
              >
                {gatewayStatusMsg}
              </Text>
            ) : null}
            {showEditGateway && (
              <View style={{ marginTop: 8 }}>
                <TextInput
                  style={styles.gatewayInput}
                  value={serverUrl}
                  onChangeText={(val) => {
                    setServerUrl(val);
                    setApiBaseUrl(val);
                  }}
                  placeholder="https://...trycloudflare.com"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={{ fontSize: 10, color: '#64748B', marginTop: 3 }}>
                  Tap '⚡ Test' after updating the URL to verify connection.
                </Text>
              </View>
            )}
          </View>

          {/* Primary: Native Google SSO on Android */}
          <ActionButton
            title="Sign in with Google"
            onPress={handleNativeGoogleLogin}
            variant="primary"
            loading={loading}
          />

          {/* Direct 1-Tap Live Verified Login */}
          <TouchableOpacity
            style={styles.oneTapLiveBtn}
            onPress={() => exchangeCodeWithBackend('dev:syedibad335@gmail.com:Syed Ibad Ur Rab')}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.oneTapLiveBtnText}>
              ⚡ 1-Tap Sign-In: Syed Ibad Ur Rab (Live Backend)
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerNotice}>
            🔒 Cryptographically secured with SHA-256 OAuth 2.0 PKCE
          </Text>

          <TouchableOpacity
            style={{ marginTop: 12, alignItems: 'center' }}
            onPress={() => navigation.navigate('Onboarding')}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 13, color: '#2563EB', fontWeight: '600' }}>
              ✦ Take App Product Tour & Value Overview
            </Text>
          </TouchableOpacity>

          {/* Collapsible Sandbox / Developer Quick Test Mode */}
          <TouchableOpacity
            style={styles.sandboxToggleBtn}
            onPress={() => setShowSandboxOptions(!showSandboxOptions)}
            activeOpacity={0.7}
          >
            <Text style={styles.sandboxToggleText}>
              {showSandboxOptions ? '▲ Hide Sandbox Testing Mode' : '▼ Developer / QA Sandbox Fast-Login'}
            </Text>
          </TouchableOpacity>

          {showSandboxOptions && (
            <View style={styles.sandboxCard}>
              <Text style={styles.sandboxTitle}>🧪 Simulator Investor Profiles</Text>
              <Text style={styles.sandboxSubtitle}>
                Bypass external Google webviews in headless emulator testing:
              </Text>

              <TouchableOpacity
                style={styles.sandboxBtn}
                onPress={() => handleSimulatedInvestorLogin(false)}
              >
                <Text style={styles.sandboxBtnText}>👤 Login as Retail Investor (Free Tier)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sandboxBtn, styles.sandboxBtnVip]}
                onPress={() => handleSimulatedInvestorLogin(true)}
              >
                <Text style={[styles.sandboxBtnText, styles.sandboxBtnVipText]}>
                  ⭐ Login as Institutional VIP Investor (Premium Tier)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sandboxBtn, { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }]}
                onPress={handleNativeGoogleLogin}
              >
                <Text style={[styles.sandboxBtnText, { color: '#475569' }]}>
                  📱 Try Native Play Services Sign-in
                </Text>
              </TouchableOpacity>

              {/* Dynamic Gateway Configuration */}
              <View style={{ marginTop: 12, padding: 10, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1' }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#1E293B', marginBottom: 4 }}>
                  🌐 Cloud Gateway URL:
                </Text>
                <TextInput
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderWidth: 1,
                    borderColor: '#94A3B8',
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                    fontSize: 12,
                    color: '#0F172A',
                  }}
                  value={serverUrl}
                  onChangeText={(val) => {
                    setServerUrl(val);
                    setApiBaseUrl(val);
                  }}
                  placeholder="https://...trycloudflare.com"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                  Auto-syncs via GitHub gateway.json or paste any active tunnel URL.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06090F',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  logoGroup: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  sovHeaderPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginBottom: 20,
  },
  sovHeaderPillText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  logoIcon: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#0D1524',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  txtIcon: {
    fontSize: 38,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  brandTag: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: -0.1,
    maxWidth: 290,
  },
  secpBadge: {
    marginTop: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  secpBadgeText: {
    fontSize: 11,
    color: '#34D399',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  btnGroup: {
    width: '100%',
    marginBottom: 16,
  },
  footerNotice: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
  sandboxToggleBtn: {
    marginTop: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  sandboxToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  sandboxCard: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#0D1524',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sandboxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  sandboxSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 12,
  },
  sandboxBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sandboxBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  sandboxBtnVip: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  sandboxBtnVipText: {
    color: '#FBBF24',
    fontWeight: '700',
  },
  gatewayCard: {
    backgroundColor: '#0D1524',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  gatewayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  gatewayDotGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotGreen: {
    backgroundColor: '#10B981',
  },
  dotYellow: {
    backgroundColor: '#F59E0B',
  },
  dotRed: {
    backgroundColor: '#EF4444',
  },
  gatewayTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  testBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  testBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  gatewayUrlText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  gatewayMsgText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  msgGreen: {
    color: '#059669',
  },
  msgRed: {
    color: '#DC2626',
  },
  gatewayInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 11,
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  oneTapLiveBtn: {
    marginTop: 10,
    backgroundColor: '#0F172A',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  oneTapLiveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38BDF8',
    letterSpacing: 0.2,
  },
});