// =============================================================================
// 📊 MODULE 2 & 3: CORE DATA TRANSFER OBJECTS (DTOs)
// =============================================================================

/**
 * 📈 PSX SCRAPER CORE METRIC PAYLOAD
 * Maps directly to backend automated scraping background worker loops
 */
export interface PsxScraperPayload {
  tickerSymbol: string;
  currentMarketPricePkr: number;
  dailyChangePkr: number;
  percentageChange: number;
  tradedVolume: number;
  lastScrapedUtc: string;
}

/**
 * 💰 AGGREGATE PORTFOLIO FINANCIAL HUD SUMMARY
 * Aligns perfectly with MediatR: GetPortfolioSummaryQuery handler output
 */
export interface PortfolioSummaryDto {
  totalNetWorthPkr: number;
  totalNetWorthUsd: number;
  baseCurrency: 'PKR' | 'USD';
  assetCount: number;
  lastCalculatedUtc: string;
}

/**
 * 🧱 ITEMIZED RETAIL ASSET COMPONENT NODE
 * Represents an individual entry structural mapping within dbo.AssetNodes
 */
export interface AssetNodeDto {
  id: string;                 // Database surrogate primary key Guid string
  name: string;               // Custom user designation descriptor label
  category: 'PSX Equity' | 'Precious Metal' | 'Mutual Fund' | 'Crypto' | 'Real Estate';
  valuationPkr: number;       // Computed financial worth calculated dynamically by backend engine
  assetMetrics: {
    tickerSymbol?: string;    // e.g., "SYS", "ENGRO", "HUBC" or crypto tokens like "BTC", "ETH"
    quantityShared?: number;  // Accumulated share/coin volume totals
    weightInTolas?: number;   // Bullion weight mass tracking configuration parameter
    purchasePriceBasis?: number; // Historical acquisition rate basis
  };
  createdUtc: string;
}

// =============================================================================
// 🔄 NEW MODULE 3: EXCHANGE DATA TRANSFER OBJECTS (DTOs)
// =============================================================================

/**
 * 🔐 OUTBOUND EXCHANGE HANDSHAKE CREDENTIALS
 * Passed down to POST /api/integrationssync/binance/link
 */
export interface LinkBinanceWalletDto {
  apiKey: string;
  apiSecret: string;
}

/**
 * 🪙 BINANCE SPOT MARKET BALANCE SEGMENT ITEM
 * Represents a token slice extracted directly from the Binance API payload structure
 */
export interface BinanceTokenBalanceDto {
  assetToken: string;         // e.g., "BTC", "ETH", "USDT"
  freeAmount: number;         // Available liquid exchange balance
  lockedAmount: number;       // Balance locked inside open orders/staking containers
  valuationPkr: number;       // Converted asset worth calculated dynamically via currency indices
}

// =============================================================================
// 🎛️ COMMAND PARAMS: FULL-STACK WRITE TRANSACTION PATTERNS
// =============================================================================

/**
 * 📥 MANUAL LEDGER ENTRY SUBMISSION COMMAND
 * Maps directly to backend MediatR: CreateManualAssetCommand
 */
export interface CreateManualAssetCommand {
  name: string;
  category: AssetNodeDto['category'];
  valuationPkr: number;
  tickerSymbol?: string;
  quantityShared?: number;
  weightInTolas?: number;
  purchasePriceBasis?: number;
}