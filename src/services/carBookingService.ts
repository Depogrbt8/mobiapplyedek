// Araç Kiralama Booking Service - Admin panele bağlantı
// Desktop (grbt8) backend endpoint'leri ile birebir uyumlu
// POST/GET /api/cars/bookings, POST /api/cars/bookings/[id]/cancel

import { apiClient } from '@/core/api/client';

// Backend'e gönderilecek istek tipi
export interface CreateCarBookingRequest {
  carName: string;
  carType: string;
  carCategory: string;
  supplierId: number;
  supplierName: string;
  driver: string; // JSON string
  pickupLocation: string; // JSON string
  dropoffLocation: string; // JSON string
  pickupDatetime: string;
  dropoffDatetime: string;
  amount: number;
  currency: string;
  insuranceType?: string;
  extras?: string; // JSON string
  specialRequests?: string;
  searchToken?: string;
}

// Backend'den dönen response
export interface CarBookingResponse {
  id: string;
  bookingNumber: string;
  status: string;
  carName: string;
  carType: string;
  carCategory: string;
  supplierId: number;
  supplierName: string;
  driver: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDatetime: string;
  dropoffDatetime: string;
  amount: number;
  currency: string;
  insuranceType?: string;
  extras?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt?: string;
}

export const carBookingService = {
  /**
   * Araç rezervasyonu oluştur (admin panele düşer)
   */
  async createBooking(data: CreateCarBookingRequest): Promise<CarBookingResponse> {
    const response = await apiClient.post<{ success: boolean; data: CarBookingResponse }>(
      '/api/cars/bookings',
      data
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Araç rezervasyonu oluşturulamadı');
  },

  /**
   * Kullanıcının araç rezervasyonlarını listele
   */
  async getBookings(): Promise<CarBookingResponse[]> {
    const response = await apiClient.get<{ success: boolean; data: CarBookingResponse[] }>(
      '/api/cars/bookings'
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Araç rezervasyonları alınamadı');
  },

  /**
   * Araç rezervasyonunu iptal et
   */
  async cancelBooking(
    bookingId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/api/cars/bookings/${bookingId}/cancel`,
      { reason }
    );
    if (response.data.success) {
      return response.data;
    }
    throw new Error('Araç rezervasyonu iptal edilemedi');
  },
};
