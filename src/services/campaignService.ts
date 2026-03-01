import { apiClient } from '@/core/api/client';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  imageData?: string | null;
  altText: string;
  linkUrl: string;
  status: 'active' | 'inactive';
  position: number;
  clickCount: number;
  viewCount: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CampaignsResponse {
  success: boolean;
  data: Campaign[];
}

/**
 * Campaign service for banner management
 */
export const campaignService = {
  /**
   * Get active campaigns (banners)
   */
  async getCampaigns(): Promise<Campaign[]> {
    try {
      const response = await apiClient.get<CampaignsResponse>('/campaigns', {
        headers: {
          'Cache-Control': 'no-store',
        },
      });
      if (response.data.success && response.data.data) {
        // Sadece aktif kampanyaları al ve pozisyona göre sırala
        return response.data.data
          .filter((campaign) => campaign.status === 'active')
          .sort((a, b) => a.position - b.position)
          .slice(0, 4); // Maksimum 4 kampanya
      }
      return [];
    } catch (error) {
      console.warn('Kampanyalar yüklenemedi:', error);
      return [];
    }
  },

  /**
   * Track campaign click
   */
  async trackClick(campaignId: string): Promise<void> {
    try {
      await apiClient.post(`/campaigns/${campaignId}/click`);
    } catch (error) {
      console.warn('Tıklama sayacı güncellenemedi:', error);
    }
  },
};






