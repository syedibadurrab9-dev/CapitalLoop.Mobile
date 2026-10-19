import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, StatusBar, Alert, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { GoogleSignin, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { setGoogleAuth } from '../store/portfolioSlice';
import { ActionButton } from '../components/ActionButton';

// Ensure redirect handling works across native web view and standalone browsers
WebBrowser.maybeCompleteAuthSession();

const resolveBackendUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5156';
  if (Platform.OS === 'android' && envUrl.includes('localhost')) {
    return envUrl.replace('localhost', '192.168.18.10');
  }
  return envUrl;
};
const BACKEND_API_BASE_URL = resolveBackendUrl();
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';

const googleDiscovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export default function AuthScreen({ navigation }: NativeStackScreenProps<any>): React.JSX.Element {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showSandboxOptions, setShowSandboxOptions] = useState(false);

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
  // ⚙️ INITIALIZE NATIVE GOOGLE ENGINE (OPTIONAL HARDWARE ACCELERATION)
  // =========================================================================
  useEffect(() => {
    try {
      GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID,
        offlineAccess: true,
      });
    } catch (e) {
      console.log('ℹ️ Native GoogleSignin not configured or headless environment.');
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
    try {
      setLoading(true);

      const res = await fetch(`${BACKEND_API_BASE_URL}/api/Auth/google-sso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          token: authCode,
          codeVerifier: codeVerifier || null,
          redirectUri,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || `Authentication failed with status ${res.status}`);
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
      console.error('[PKCE EXCHANGE ERROR]', err);
      Alert.alert(
        'Identity Verification Failed',
        err?.message || 'Failed to exchange cryptographic authorization code with core server.'
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
   * Native Device Fallback: GoogleSignin with Play Services
   */
  const handleNativeGoogleLogin = async (): Promise<void> => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      try {
        await GoogleSignin.signOut();
      } catch {
        // Ignored
      }
      const res = await GoogleSignin.signIn();
      if (isSuccessResponse(res)) {
        const idToken = res.data.idToken;
        if (!idToken) throw new Error('ID Token not found in native response.');
        await exchangeCodeWithBackend(idToken);
      }
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled sign-in.');
      } else {
        Alert.alert('Native Sign-in Failed', err?.message || 'Native identity flow failed.');
      }
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
        {/* Brand Header */}
        <View style={styles.logoGroup}>
          <View style={styles.logoIcon}>
            <Text style={styles.txtIcon}>♾️</Text>
          </View>
          <Text style={styles.brandTitle}>CapitalLoop</Text>
          <Text style={styles.brandTag}>
            Pakistan's Premier Multi-Asset Wealth Sovereign Ledger
          </Text>
          <View style={styles.secpBadge}>
            <Text style={styles.secpBadgeText}>🛡️ SECP FinTech Sandbox Regulated</Text>
          </View>
        </View>

        {/* Auth Action Stack */}
        <View style={styles.btnGroup}>
          {/* Primary: Native Google SSO on Android, PKCE on Web */}
          <ActionButton
            title="Sign in with Google"
            onPress={Platform.OS === 'android' ? handleNativeGoogleLogin : handleGooglePkceLogin}
            variant="primary"
            loading={loading}
          />

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
    backgroundColor: '#F1F5F9',
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
  logoIcon: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  txtIcon: {
    fontSize: 38,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandTag: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: -0.1,
    maxWidth: 280,
  },
  secpBadge: {
    marginTop: 14,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  secpBadgeText: {
    fontSize: 11,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  btnGroup: {
    width: '100%',
    marginBottom: 16,
  },
  footerNotice: {
    color: '#94A3B8',
    fontSize: 12,
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
    color: '#64748B',
  },
  sandboxCard: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sandboxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  sandboxSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  sandboxBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sandboxBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  sandboxBtnVip: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  sandboxBtnVipText: {
    color: '#92400E',
  },
});