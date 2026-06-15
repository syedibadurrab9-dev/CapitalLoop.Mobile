import { apiClient } from './api.client';
import { PortfolioSummaryDto, AssetNodeDto, CreateManualAssetCommand } from '../types/portfolio.types';

export class PortfolioService {
  /**
   * 📊 GET AGGREGATE SUMMARY HUD DATA
   * Maps directly to MediatR: GetPortfolioSummaryQuery
   */
  public static async getSummaryAsync(): Promise<PortfolioSummaryDto> {
    const response = await apiClient.get<PortfolioSummaryDto>('/api/portfolios/summary');
    return response.data;
  }

  /**
   * 🧱 GET ITEMIZED ASSET BREAKDOWN LIST
   * Maps directly to MediatR: GetAssetListQuery
   */
  public static async getAssetListAsync(): Promise<AssetNodeDto[]> {
    const response = await apiClient.get<AssetNodeDto[]>('/api/portfolios/assets/list');
    return response.data;
  }

  /**
   * 📥 INJECT MANUAL TRANSACTION ELEMENT
   * Maps directly to MediatR: CreateManualAssetCommand
   */
  public static async createManualAssetAsync(command: CreateManualAssetCommand): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean }>('/api/portfolios/assets/create-manual', command);
    return response.data.success;
  }

  // =============================================================================
  // 🔄 NEW MODULE 3: AUTOMATED CEFI EXCHANGE LINKING API METHODS
  // =============================================================================

  /**
   * 🔗 FORWARD EXCHANGE ACCESS CREDENTIALS
   * Maps directly to backend MediatR: LinkBinanceExchangeWalletCommand
   * Guarded by custom backend filter: [SubscriptionRequirementFilter]
   */
  public static async linkBinanceWalletAsync(credentials: { apiKey: string; apiSecret: string }): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean }>('/api/integrationssync/binance/link', credentials);
    return response.data.success;
  }

  /**
   * 🔄 RE-AGGREGATE PORTFOLIO CRYPTO BALANCES
   * Maps directly to backend MediatR: TriggerBinanceBatchSyncCommand
   */
  public static async triggerBinanceBatchSyncAsync(): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean }>('/api/integrationssync/binance/batch-sync', {});
    return response.data.success;
  }
}