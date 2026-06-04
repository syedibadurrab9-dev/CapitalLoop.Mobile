import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, StatusBar, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { GoogleSignin, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { setGoogleAuth } from '../store/portfolioSlice';
import { ActionButton } from '../components/ActionButton';

const BACKEND_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export default function AuthScreen(): React.JSX.Element {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // ==========================================
  // ⚙️ INITIALIZE NATIVE GOOGLE ENGINE
  // ==========================================
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: true, 
    });
  }, []);

  // ==========================================
  // 🌐 SECURE NATIVE IDENTITY ENGINE TRIGGER
  // ==========================================
  const handleGoogleLogin = async (): Promise<void> => {
    try {
      setLoading(true);

      // 1. Verify native system core services availability
      await GoogleSignin.hasPlayServices();
      
      // 2. FORCE ACCOUNT SELECTION POP-UP
      try {
        await GoogleSignin.signOut();
      } catch (signOutErr) {
        console.log("ℹ️ No active Google session tracking required clearance.");
      }
      
      // 3. Open the true native platform OS modal/sheet
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const idToken = response.data.idToken;

        if (!idToken) {
          throw new Error("Google Identity assertion failed: Cryptographic ID Token missing from native context.");
        }

        console.log("✅ Cryptographic ID Token extracted out of native OS parameters");

        // ==========================================
        // SECURE BACKEND HANDSHAKE (.NET)
        // ==========================================
        const res = await fetch(
          `${BACKEND_API_BASE_URL}/api/Auth/google-sso`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ token: idToken }),
          }
        );

        if (!res.ok) {
          throw new Error(`Backend system authentication failed with status: ${res.status}`);
        }

        const userData = await res.json();

        // ==========================================
        // REDUX SESSION DISPATCH
        // ==========================================
        dispatch(setGoogleAuth({
          name: userData.name || 'External User',
          email: userData.email || '',
          token: userData.accessToken,
          isPremiumUser: userData.isPremium ?? false 
        }));

        console.log("✅ APPLICATION SESSION INITIALIZED WITH TIERS");
      }
    } catch (err: any) {
      console.error("[AUTH INTENT CRASH]", err);
      
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("⚠️ Authentication session was closed or canceled by user context.");
      } else if (err.code === statusCodes.IN_PROGRESS) {
        Alert.alert("Login In Progress", "The verification sheet is already active.");
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Services Missing", "Google Play Services are missing or outdated on this device.");
      } else {
        Alert.alert(
          "Login Failed",
          err?.message || "Federated native identity assertion flow failed."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />

      <View style={styles.logoGroup}>
        <View style={styles.logoIcon}>
          <Text style={styles.txtIcon}>♾️</Text>
        </View>

        <Text style={styles.brandTitle}>CapitalLoop</Text>
        <Text style={styles.brandTag}>
          Track your net worth seamlessly
        </Text>
      </View>

      <View style={styles.btnGroup}>
        <ActionButton
          title="Continue with Google"
          onPress={handleGoogleLogin}
          variant="primary"
          loading={loading}
        />

        <Text style={styles.footerNotice}>
          🔒 Secure login powered by Google SSO
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 24,
    justifyContent: 'space-between'
  },
  logoGroup: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
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
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2
  },
  txtIcon: { 
    fontSize: 38 
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5
  },
  brandTag: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: -0.1
  },
  btnGroup: {
    width: '100%',
    marginBottom: 16
  },
  footerNotice: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500'
  }
});