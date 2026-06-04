import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Camera } from 'expo-camera';

interface CameraState {
  hasPermission: boolean | null; // null = Undetermined, true = Allowed, false = Denied
  isScannerActive: boolean;
  isFlashOn: boolean;
  error: string | null;
}

const initialState: CameraState = {
  hasPermission: null,
  isScannerActive: false,
  isFlashOn: false,
  error: null,
};

// --- ASYNCHRONOUS PERMISSION HANDSHAKE THUNK ---

/**
 * Checks existing device authorization rules or prompts the native OS dialogue popup.
 */
export const requestCameraPermission = createAsyncThunk(
  'camera/requestPermission',
  async (_, { rejectWithValue }) => {
    try {
      // Requests authorization from the underlying mobile hardware layer
      const status = await Camera.requestCameraPermissionsAsync();
      return status.granted; // Returns a native boolean value
    } catch (err: any) {
      return rejectWithValue(
        err.message || 'An unexpected hardware constraint block occurred.'
      );
    }
  }
);

// --- STATE SLICE ENGINE ---

const cameraSlice = createSlice({
  name: 'camera',
  initialState,
  reducers: {
    setScannerState: (state, action: PayloadAction<boolean>) => {
      state.isScannerActive = action.payload;
    },
    toggleFlash: (state) => {
      state.isFlashOn = !state.isFlashOn;
    },
    resetCameraState: (state) => {
      state.isScannerActive = false;
      state.isFlashOn = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestCameraPermission.pending, (state) => {
        state.error = null;
      })
      .addCase(requestCameraPermission.fulfilled, (state, action: PayloadAction<boolean>) => {
        state.hasPermission = action.payload;
        if (!action.payload) {
          state.error = "Camera access was denied. Please update app settings to scan QR links.";
        }
      })
      .addCase(requestCameraPermission.rejected, (state, action) => {
        state.hasPermission = false;
        state.error = action.payload as string || 'Failed to initialize the hardware interface driver.';
      });
  }
});

export const { setScannerState, toggleFlash, resetCameraState } = cameraSlice.actions;
export default cameraSlice.reducer;