import { apiClient } from '@/core/api/client';

export interface PriceAlert {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  targetPrice?: number;
  currency?: string;
  isActive: boolean;
  createdAt: string;
}

interface PriceAlertsResponse {
  alerts: PriceAlert[];
}

/**
 * Price Alerts service
 */
export const priceAlertsService = {
  /**
   * Get price alerts
   */
  async getAlerts(): Promise<PriceAlert[]> {
    const response = await apiClient.get<PriceAlertsResponse>('/api/price-alerts');
    return response.data.alerts;
  },

  /**
   * Create price alert
   */
  async createAlert(data: {
    origin: string;
    destination: string;
    departureDate: string;
    targetPrice?: number;
    currency?: string;
  }): Promise<PriceAlert> {
    const response = await apiClient.post<PriceAlert>('/api/price-alerts', data);
    return response.data;
  },

  /**
   * Update price alert
   */
  async updateAlert(id: string, data: Partial<PriceAlert>): Promise<PriceAlert> {
    const response = await apiClient.put<PriceAlert>(`/api/price-alerts/${id}`, data);
    return response.data;
  },

  /**
   * Delete price alert
   */
  async deleteAlert(id: string): Promise<void> {
    const response = await apiClient.delete(`/api/price-alerts/${id}`);
    // Response kontrolü - ana sitede { success: true } dönüyor
    if (response.data && !response.data.success) {
      throw new Error('Alarm silinemedi');
    }
  },
};
