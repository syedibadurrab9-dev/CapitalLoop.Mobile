// =============================================================================
// 📊 MODULE 4: ADVISORY SUITE & PROJECTION DATA CONTRACTS
// =============================================================================

/**
 * 📝 RISK ASSESSMENT ANSWERS INTERFACE
 * Form input data matrix submitted by the user on the wizard panel.
 */
export interface SuitabilitySurveyAnswers {
  investmentHorizonYears: number;        // Chosen horizon (e.g., 3, 5, 10, or 20 years)
  riskToleranceScore: 1 | 2 | 3 | 4 | 5; // Objective volatility comfort scale tier
  monthlySipBudgetPkr: number;           // Target monthly system investment commitment amount
  primaryObjective: 'Capital Preservation' | 'Shariah Wealth Growth' | 'Speculative Alpha';
}

/**
 * 👑 CALCULATED SECP COMPLIANCE RISK PROFILE
 * Output profile returning from your underlying backend assessment evaluator algorithm.
 */
export interface RiskProfileDto {
  assignedTier: 'Conservative' | 'Moderate' | 'Growth' | 'Aggressive';
  secpComplianceHash: string;            // Regulatory classification validation verification checksum
  evaluatedOnUtc: string;                // Calculation record timestamp
}

/**
 * 🧱 TARGET ALLOCATION VARIANCE GAP DEFICIENCY
 * Pinpoints current versus target distribution offsets across your core asset categories.
 */
export interface TargetAllocationDeficiencyDto {
  assetCategory: 'PSX Equity' | 'Precious Metal' | 'Crypto' | 'Mutual Fund' | 'Liquid Cash';
  currentPercentage: number;             // Realized current weight mix (0 to 100)
  targetPercentage: number;              // Target model percentage mix dictated by risk tier
  variancePercentage: number;            // Negative drift maps directly to an active deficiency gap
  rebalanceRequiredPkr: number;          // Fiat cash injection value needed to align back to model
}

/**
 * 📐 PLOT COORDINATE GRAPH DATA POINT
 * Defines an individual position unit for tracking vector lines on the forecasting canvas.
 */
export interface ChartDataCoordinates {
  monthIndex: number;                    // Chronological tracking month identifier
  label: string;                         // Scannable timeline chart axis point indicator (e.g., "Year 1")
  projectedValuePkr: number;             // Forecasted balance value compound calculation yield
}

/**
 * 📈 COMPOUND WEALTH GROWTH FORECASTING PAYLOAD
 * Complete payload structure mapping your 36-month and 120-month projection trajectory tracks.
 */
export interface ForecastProjectionsResponseDto {
  baseCurrency: string;                  // e.g., "PKR"
  thirtySixMonthTrend: ChartDataCoordinates[];   // Medium-Term trajectory timeline points array
  oneHundredTwentyMonthTrend: ChartDataCoordinates[]; // Long-Term pool accumulation points array
  compoundAnnualGrowthRateExpected: number;      // Modeled mathematical rate parameter percentage
  calculatedAtUtc: string;              // Compilation lifecycle timestamp
}