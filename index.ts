// D:\CapitalLoop\CapitalLoop\index.ts
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

// 🚀 Modern Expo Router unified entry point handler configured for /src/app
export function App() {
  // @ts-ignore - Require context is evaluated dynamically by the Metro bundler asset engine
  const ctx = require.context('./src/app');
  return ExpoRoot({ context: ctx });
}

registerRootComponent(App);