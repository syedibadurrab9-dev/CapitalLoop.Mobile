import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Screen Imports
import AuthScreen from '../screens/AuthScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AssetInputScreen from '../screens/AssetInputScreen';
import LiveChartsScreen from '../screens/LiveChartsScreen';
import AiAdvisorScreen from '../screens/AiAdvisorScreen';
import KycScreen from '../screens/KycScreen';
import LiveChatScreen from '../screens/LiveChatScreen';

// 1. Declare explicit type bindings for navigation param mapping
export type RootStackParamList = {
  Auth: undefined;
  Dashboard: undefined;
  AssetInput: undefined;
  LiveCharts: undefined;
  AiAdvisor: undefined;
  KycRoute: undefined;
  LiveChat: undefined;
};

// 2. Instantiate the typed Navigator engine instance
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  // Pull your native authentication state cleanly from your domain slice map
  const isAuthenticated = useSelector((state: RootState) => state.portfolio.user.isAuthenticated);

  return (
    // ✅ FIXED: NavigationContainer wrapper completely removed here to prevent duplicate root collisions
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: '#1E293B' }, 
        headerTintColor: '#FFFFFF', 
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', fontSize: 16 },
        animation: 'slide_from_right' // Gives your flows a smooth native operational feel
      }}
    >
      {!isAuthenticated ? (
        // Unauthenticated Flow
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
          options={{ headerShown: false }} 
        />
      ) : (
        // Authenticated Secured Ledger Stack Nodes
        <>
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={{ title: 'CapitalLoop Ledger' }} 
          />
          <Stack.Screen 
            name="AssetInput" 
            component={AssetInputScreen} 
            options={{ title: 'Sync Hub' }} // Aligned with your dashboard grid button
          />
          <Stack.Screen 
            name="LiveCharts" 
            component={LiveChartsScreen} 
            options={{ title: 'Live Streaming Market Feeds' }} 
          />
          <Stack.Screen 
            name="AiAdvisor" 
            component={AiAdvisorScreen} 
            options={{ title: 'AI Wealth Advisor' }} 
          />
          <Stack.Screen 
            name="KycRoute" 
            component={KycScreen} 
            options={{ title: 'Compliance Verification' }} 
          />
          <Stack.Screen 
            name="LiveChat" 
            component={LiveChatScreen} 
            options={{ title: 'Priority Support Desk' }} 
          />
        </>
      )}
    </Stack.Navigator>
  );
}