// D:\CapitalLoop\CapitalLoop\src\core\services\auth.service.ts
import { apiClient } from './api.client';
import { AuthResultDto } from '../types/auth.types';

export class AuthService {
  /**
   * 🔐 AUTHENTICATE GOOGLE OAUTH JWT
   * Maps directly to backend MediatR: AuthenticateGoogleUserCommand [CL-101]
   */
  public static async authenticateGoogleUserAsync(idToken: string): Promise<AuthResultDto> {
    // Fixed endpoint mapping from '/api/auth/google-login' to '/api/auth/google-sso'
    const response = await apiClient.post<AuthResultDto>('/api/auth/google-sso', { idToken });
    return response.data;
  }

  /**
   * 🚀 INITIALIZE RETAIL PROFILE ONBOARDING
   * Maps directly to backend MediatR: InitializeOnboardingCommand
   */
  public static async initializeOnboardingAsync(displayName: string): Promise<string> {
    // Fixed endpoint mapping from '/api/auth/onboarding/init' to '/api/auth/onboarding/initialize'
    // Adjusted return capture contract type to expect a backend Guid string
    const response = await apiClient.post<string>('/api/auth/onboarding/initialize', { displayName });
    return response.data;
  }
}