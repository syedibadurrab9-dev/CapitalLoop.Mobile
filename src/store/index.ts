import { configureStore } from '@reduxjs/toolkit';
import portfolioReducer from './portfolioSlice';
import cameraReducer from './cameraSlice'; // ✅ Hooking up the hardware slice configuration

export const store = configureStore({
  reducer: {
    // Manages user session states, asset sync collections, and AI audit matrices
    portfolio: portfolioReducer,
    
    // ✅ Tracks hardware privacy tokens, device permissions, and active scanner flags
    camera: cameraReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disables strict serialization checks for optimized performance 
      // when streaming large real-time websocket/SignalR data payloads
      serializableCheck: false,
    }),
});

// Structural type exports for strict compile-time UI state validation
// ✅ Automatically handles both 'portfolio' and 'camera' types globally now
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;