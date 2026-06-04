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
      // Hooked up directly via environment matrix variable injection
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
      
      // 2. 🔥 FORCE ACCOUNT SELECTION POP-UP
      // Clears the on-device token cache tracking so the Android OS
      // does not silently pass your last used profile without asking.
      try {
        await GoogleSignin.signOut();
      } catch (signOutErr) {
        // Safe catch-all block: ignores failures if no prior active profile exists
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
        // 🔥 SECURE BACKEND HANDSHAKE (.NET)
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
        // 🔥 REDUX SESSION DISPATCH (UPDATED STRUCTURE)
        // ==========================================
        dispatch(setGoogleAuth({
          name: userData.name || 'External User',
          email: userData.email || '',
          token: userData.accessToken,               // App-issued system JWT
          isPremiumUser: userData.isPremium ?? false // 🚀 MAPS NATIVE DB STATUS DIRECTLY
        }));

        console.log("✅ APPLICATION SESSION INITIALIZED WITH TIERS");
      }
    } catch (err: any) {
      console.error("[AUTH INTENT CRASH]", err);
      
      // Route exceptions safely to isolate configuration discrepancies
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
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <View style={styles.logoGroup}>
        <View style={styles.logoIcon}>
          <Text style={styles.txtIcon}>♾️</Text>
        </View>

        <Text style={styles.brandTitle}>CapitalLoop</Text>
        <Text style={styles.brandTag}>
          Cross-Border Wealth Integration Protocol
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
          🔒 Tier-1 Federated Identity Assertion Gated Module
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 24,
    justifyContent: 'space-between'
  },
  logoGroup: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20
  },
  txtIcon: { fontSize: 36 },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  brandTag: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center'
  },
  btnGroup: {
    width: '100%',
    marginBottom: 12
  },
  footerNotice: {
    color: '#475569',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 14
  }
});