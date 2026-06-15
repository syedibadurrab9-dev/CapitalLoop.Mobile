// D:\CapitalLoop\CapitalLoop.Mobile\metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// =============================================================================
// 📡 METRO COMPILER RESOLUTION MODIFICATIONS FOR SIGNALR PACKAGING
// =============================================================================

// ⚡ Force explicit source code file extension resolutions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx', 'js', 'jsx', 'json'];

// 🧱 Safe routing redirection configurations for stream protocol assets
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  // Maps explicit cross-platform fallbacks for stream transport hooks
  'http': require.resolve('axios'),
  'https': require.resolve('axios'),
};

module.exports = config;