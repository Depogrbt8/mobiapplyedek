import { apiClient } from '@/core/api/client';

export interface Car {
  id: string;
  name: string;
  type: string;
  brand: string;
  price: number;
  currency: string;
  image?: string;
  features?: string[];
}

export interface CarSearchQuery {
  pickupLocation: string;
  pickupDate: string;
  pickupTime: string;
  dropoffLocation: string;
  dropoffDate: string;
  dropoffTime: string;
}

interface CarSearchResponse {
  success: boolean;
  data: Car[];
}

/**
 * Car rental service
 */
export const carService = {
  /**
   * Search cars
   */
  async searchCars(query: CarSearchQuery): Promise<Car[]> {
    const response = await apiClient.post<CarSearchResponse>(
      '/api/cars/search',
      query
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error('Car search failed');
  },

  /**
   * Get car details
   */
  async getCarDetails(carId: string): Promise<Car> {
    const response = await apiClient.get<{ success: boolean; data: Car }>(
      `/api/cars/${carId}`
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error('Car details not found');
  },
};

