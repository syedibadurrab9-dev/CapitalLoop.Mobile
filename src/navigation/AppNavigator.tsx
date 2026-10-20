import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// 🚀 Expo status bar layer integrated cleanly
import { StatusBar } from 'expo-status-bar';

// Screen Imports
import OnboardingScreen from '../screens/OnboardingScreen';
import AuthScreen from '../screens/AuthScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AssetInputScreen from '../screens/AssetInputScreen';
import LiveChartsScreen from '../screens/LiveChartsScreen';
import AiAdvisorScreen from '../screens/AiAdvisorScreen';
import KycScreen from '../screens/KycScreen';
import LiveChatScreen from '../screens/LiveChatScreen';
import InvestorProfileScreen from '../screens/InvestorProfileScreen';

// Declare explicit type bindings for navigation param mapping
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Dashboard: undefined;
  AssetInput: undefined;
  LiveCharts: undefined;
  AiAdvisor: undefined;
  KycRoute: undefined;
  LiveChat: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const isAuthenticated = useSelector((state: RootState) => state.portfolio.user.isAuthenticated);
  const hasSeenOnboarding = useSelector((state: RootState) => state.portfolio.hasSeenOnboarding);

  return (
    <>
      {/* Dynamic light theme system bar tracking layer */}
      <StatusBar style="light" animated={true} />

      <Stack.Navigator 
        initialRouteName={!hasSeenOnboarding ? 'Onboarding' : 'Auth'}
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right'
        }}
      >
        {!isAuthenticated ? (
          // Unauthenticated Flow
          <>
            <Stack.Screen 
              name="Onboarding" 
              component={OnboardingScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Auth" 
              component={AuthScreen} 
              options={{ headerShown: false }} 
            />
          </>
        ) : (
          // Authenticated Secured Institutional Stack Nodes
          <>
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen} 
              options={{ title: 'CapitalLoop' }} 
            />
            <Stack.Screen 
              name="LiveCharts" 
              component={LiveChartsScreen} 
              options={{ title: 'Market Analytics' }} 
            />
            <Stack.Screen 
              name="AssetInput" 
              component={AssetInputScreen} 
              options={{ title: 'Manage Assets' }} 
            />
            <Stack.Screen 
              name="LiveChat" 
              component={LiveChatScreen} 
              options={{ title: 'Help & Support' }} 
            />
            <Stack.Screen 
              name="Profile" 
              component={InvestorProfileScreen} 
              options={{ title: 'Investor Profile' }} 
            />
            <Stack.Screen 
              name="AiAdvisor" 
              component={AiAdvisorScreen} 
              options={{ title: 'AI Insights' }} 
            />
            <Stack.Screen 
              name="KycRoute" 
              component={KycScreen} 
              options={{ title: 'Verify Identity' }} 
            />
          </>
        )}
      </Stack.Navigator>
    </>
  );
}
