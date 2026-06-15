import { create } from 'zustand';
import { PortfolioSummaryDto, AssetNodeDto, CreateManualAssetCommand } from '../types/portfolio.types';
import { PortfolioService } from '../services/portfolio.service';

interface PortfolioState {
  summary: PortfolioSummaryDto | null;
  assets: AssetNodeDto[];
  isLoading: boolean;
  isInitialHydrated: boolean;
  error: string | null;

  // 🎛️ Action Core Matrix
  fetchPortfolioDataAsync: () => Promise<void>;
  appendManualAssetAsync: (command: CreateManualAssetCommand) => Promise<boolean>;
  
  // 🔄 Module 3 Core CeFi Integrations
  linkBinanceWalletAsync: (apiKey: string, apiSecret: string) => Promise<boolean>;
  triggerExchangeBatchSyncAsync: () => Promise<boolean>;
  
  clearPortfolioCache: () => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  summary: null,
  assets: [],
  isLoading: false,
  isInitialHydrated: false,
  error: null,

  /**
   * 🔄 BACKEND LEDGER REHYDRATION LOOP
   * Pulls aggregate values and itemized arrays concurrently over Home LAN
   */
  fetchPortfolioDataAsync: async () => {
    try {
      set({ isLoading: true, error: null });
      
      console.log("[STORE LOG] Syncing multi-asset ledger cache layers...");
      
      const [summaryData, assetListData] = await Promise.all([
        PortfolioService.getSummaryAsync(),
        PortfolioService.getAssetListAsync()
      ]);

      set({ 
        summary: summaryData, 
        assets: assetListData, 
        isInitialHydrated: true 
      });
      
      console.log("[STORE LOG] Portfolio state cached cleanly.");
    } catch (err: any) {
      console.error("[STORE MUTATION CRASH] Failed to pull portfolio boundaries:", err);
      set({ error: err?.message || "Failed to rehydrate active wealth ledger." });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 📥 POST TRANSACTION INJECTION NODE
   * Commits manual entries to SQL Server and recalculates in-memory aggregates
   */
  appendManualAssetAsync: async (command: CreateManualAssetCommand) => {
    try {
      set({ isLoading: true, error: null });
      
      console.log("[STORE ACTION] Dispatching manual asset node creation pipeline...");
      
      const executionSuccess = await PortfolioService.createManualAssetAsync(command);
      
      if (executionSuccess) {
        console.log("[STORE ACTION] Database write verified. Evicting and updating state...");
        await get().fetchPortfolioDataAsync();
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error("[STORE MUTATION CRASH] Asset ledger insertion failure:", err);
      set({ error: err?.message || "Failed to commit manual transaction node." });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 🔗 LINK EXCHANGE SECURE HANDSHAKE
   * Dispatches public and secret keys over the API line to bind exchange state
   */
  linkBinanceWalletAsync: async (apiKey: string, apiSecret: string) => {
    try {
      set({ isLoading: true, error: null });
      console.log("[STORE ACTION] Initiating backend exchange linking handshake...");
      
      const success = await PortfolioService.linkBinanceWalletAsync({ apiKey, apiSecret });
      return success;
    } catch (err: any) {
      console.error("[STORE MUTATION CRASH] Exchange linking phase break:", err);
      // Let the UI view intercept specific 403 Forbidden patterns for up-sell routing
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 🔄 TRIGGER BATCH BALANCE RECONCILIATION
   * Triggers the backend price scraper worker and refreshes the cache layout
   */
  triggerExchangeBatchSyncAsync: async () => {
    try {
      set({ isLoading: true, error: null });
      console.log("[STORE ACTION] Requesting remote background batch balances scraping operation...");
      
      const success = await PortfolioService.triggerBinanceBatchSyncAsync();
      
      if (success) {
        console.log("[STORE ACTION] Batch sync confirmed on backend. Refreshing local aggregates...");
        await get().fetchPortfolioDataAsync();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("[STORE MUTATION CRASH] Automated sync request process failure:", err);
      set({ error: err?.message || "Failed to finalize exchange balance syncing." });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 🧼 SYSTEM SECURITY CLEAR PURGE
   * Wipes active session data on sign out
   */
  clearPortfolioCache: () => {
    set({ 
      summary: null, 
      assets: [], 
      isInitialHydrated: false, 
      error: null 
    });
    console.log("[STORE PURGE] Personal wealth ledger metrics wiped from active context memory.");
  }
}));