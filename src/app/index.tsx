// D:\CapitalLoop\CapitalLoop\src\app\index.tsx
import React from 'react';
import { Redirect } from 'expo-router';

/**
 * 🔀 ROOT INDEX PASSTHROUGH NODE
 * This layout serves exclusively as a bootstrap passenger gate.
 * It immediately intercepts incoming app launch frames and forwards
 * execution straight down to the authorization module container.
 */
export default function RootIndexPassthrough() {
  return <Redirect href="/auth/login" />;
}