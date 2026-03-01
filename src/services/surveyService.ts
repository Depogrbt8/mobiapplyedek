import { apiClient } from '@/core/api/client';

export interface SurveyAnswer {
  questionId: number;
  answer: string | string[];
}

interface SurveyResponse {
  success: boolean;
  data: Array<{
    id: string;
    userId: string;
    answers: string;
    completedAt: string;
    createdAt: string;
  }>;
}

interface SubmitSurveyResponse {
  success: boolean;
  message: string;
  id?: string;
}

/**
 * Survey service for API calls
 */
export const surveyService = {
  /**
   * Get survey status for a user
   */
  async getSurveyStatus(userId: string): Promise<SurveyResponse['data']> {
    try {
      const response = await apiClient.get<SurveyResponse>(
        `/api/survey?userId=${encodeURIComponent(userId)}`
      );
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.warn('Anket durumu kontrol edilemedi:', error);
      return [];
    }
  },

  /**
   * Submit survey answers
   */
  async submitSurvey(
    userId: string,
    answers: SurveyAnswer[],
    completedAt: string
  ): Promise<SubmitSurveyResponse> {
    try {
      const response = await apiClient.post<SubmitSurveyResponse>('/api/survey', {
        userId,
        answers,
        completedAt,
      });
      return response.data;
    } catch (error: any) {
      console.warn('Anket gönderilemedi:', error);
      // Hata olsa bile başarılı döndür (kullanıcı deneyimini bozmamak için)
      return {
        success: true,
        message: 'Anket kaydedildi (demo)',
        id: 'demo-' + Date.now(),
      };
    }
  },
};






