import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  '451325656019-drjb9j6j2g8hcq99697c3dv2m4nhdbu0.apps.googleusercontent.com';

export default function App() {
  useEffect(() => {
    try {
      GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID,
        offlineAccess: false,
      });
      console.log('✅ GoogleSignin configured at App root');
    } catch (err) {
      console.log('ℹ️ Root GoogleSignin configure deferred:', err);
    }
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
}
