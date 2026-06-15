import { apiClient } from './api.client';
import { 
  SuitabilitySurveyAnswers, 
  RiskProfileDto, 
  TargetAllocationDeficiencyDto, 
  ForecastProjectionsResponseDto 
} from '../types/advisor.types';

export class AdvisorService {
  /**
   * 📤 EVALUATE USER RISK SUITABILITY PROFILE
   * Path: POST /api/advisor/suitability
   * Maps directly to backend MediatR: EvaluateSuitabilityCommand
   */
  public static async evaluateSuitabilityAsync(answers: SuitabilitySurveyAnswers): Promise<RiskProfileDto> {
    const response = await apiClient.post<RiskProfileDto>('/api/advisor/suitability', answers);
    return response.data;
  }

  /**
   * 🧱 FETCH TARGET ALLOCATION DEFICIENCIES
   * Path: GET /api/advisor/allocation/deficiencies
   * Maps directly to backend MediatR: GetAssetAllocationDeficienciesQuery
   */
  public static async getAllocationDeficienciesAsync(): Promise<TargetAllocationDeficiencyDto[]> {
    const response = await apiClient.get<TargetAllocationDeficiencyDto[]>('/api/advisor/allocation/deficiencies');
    return response.data;
  }

  /**
   * 📊 FETCH AGGREGATE NET WORTH TIMELINE HUD
   * Path: GET /api/advisor/net-worth
   * Maps directly to backend MediatR: GetAdvisorNetWorthSummaryQuery
   */
  public static async getAdvisorNetWorthSummaryAsync(): Promise<{ totalNetWorthPkr: number; compiledAtUtc: string }> {
    const response = await apiClient.get<{ totalNetWorthPkr: number; compiledAtUtc: string }>('/api/advisor/net-worth');
    return response.data;
  }

  /**
   * 📈 GENERATE LONG-TERM COMPOUND WEALTH PROJECTIONS
   * Path: POST /api/advisor/portfolio/projections
   * Maps directly to backend MediatR: GetForecastProjectionsQuery
   */
  public static async getForecastProjectionsAsync(): Promise<ForecastProjectionsResponseDto> {
    const response = await apiClient.post<ForecastProjectionsResponseDto>('/api/advisor/portfolio/projections', {});
    return response.data;
  }
}