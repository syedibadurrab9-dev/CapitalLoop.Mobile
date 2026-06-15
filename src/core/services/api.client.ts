import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { Platform } from 'react-native';
import { StorageService } from './storage.service';
import { isMobileAccessPermitted } from '../constants/subscription-tiers';
import { AuthResultDto } from '../types/auth.types';

// Extend Axios request properties cleanly to support token retry states under strict mode
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// =============================================================================
// 🔄 DYNAMIC NETWORK ROUTING ENGINE (OPTIMIZED FOR HOME LAN ONLY)
// =============================================================================
const resolveBaseUrl = (): string => {
  const networkSwitch = process.env.EXPO_PUBLIC_ACTIVE_NETWORK_SWITCH;
  const homeUrl = process.env.EXPO_PUBLIC_HOME_API_URL;

  const defaultEmulatorLoopback = Platform.OS === 'android' ? 'http://10.0.2.2:5156' : 'http://localhost:5156';

  if (networkSwitch === '1' && homeUrl) {
    return homeUrl;
  }

  console.warn(
    `[CONFIG] Active network switch ('${networkSwitch}') mismatched or home URL missing. Falling back to default emulator loopback: ${defaultEmulatorLoopback}`
  );
  return defaultEmulatorLoopback;
};

const BASE_URL = resolveBaseUrl();

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // ⏱️ Increased to 15s to prevent Axios from timing out while backend verifies external Google signatures
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Channel': 'React-Native-Mobile',
    'X-Device-Platform': Platform.OS,
  },
});

// =============================================================================
// 🎛️ OUTGOING REQUEST INTERCEPTOR: TELEMETRY & AUTHORIZATION
// =============================================================================
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await StorageService.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.headers) {
      config.headers['X-Client-Timezone-Offset'] = new Date().getTimezoneOffset().toString();
      config.headers['X-App-Version'] = process.env.EXPO_PUBLIC_VERSION_TAG || '1.0.0-unknown';
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// =============================================================================
// 🎛️ INCOMING RESPONSE INTERCEPTOR: SECURITY PLUMBING & GATEWAYS
// =============================================================================
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 🚨 401 UNAUTHORIZED: Token Expiry / Re-Auth Flow
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await StorageService.getRefreshToken();
        
        // Explicitly mapped against your core backend identity controller path structure
        const refreshResponse = await axios.post<AuthResultDto>(
          `${BASE_URL}/api/auth/token-refresh`, 
          { refreshToken }
        );
        
        if (refreshResponse.status === 200 && refreshResponse.data) {
          const { accessToken, refreshToken: newRefreshToken, userClaims } = refreshResponse.data;
          
          // Persist the refreshed token array back into our encrypted keychain
          await StorageService.saveAuthSession(accessToken, newRefreshToken, userClaims);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        await StorageService.purgeAuthSession();
        return Promise.reject(refreshError);
      }
    }

    // 🚨 403 FORBIDDEN: Subscription Gate Intercept / Channel Isolation Guard
    if (error.response?.status === 403) {
      const claims = await StorageService.getUserClaims();
      
      if (claims && !isMobileAccessPermitted(claims.subscriptionTier)) {
        // Enforce ABAC Rule: Evict corporate accounts from the mobile environment instantly
        await StorageService.purgeAuthSession();
        console.error(`[ABAC LOCK] Access denied on mobile vector for corporate tier: ${claims.subscriptionTier}`);
      } else {
        console.warn("[MIDDLEWARE GATING] Premium features tier upgrade required.");
      }
    }

    return Promise.reject(error);
  }
);