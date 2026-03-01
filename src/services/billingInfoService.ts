import { apiClient } from '@/core/api/client';

export interface BillingInfo {
  id?: string;
  type: 'individual' | 'corporate';
  title: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  taxNumber?: string;
  address: string;
  city: string;
  country: string;
  isDefault: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface BillingInfoResponse {
  success: boolean;
  data: BillingInfo[];
  message?: string;
}

interface SingleBillingInfoResponse {
  success: boolean;
  data: BillingInfo;
  message?: string;
}

/**
 * Billing Info service
 */
export const billingInfoService = {
  /**
   * Get all billing infos for current user
   */
  async getBillingInfos(): Promise<BillingInfo[]> {
    const response = await apiClient.get<BillingInfoResponse>('/api/billing-info');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Fatura bilgileri getirilemedi');
  },

  /**
   * Create new billing info
   */
  async createBillingInfo(data: Omit<BillingInfo, 'id' | 'createdAt' | 'updatedAt'>): Promise<BillingInfo> {
    const response = await apiClient.post<SingleBillingInfoResponse>('/api/billing-info', data);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Fatura bilgisi eklenemedi');
  },

  /**
   * Update billing info
   */
  async updateBillingInfo(data: BillingInfo): Promise<BillingInfo> {
    const response = await apiClient.put<SingleBillingInfoResponse>('/api/billing-info', data);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Fatura bilgisi güncellenemedi');
  },

  /**
   * Delete billing info
   */
  async deleteBillingInfo(id: string): Promise<void> {
    const response = await apiClient.delete(`/api/billing-info?id=${id}`);
    if (!response.data || (response.data as any).success !== false) {
      return;
    }
    throw new Error((response.data as any).message || 'Fatura bilgisi silinemedi');
  },
};











