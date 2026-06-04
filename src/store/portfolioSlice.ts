import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// --- STRUCTURAL TYPING MATRIX CONTRACTS ---

export interface AssetNode {
  id: string;
  name: string;
  category: 'PSX_Equity' | 'Crypto' | 'Mutual_Fund' | 'FCY_Bank' | 'Precious_Metal' | 'Real_Estate';
  holdingValuePKR: number;
  isAutoSynced: boolean;
  installmentsPaid?: number;
  totalInstallments?: number;
}

export interface RiskAuditResult {
  safetyBreached: boolean;
  overConcentratedSectors: string[];
  advisoryRemarks: string;
}

interface PortfolioState {
  user: {
    name: string;
    email: string;
    token?: string | null;
    isAuthenticated: boolean;
    isPremiumUser: boolean;
    kycStatus: 'Unverified' | 'Pending' | 'Approved';
  };
  assets: AssetNode[];
  riskAudit: RiskAuditResult | null;
  currencyToggle: 'PKR' | 'USD';
  pkrToUsdRate: number;
  goldPricePKR: number;
  silverPricePKR: number;
  isLoading: boolean;       // Global spinner state flag for operations tracking
  error: string | null;      // Direct API exception message interceptor capture
}

// --- ASYNCHRONOUS NETWORK THUNK ENGINE CHANNELS ---

const BACKEND_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

/**
 * Thunk 1: Posts scanned key/secret string tokens over to the .NET proxy synchronization hub.
 * Handshakes with: POST api/Portfolio/sync/binance
 */
export const linkBinanceWallet = createAsyncThunk(
  'portfolio/linkBinanceWallet',
  async (payload: { apiKey: string; secretKey: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { portfolio: PortfolioState };
      const token = state.portfolio.user.token;
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // ✅ FIXED: Injected "/api" path mapping explicitly before the controller segment
      const response = await axios.post(
        `${BACKEND_BASE_URL}/api/Portfolio/sync/binance`,
        { apiKey: payload.apiKey, secretKey: payload.secretKey },
        config
      );

      return response.data; // Returns BinanceSyncResult object containing raw local sub-wallet splits
    } catch (error: any) {
      // Log precise backend pipeline validation crashes during debugging iterations
      console.log("HANDSHAKE EXCEPTION DATA LAYER:", error.response?.data);
      
      return rejectWithValue(
        error.response?.data?.Message || 'Failed to handshake cryptographic validation balances with core server.'
      );
    }
  }
);

/**
 * Thunk 2: Dispatches the dynamic max sector ceiling allocation audit check.
 * Handshakes with: GET api/AiAdvisor/audit-exposure?maxSectorCapPercentage=X
 */
export const fetchRiskAuditSummary = createAsyncThunk(
  'portfolio/fetchRiskAuditSummary',
  async (payload: { maxCap: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { portfolio: PortfolioState };
      const token = state.portfolio.user.token;

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // ✅ FIXED: Injected "/api" path mapping explicitly before the controller segment
      const response = await axios.get(
        `${BACKEND_BASE_URL}/api/AiAdvisor/audit-exposure?maxSectorCapPercentage=${payload.maxCap}`,
        config
      );

      return response.data as RiskAuditResult; // Maps neatly into our verified dynamic response shape
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.Message || 'Advisory assessment calculations were aborted by cloud core gateway.'
      );
    }
  }
);

// --- STATE MANAGEMENT AND MUTATION INTERCEPTORS ---

const initialState: PortfolioState = {
  user: {
    name: 'External User',
    email: '',
    token: null,
    isAuthenticated: false,
    isPremiumUser: false,
    kycStatus: 'Unverified',
  },
  assets: [
    { id: '1', name: 'AKD Brokerage Portfolio', category: 'PSX_Equity', holdingValuePKR: 3500000, isAutoSynced: false },
    { id: '2', name: 'Al Meezan Mutual Funds', category: 'Mutual_Fund', holdingValuePKR: 2500000, isAutoSynced: false },
    { id: '3', name: 'Binance Spot Wallet', category: 'Crypto', holdingValuePKR: 1500000, isAutoSynced: false },
    { id: '4', name: 'Physical Silver Vault (10 Tolas)', category: 'Precious_Metal', holdingValuePKR: 152500, isAutoSynced: false },
    { id: '5', name: 'DHA Lahore Phase 9 File', category: 'Real_Estate', holdingValuePKR: 2000000, isAutoSynced: false, installmentsPaid: 3, totalInstallments: 12 },
  ],
  riskAudit: null,
  currencyToggle: 'PKR',
  pkrToUsdRate: 278.50,
  goldPricePKR: 242000,
  silverPricePKR: 2950,
  isLoading: false,
  error: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setGoogleAuth: (
      state, 
      action: PayloadAction<{ name: string; email: string; token?: string | null; isPremiumUser: boolean }>
    ) => {
      state.user.name = action.payload.name;
      state.user.email = action.payload.email;
      state.user.token = action.payload.token ?? null;
      state.user.isPremiumUser = action.payload.isPremiumUser;
      state.user.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user.token = null;
      state.user.isAuthenticated = false;
      state.user.isPremiumUser = false;
      state.riskAudit = null;
    },
    toggleCurrency: (state) => {
      state.currencyToggle = state.currencyToggle === 'PKR' ? 'USD' : 'PKR';
    },
    upgradeTier: (state) => {
      state.user.isPremiumUser = true;
    },
    submitKycPayload: (state) => {
      state.user.kycStatus = 'Pending';
    },
    addNewAsset: (state, action: PayloadAction<AssetNode>) => {
      state.assets.push(action.payload);
    },
    clearSliceErrors: (state) => {
      state.error = null;
    },
    hydrateLiveBalances: (state, action: PayloadAction<Record<string, number>>) => {
      state.assets = state.assets.map(asset => {
        if (action.payload[asset.name]) {
          return {
            ...asset,
            isAutoSynced: true,
            holdingValuePKR: action.payload[asset.name]
          };
        }
        return asset;
      });
    },
    triggerApiSync: (state) => {
      state.assets = state.assets.map(asset => ({
        ...asset,
        isAutoSynced: true,
        holdingValuePKR: Math.round(asset.holdingValuePKR * (1 + (Math.random() * 0.04 - 0.02)))
      }));
    }
  },
  extraReducers: (builder) => {
    builder
      // --- LINK BINANCE ASYNC RUNTIME STATES ---
      .addCase(linkBinanceWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(linkBinanceWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        
        const { spotBalancePkr, earnBalancePkr, futuresBalancePkr } = action.payload;

        state.assets = state.assets.filter(a => !a.name.startsWith("Binance"));

        if (spotBalancePkr > 0) {
          state.assets.push({ id: `b-spot-${Date.now()}`, name: "Binance Spot Wallet", category: "Crypto", holdingValuePKR: Math.round(spotBalancePkr), isAutoSynced: true });
        }
        if (earnBalancePkr > 0) {
          state.assets.push({ id: `b-earn-${Date.now()}`, name: "Binance Earn Staking", category: "Crypto", holdingValuePKR: Math.round(earnBalancePkr), isAutoSynced: true });
        }
        if (futuresBalancePkr > 0) {
          state.assets.push({ id: `b-fut-${Date.now()}`, name: "Binance Futures Leverage", category: "Crypto", holdingValuePKR: Math.round(futuresBalancePkr), isAutoSynced: true });
        }
      })
      .addCase(linkBinanceWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- FETCH STRATEGIC RISK ADVISOR ASYNC RUNTIME STATES ---
      .addCase(fetchRiskAuditSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRiskAuditSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.riskAudit = action.payload; 
      })
      .addCase(fetchRiskAuditSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { 
  setGoogleAuth, 
  clearAuth, 
  toggleCurrency, 
  upgradeTier, 
  submitKycPayload, 
  addNewAsset, 
  clearSliceErrors,
  hydrateLiveBalances,
  triggerApiSync 
} = portfolioSlice.actions;

export default portfolioSlice.reducer;