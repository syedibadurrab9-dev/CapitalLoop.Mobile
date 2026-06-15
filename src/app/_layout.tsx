import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/core/store/auth.store';
//import { useAuthStore } from '../src/core/store/auth.store'; // Aligned to your src folder structure
import { GoogleSignin } from '@react-native-google-signin/google-signin'; // 🚀 Import native SDK

// =============================================================================
// ⚙️ INITIALIZE GOOGLE SSO GLOBAL CONFIGURATION
// =============================================================================
GoogleSignin.configure({
  webClientId: '511627953374-9cv6hkgusktu30rhianqoduq1easgs9l.apps.googleusercontent.com', // Server client mapping
  iosClientId: '13131396392-40lscdfkt1896c3s52p7hbvs9gtg6vah.apps.googleusercontent.com', // Native iOS client mapping
  offlineAccess: true,
  
  // 🎯 THE CORE FIX: Leaving this empty forces the underlying Android/iOS account picker 
  // dialog sheet to open instead of auto-logging into the last used cache target.
  accountName: '', 
});

export default function RootLayout() {
  const { isAuthenticated, isHydrated, channelAccessDenied, hydrateSessionAsync } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // 1. Kick-off asynchronous boot-level secure hydration cycle
  useEffect(() => {
    hydrateSessionAsync();
  }, [hydrateSessionAsync]);

  // 2. Multi-Channel Navigation Guard Execution Gate
  useEffect(() => {
    if (!isHydrated) return;

    // Securely check global path elements inside the active route segment array
    const isInAuthGroup = segments.includes('auth');
    const isLoginPage = segments.includes('login');
    const isRestrictedPage = segments.includes('channel-restriction-screen');

    // 🚨 ABAC Rule Check: Force display of corporate channel restriction screen instantly
    if (!!channelAccessDenied) {
      if (!isRestrictedPage) {
        router.replace('/auth/channel-restriction-screen');
      }
      return;
    }

    if (!isAuthenticated) {
      // If unauthenticated, bounce back to Google SSO gateway login paths
      if (!isLoginPage && !isRestrictedPage) {
        router.replace('/auth/login');
      }
    } else {
      // If logged in cleanly, route past authorization gates straight into consumer dashboard layouts
      if (isInAuthGroup || isRestrictedPage || !segments.length) {
        router.replace('/tabs/dashboard');
      }
    }
  }, [isAuthenticated, isHydrated, channelAccessDenied, segments, router]);

  // 3. Absolute Startup Loader Spinning Frame
  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0c111d' }}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return <Slot />;
}