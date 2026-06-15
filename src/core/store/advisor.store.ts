import { create } from 'zustand';
import { SuitabilitySurveyAnswers, RiskProfileDto, TargetAllocationDeficiencyDto, ForecastProjectionsResponseDto } from '../types/advisor.types';
import { AdvisorService } from '../services/advisor.service';

interface AdvisorState {
  riskProfile: RiskProfileDto | null;
  deficiencies: TargetAllocationDeficiencyDto[];
  projections: ForecastProjectionsResponseDto | null;
  isLoading: boolean;
  error: string | null;

  // 🎛️ Action Core Matrix
  submitSuitabilitySurveyAsync: (answers: SuitabilitySurveyAnswers) => Promise<boolean>;
  fetchTargetAllocationMetricsAsync: () => Promise<void>;
  fetchForecastProjectionsAsync: () => Promise<void>;
  clearAdvisorCache: () => void;
}

export const useAdvisorStore = create<AdvisorState>((set, get) => ({
  riskProfile: null,
  deficiencies: [],
  projections: null,
  isLoading: false,
  error: null,

  /**
   * 📤 PROCESS SUITABILITY ASSESSMENTS
   * Commits risk matrices to SQL Server via MediatR: EvaluateSuitabilityCommand
   */
  submitSuitabilitySurveyAsync: async (answers: SuitabilitySurveyAnswers) => {
    try {
      set({ isLoading: true, error: null });
      console.log("[ADVISOR STORE] Dispatching EvaluateSuitabilityCommand payload...");

      const activeProfile = await AdvisorService.evaluateSuitabilityAsync(answers);
      set({ riskProfile: activeProfile });

      console.log("[ADVISOR STORE] Assessment verified. Triggering cascading data rehydration...");
      
      // Cascade-fetch dependent allocation targets and forecasting trajectories concurrently
      await Promise.all([
        get().fetchTargetAllocationMetricsAsync(),
        get().fetchForecastProjectionsAsync()
      ]);

      return true;
    } catch (err: any) {
      console.error("[ADVISOR STORE CRASH] Failed to execute risk evaluation:", err);
      set({ error: err?.message || "Failed to finalize suitability profile analysis." });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 🧱 REHYDRATE TARGET ALLOCATION DEFICIENCIES
   * Target Path: GET api/advisor/allocation/deficiencies
   */
  fetchTargetAllocationMetricsAsync: async () => {
    try {
      set({ isLoading: true, error: null });
      console.log("[ADVISOR STORE] Rehydrating SECP diversification target variances...");

      const metricsData = await AdvisorService.getAllocationDeficienciesAsync();
      set({ deficiencies: metricsData });

      console.log("[ADVISOR STORE] Allocation discrepancies cached cleanly.");
    } catch (err: any) {
      console.error("[ADVISOR STORE CRASH] Allocation sync breakdown:", err);
      set({ error: err?.message || "Failed to pull current variance metrics." });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 📈 FETCH COMPOUND TRAJECTORY COCHART DATA
   * Target Path: POST api/advisor/portfolio/projections
   */
  fetchForecastProjectionsAsync: async () => {
    try {
      set({ isLoading: true, error: null });
      console.log("[ADVISOR STORE] Streaming long-term growth forecast configurations...");

      const projectionsData = await AdvisorService.getForecastProjectionsAsync();
      set({ projections: projectionsData });

      console.log("[ADVISOR STORE] Vector charting coordinates mapped successfully.");
    } catch (err: any) {
      console.error("[ADVISOR STORE CRASH] Trajectory rendering block:", err);
      set({ error: err?.message || "Failed to load forecasting metrics data." });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 🧼 SYSTEM SECURITY MEMORY PURGE
   * Wipes active advisory models from application context on session exit
   */
  clearAdvisorCache: () => {
    set({
      riskProfile: null,
      deficiencies: [],
      projections: null,
      error: null,
      isLoading: false
    });
    console.log("[ADVISOR STORE] Core robo-advisory parameters evicted from active session memory.");
  }
}));