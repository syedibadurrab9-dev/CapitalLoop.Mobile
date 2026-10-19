import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { getApiBaseUrl } from '../services/gatewayService';

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

export interface SuitabilityProfileResult {
  riskProfile: 'Conservative' | 'Balanced' | 'Growth' | 'Speculative';
  suitabilityScore: number;
  hardCaps: Record<string, number>;
  currentPortfolioCompliant: boolean;
  policyViolations: string[];
  advisoryRemarks: string;
  evaluatedAtUtc: string;
}

export type UserRole = 'Investor' | 'SuperAdmin' | 'ComplianceOfficer' | 'InvestmentAdvisor' | 'RiskAnalyst';
export type UserTier = 'free' | 'premium' | 'agent';

export interface UserState {
  name: string;
  email: string;
  token?: string | null;
  isAuthenticated: boolean;
  isPremiumUser: boolean;
  kycStatus: 'Unverified' | 'Pending' | 'Approved';
  role: UserRole;
  tier: UserTier;
  licenseNumber?: string | null;
  permissions: string[];
}

export const computePermissionsForUser = (role: UserRole, isPremium: boolean): string[] => {
  if (role === 'SuperAdmin') {
    return [
      'ALL_PERMISSIONS',
      'OPERATOR_GOVERNANCE',
      'KYC_AUDIT_EVALUATION',
      'SUBSCRIPTION_OVERRIDE',
      'EMERGENCY_BROKER_INJECTION',
      'SYSTEM_HEALTH_MONITORING'
    ];
  }
  if (role === 'ComplianceOfficer') {
    return [
      'KYC_AUDIT_EVALUATION',
      'NADRA_VERIFICATION_INSPECTION',
      'FBR_ATL_TAX_SYNC',
      'SECP_AUDIT_LOG_QUERY'
    ];
  }
  if (role === 'InvestmentAdvisor') {
    return [
      'SIGNALR_ADVISOR_CHAT',
      'INVESTOR_PORTFOLIO_INSPECTION',
      'SUITABILITY_RECOMMENDATIONS'
    ];
  }
  if (role === 'RiskAnalyst') {
    return [
      'MACRO_STRESS_SANDBOX',
      'DEVALUATION_ANALYSIS',
      'PSX_CONCENTRATION_AUDIT'
    ];
  }
  // Investor (Retail vs Institutional Wealth Premium)
  if (isPremium) {
    return [
      'ASSET_TRACKING_MANUAL',
      'PSX_DATA_SCRAPING',
      'FORECASTING_120M_TAX_DRAG',
      'BINANCE_AUTO_SYNC',
      'AKD_AUTO_SYNC',
      'PRIORITY_ADVISOR_SIGNALR',
      'CONCENTRATION_RISK_AUDIT',
      'SUBMIT_KYC',
      'SUITABILITY_EVALUATION'
    ];
  }
  return [
    'ASSET_TRACKING_MANUAL',
    'PSX_DATA_SCRAPING',
    'BASIC_FORECASTING_36M',
    'SUBMIT_KYC',
    'SUITABILITY_QUESTIONNAIRE'
  ];
};

interface PortfolioState {
  user: UserState;
  hasSeenOnboarding: boolean;
  assets: AssetNode[];
  riskAudit: RiskAuditResult | null;
  suitabilityProfile: SuitabilityProfileResult | null;
  currencyToggle: 'PKR' | 'USD';
  pkrToUsdRate: number;
  goldPricePKR: number;
  silverPricePKR: number;
  isLoading: boolean;       // Global spinner state flag for operations tracking
  error: string | null;      // Direct API exception message interceptor capture
}

// --- ASYNCHRONOUS NETWORK THUNK ENGINE CHANNELS ---

const getBackendBaseUrl = () => getApiBaseUrl();

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
        `${getBackendBaseUrl()}/api/Portfolio/sync/binance`,
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
        `${getBackendBaseUrl()}/api/AiAdvisor/audit-exposure?maxSectorCapPercentage=${payload.maxCap}`,
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

/**
 * Thunk 3: Dispatches SECP & NADRA compliant KYC submission (CNIC/Passport).
 * Handshakes with: POST api/Kyc/submit
 */
export const submitKycVerification = createAsyncThunk(
  'portfolio/submitKycVerification',
  async (
    payload: {
      documentType: 'Smart_CNIC' | 'Passport';
      documentNumber: string;
      dateOfBirth: string; // 'YYYY-MM-DD'
      documentFileBase64?: string;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { portfolio: PortfolioState };
      const token = state.portfolio.user.token;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest',
        },
      };

      const response = await axios.post(
        `${getBackendBaseUrl()}/api/Kyc/submit`,
        {
          documentType: payload.documentType,
          documentNumber: payload.documentNumber,
          dateOfBirth: payload.dateOfBirth,
          documentFileBase64: payload.documentFileBase64,
        },
        config
      );

      return response.data;
    } catch (error: any) {
      console.log('KYC SUBMISSION ERROR:', error.response?.data);
      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.Message ||
        error.response?.data?.title ||
        'Failed to submit KYC verification documentation to compliance portal.';
      return rejectWithValue(errorMsg);
    }
  }
);

/**
 * Thunk 4: Updates real estate installment milestone payments.
 * Handshakes with: PUT api/Portfolio/real-estate/{assetId}/installments
 */
export const updateRealEstateInstallment = createAsyncThunk(
  'portfolio/updateRealEstateInstallment',
  async (
    payload: {
      assetId: string;
      paidInstallments: number;
      totalInstallments: number;
      updatedValuation?: number;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { portfolio: PortfolioState };
      const token = state.portfolio.user.token;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest',
        },
      };

      const response = await axios.put(
        `${getBackendBaseUrl()}/api/Portfolio/real-estate/${payload.assetId}/installments`,
        {
          paidInstallments: payload.paidInstallments,
          totalInstallments: payload.totalInstallments,
          updatedValuation: payload.updatedValuation,
        },
        config
      );

      return response.data;
    } catch (error: any) {
      console.log('REAL ESTATE INSTALLMENT UPDATE ERROR:', error.response?.data);
      const errorMsg =
        error.response?.data?.Message ||
        error.response?.data?.detail ||
        'Failed to update real estate installment telemetry.';
      return rejectWithValue(errorMsg);
    }
  }
);

/**
 * Thunk 5: Evaluates SECP Digital Suitability Profile questionnaire answers and enforces hard caps.
 * Handshakes with: POST api/AiAdvisor/suitability/evaluate
 */
export const evaluateSuitability = createAsyncThunk(
  'portfolio/evaluateSuitability',
  async (payload: { answers: number[] }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { portfolio: PortfolioState };
      const token = state.portfolio.user.token;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest',
        },
      };

      const response = await axios.post(
        `${getBackendBaseUrl()}/api/AiAdvisor/suitability/evaluate`,
        { answers: payload.answers },
        config
      );

      return response.data as SuitabilityProfileResult;
    } catch (error: any) {
      console.log('SUITABILITY EVALUATION ERROR:', error.response?.data);
      const errorMsg =
        error.response?.data?.Message ||
        error.response?.data?.detail ||
        'Failed to evaluate SECP suitability profile.';
      return rejectWithValue(errorMsg);
    }
  }
);

/**
 * Thunk 6: Retrieves registered SECP suitability profile, regulatory hard caps, and compliance state.
 * Handshakes with: GET api/AiAdvisor/suitability/profile
 */
export const fetchSuitabilityProfile = createAsyncThunk(
  'portfolio/fetchSuitabilityProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { portfolio: PortfolioState };
      const token = state.portfolio.user.token;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest',
        },
      };

      const response = await axios.get(
        `${getBackendBaseUrl()}/api/AiAdvisor/suitability/profile`,
        config
      );

      return response.data as SuitabilityProfileResult;
    } catch (error: any) {
      console.log('FETCH SUITABILITY PROFILE ERROR:', error.response?.data);
      const errorMsg =
        error.response?.data?.Message ||
        error.response?.data?.detail ||
        'Failed to retrieve SECP suitability profile.';
      return rejectWithValue(errorMsg);
    }
  }
);

/**
 * Thunk 7: Retrieves the authenticated investor's latest SECP KYC verification status, tier, and role.
 * Handshakes with: GET api/Kyc/status
 */
export const fetchKycStatus = createAsyncThunk(
  'portfolio/fetchKycStatus',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { portfolio: PortfolioState };
      const token = state.portfolio.user.token;
      if (!token) return rejectWithValue('User unauthenticated');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest',
        },
      };

      const response = await axios.get(
        `${getBackendBaseUrl()}/api/Kyc/status`,
        config
      );

      return response.data;
    } catch (error: any) {
      console.log('FETCH KYC STATUS ERROR:', error.response?.data);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.Message ||
        'Failed to sync latest identity verification status.';
      return rejectWithValue(errorMsg);
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
    role: 'Investor',
    tier: 'free',
    licenseNumber: null,
    permissions: computePermissionsForUser('Investor', false),
  },
  assets: [
    { id: '1', name: 'AKD Brokerage Portfolio', category: 'PSX_Equity', holdingValuePKR: 3500000, isAutoSynced: false },
    { id: '2', name: 'Al Meezan Mutual Funds', category: 'Mutual_Fund', holdingValuePKR: 2500000, isAutoSynced: false },
    { id: '3', name: 'Binance Spot Wallet', category: 'Crypto', holdingValuePKR: 1500000, isAutoSynced: false },
    { id: '4', name: 'Physical Silver Vault (10 Tolas)', category: 'Precious_Metal', holdingValuePKR: 152500, isAutoSynced: false },
    { id: '5', name: 'DHA Lahore Phase 9 File', category: 'Real_Estate', holdingValuePKR: 2000000, isAutoSynced: false, installmentsPaid: 3, totalInstallments: 12 },
  ],
  riskAudit: null,
  suitabilityProfile: null,
  hasSeenOnboarding: false,
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
    completeOnboarding: (state) => {
      state.hasSeenOnboarding = true;
    },
    setGoogleAuth: (
      state, 
      action: PayloadAction<{ 
        name: string; 
        email: string; 
        token?: string | null; 
        isPremiumUser?: boolean;
        role?: string;
        tier?: string;
        kycStatus?: 'Unverified' | 'Pending' | 'Approved';
        licenseNumber?: string | null;
      }>
    ) => {
      const isPremium = action.payload.isPremiumUser ?? (action.payload.tier === 'premium' || action.payload.tier === 'agent');
      const assignedRole = (action.payload.role as UserRole) || 'Investor';
      const assignedTier = (action.payload.tier as UserTier) || (isPremium ? 'premium' : 'free');

      state.user.name = action.payload.name;
      state.user.email = action.payload.email;
      state.user.token = action.payload.token ?? null;
      state.user.isPremiumUser = isPremium;
      state.user.role = assignedRole;
      state.user.tier = assignedTier;
      state.user.licenseNumber = action.payload.licenseNumber ?? null;
      state.user.kycStatus = action.payload.kycStatus ?? (action.payload.role === 'SuperAdmin' || action.payload.role === 'ComplianceOfficer' ? 'Approved' : 'Unverified');
      state.user.permissions = computePermissionsForUser(assignedRole, isPremium);
      state.user.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user.token = null;
      state.user.isAuthenticated = false;
      state.user.isPremiumUser = false;
      state.user.role = 'Investor';
      state.user.tier = 'free';
      state.user.licenseNumber = null;
      state.user.permissions = computePermissionsForUser('Investor', false);
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
    },
    updateInstallmentLocal: (
      state,
      action: PayloadAction<{ assetId: string; paidInstallments: number; totalInstallments: number }>
    ) => {
      const asset = state.assets.find(a => a.id === action.payload.assetId);
      if (asset) {
        asset.installmentsPaid = action.payload.paidInstallments;
        asset.totalInstallments = action.payload.totalInstallments;
      }
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
      })

      // --- SUBMIT KYC VERIFICATION ASYNC RUNTIME STATES ---
      .addCase(submitKycVerification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitKycVerification.fulfilled, (state) => {
        state.isLoading = false;
        state.user.kycStatus = 'Pending';
      })
      .addCase(submitKycVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- UPDATE REAL ESTATE INSTALLMENT ASYNC RUNTIME STATES ---
      .addCase(updateRealEstateInstallment.fulfilled, (state, action) => {
        const { assetId, paidInstallments, totalInstallments, currentEquityPKR } = action.payload;
        const target = state.assets.find(a => a.id === assetId || a.id.toString() === assetId?.toString());
        if (target) {
          target.installmentsPaid = paidInstallments;
          target.totalInstallments = totalInstallments;
          target.holdingValuePKR = currentEquityPKR;
        }
      })

      // --- EVALUATE SUITABILITY ASYNC RUNTIME STATES ---
      .addCase(evaluateSuitability.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(evaluateSuitability.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suitabilityProfile = action.payload;
      })
      .addCase(evaluateSuitability.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- FETCH SUITABILITY PROFILE ASYNC RUNTIME STATES ---
      .addCase(fetchSuitabilityProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSuitabilityProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suitabilityProfile = action.payload;
      })
      .addCase(fetchSuitabilityProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- FETCH KYC STATUS ASYNC RUNTIME STATES ---
      .addCase(fetchKycStatus.fulfilled, (state, action) => {
        if (action.payload?.kycStatus) {
          const raw = action.payload.kycStatus;
          const formatted = (raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()) as 'Unverified' | 'Pending' | 'Approved';
          state.user.kycStatus = formatted;
        }
        if (action.payload?.isPremium !== undefined) {
          state.user.isPremiumUser = action.payload.isPremium;
          state.user.tier = action.payload.isPremium ? 'premium' : 'free';
          state.user.permissions = computePermissionsForUser(state.user.role, action.payload.isPremium);
        }
      });
  }
});

export const { 
  completeOnboarding,
  setGoogleAuth, 
  clearAuth, 
  toggleCurrency, 
  upgradeTier, 
  submitKycPayload, 
  addNewAsset, 
  clearSliceErrors,
  hydrateLiveBalances,
  triggerApiSync,
  updateInstallmentLocal
} = portfolioSlice.actions;

export default portfolioSlice.reducer;