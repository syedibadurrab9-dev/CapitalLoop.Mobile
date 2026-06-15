import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, StatusBar, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../core/store/auth.store';
import { AuthService } from '../../core/services/auth.service';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { SubscriptionTier } from '../../core/constants/subscription-tiers'; // Added tracking reference 

export default function LoginScreen() {
  const router = useRouter();
  const setAuthenticatedSessionAsync = useAuthStore((state) => state.setAuthenticatedSessionAsync);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleIdentityHandshakeAsync = async () => {
    try {
      setErrorMessage(null);
      setIsAuthenticating(true);

      console.log("[IDENTITY LOG] Initializing Native Google Identity Provider client...");

      try {
        await GoogleSignin.signOut();
      } catch {
        // Fail silently if no cache existed
      }

      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken ?? null;
      
      if (!idToken) {
        throw new Error("Google Identity Provider failed to issue a valid ID Token signature.");
      }
      
      console.log("[IDENTITY LOG] Native account selection token captured. Transmitting to Kestrel backend...");
      console.log(`[NETWORK LOG] Sending POST request to Kestrel gateway over Home LAN...`);

      // 1. Fire live Axios post call passing the actual selected user identity assertion
      const authResultDto = await AuthService.authenticateGoogleUserAsync(idToken);
      
      console.log(`[NETWORK LOG] 200 OK Response received from MediatR AuthenticateGoogleUserCommandHandler.`);
      
      // 🎯 FIXED: Casing metrics aligned with clean backend serialization keys
      console.log(`[IDENTITY CLAIMS] Authenticated User: ${authResultDto.identityEmail} | Tier: ${authResultDto.currentAssignedTier}`);

      // 2. Commit real backend token payload into Zustand engine state maps
      // 🎯 FIXED: Properties parsed perfectly match the application data mapping grid contracts
      const accessGranted = await setAuthenticatedSessionAsync(
        authResultDto.accessToken,
        authResultDto.accessToken, // Pass access token fallback if no explicit refresh token column is added yet
        {
          email: authResultDto.identityEmail,
          displayName: authResultDto.displayMoniker,
          subscriptionTier: authResultDto.currentAssignedTier as SubscriptionTier, // Strongly cast down to structural string tokens
          isKycVerified: authResultDto.isProfileKycVerified
        }
      );

      // 3. Evaluate strict Attribute-Based Access Control (ABAC) routing parameters
      if (!accessGranted) {
        setErrorMessage("Access Denied: Enterprise and administrative accounts must manage operations via the Angular Portal.");
        return;
      }

      // 4. Trigger profile synchronization initialization sequence
      console.log(`[NETWORK LOG] Initializing profile via MediatR InitializeOnboardingCommandHandler...`);
      await AuthService.initializeOnboardingAsync(authResultDto.displayMoniker);

      console.log("[AUTH SUCCESS] Retail session authenticated cleanly. Routing inside dashboard.");
      router.replace('/tabs/dashboard');

    } catch (error: any) {
      console.error("[OAUTH EXCHANGER CRASH]", error);
      
      if (error?.code === 'SIGN_IN_CANCELLED') {
        setErrorMessage("Authentication cancelled by user.");
      } else if (error.message && error.message.includes("Network Error")) {
        setErrorMessage(`Cannot connect to local server backend. Verify your Kestrel instance is running at your Home LAN endpoint.`);
      } else {
        setErrorMessage(error?.response?.data?.message || error?.message || "Federated identity provider authorization handshake failed.");
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <SafeAreaView style={styles.masterContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0c111d" />
      <View style={styles.glowingBackgroundRadial} />

      <View style={styles.brandingFlexCenter}>
        <View style={styles.infinityLogoBoxContainer}>
          <Text style={styles.infinitySymbolIcon}>∞</Text>
        </View>
        <View style={styles.textCenterBlock}>
          <Text style={styles.brandTitleHeader}>
            Capital<Text style={styles.brandHighlightSpan}>Loop</Text>
          </Text>
          <Text style={styles.brandSubHeaderToken}>Decoupled Wealth Ledger</Text>
        </View>
      </View>

      <View style={styles.interactiveActionContainer}>
        {errorMessage && (
          <View style={styles.errorBannerContainer}>
            <Text style={styles.errorTextLabel}>{errorMessage}</Text>
          </View>
        )}

        <TouchableOpacity 
          onPress={handleGoogleIdentityHandshakeAsync}
          activeOpacity={0.85}
          disabled={isAuthenticating}
          style={[styles.nativeGoogleSsoButton, isAuthenticating && styles.buttonDisabledState]}
        >
          {isAuthenticating ? (
            <ActivityIndicator size="small" color="#0c111d" />
          ) : (
            <View style={styles.innerButtonFlexLayout}>
              <Text style={styles.googleBrandGlyphSymbol}>G</Text>
              <Text style={styles.googleButtonTextLabel}>Sign in with Google</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.securityTelemetryFooterBadge}>
          <Text style={styles.securityBadgeTextLabel}>🔒 Google OAuth PKCE Security Gated</Text>
          <Text style={styles.versionBuildLabel}>v{process.env.EXPO_PUBLIC_VERSION_TAG ?? '1.0.0'}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Keep your styles exactly the same...
const styles = StyleSheet.create({
  masterContainer: { flex: 1, backgroundColor: '#0c111d', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24 },
  glowingBackgroundRadial: { position: 'absolute', top: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(16, 185, 129, 0.06)' },
  brandingFlexCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  infinityLogoBoxContainer: { width: 72, height: 72, borderRadius: 24, backgroundColor: '#10172a', borderWidth: 1, borderColor: '#1e293b', alignItems: 'center', justifyContent: 'center', shadowColor: '#10b981', shadowOpacity: 0.15, shadowRadius: 20, elevation: 8, marginBottom: 24 },
  infinitySymbolIcon: { fontSize: 32, fontWeight: '900', color: '#10b981', lineHeight: 36, textAlign: 'center' },
  textCenterBlock: { alignItems: 'center' },
  brandTitleHeader: { fontSize: 30, fontWeight: '900', color: '#ffffff', letterSpacing: -0.75 },
  brandHighlightSpan: { color: '#10b981' },
  brandSubHeaderToken: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginTop: 6 },
  interactiveActionContainer: { width: '100%', paddingBottom: 40 },
  errorBannerContainer: { width: '100%', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', padding: 14, borderRadius: 16, marginBottom: 16 },
  errorTextLabel: { fontSize: 11, fontWeight: '600', color: '#f87171', textAlign: 'center', lineHeight: 16 },
  nativeGoogleSsoButton: { width: '100%', backgroundColor: '#ffffff', paddingVertical: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 4, marginBottom: 20 },
  buttonDisabledState: { opacity: 0.6 },
  innerButtonFlexLayout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  googleBrandGlyphSymbol: { fontSize: 16, fontWeight: '900', color: '#0c111d', marginRight: 10 },
  googleButtonTextLabel: { fontSize: 13, fontWeight: '800', color: '#0c111d' },
  securityTelemetryFooterBadge: { alignItems: 'center', justifyContent: 'center' },
  securityBadgeTextLabel: { fontSize: 9, fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 },
  versionBuildLabel: { fontSize: 9, fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }), fontWeight: '600', color: '#334155', marginTop: 4 },
});