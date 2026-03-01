/**
 * Hotel Booking Service
 * 
 * Desktop (grbt8) ile aynı endpoint'leri kullanır: /api/hotels/bookings
 * Bu sayede mobil ve web'den yapılan otel rezervasyonları aynı HotelBooking tablosuna düşer.
 */
import { apiClient } from '@/core/api/client';
import type { HotelGuest, ContactInfo } from '@/modules/travel/types/hotel';

// === Request Types ===

export interface CreateHotelBookingRequest {
  hotelId: string;
  hotelName: string;
  hotelLocation: string;
  roomType: string;       // room.id (desktop ile aynı)
  roomName: string;       // room.name
  checkIn: string;        // YYYY-MM-DD
  checkOut: string;       // YYYY-MM-DD
  nights: number;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  /** Yeni format: iletişim bilgisi */
  contactInfo?: ContactInfo;
  /** Yeni format: tüm misafir bilgileri */
  guestDetails?: HotelGuest[];
  /** Eski format (tek misafir, backward compat) */
  guestInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    countryCode?: string;
  };
  totalPrice: number;
  currency: string;
  cancellationPolicy?: string;
  specialRequests?: string;
  provider?: string;      // 'demo' | 'amadeus' | 'expedia' vs.
}

export interface CancelHotelBookingRequest {
  reason?: string;
}

// === Response Types ===

export interface HotelBookingData {
  id: string;
  userId: string;
  hotelId: string;
  hotelName: string;
  hotelLocation: string;
  hotelImageUrl?: string | null;
  roomType: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: string;             // JSON string: { adults, children, rooms }
  guestInfo: string | null;   // JSON string
  contactInfo: string | null; // JSON string
  guestDetails: string | null;// JSON string
  totalPrice: number;
  currency: string;
  status: string;
  confirmationNumber: string | null;
  cancellationPolicy: string | null;
  specialRequests: string | null;
  provider: string | null;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  cancellationReason: string | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface CreateBookingResponse {
  success: boolean;
  data?: {
    booking: HotelBookingData;
    confirmationNumber: string;
  };
  error?: string;
  code?: string;
}

interface ListBookingsResponse {
  success: boolean;
  data?: {
    bookings: HotelBookingData[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}

interface CancelBookingResponse {
  success: boolean;
  data?: {
    booking: HotelBookingData;
    refundAmount: number;
    refundCurrency: string;
    message: string;
  };
  error?: string;
}

/**
 * Hotel Booking Service - Desktop /api/hotels/bookings ile birebir uyumlu
 */
export const hotelBookingService = {
  /**
   * Yeni otel rezervasyonu oluştur
   * Desktop: POST /api/hotels/bookings
   */
  async createBooking(data: CreateHotelBookingRequest): Promise<CreateBookingResponse> {
    const response = await apiClient.post<CreateBookingResponse>('/hotels/bookings', {
      hotelId: data.hotelId,
      hotelName: data.hotelName,
      hotelLocation: data.hotelLocation,
      roomType: data.roomType,
      roomName: data.roomName,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      nights: data.nights,
      guests: data.guests,
      contactInfo: data.contactInfo,
      guestDetails: data.guestDetails,
      guestInfo: data.guestInfo,
      totalPrice: data.totalPrice,
      currency: data.currency,
      cancellationPolicy: data.cancellationPolicy || null,
      specialRequests: data.specialRequests || null,
      provider: data.provider || 'demo',
    });
    return response.data;
  },

  /**
   * Otel rezervasyonlarını listele
   * Desktop: GET /api/hotels/bookings
   */
  async getBookings(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ListBookingsResponse> {
    const response = await apiClient.get<ListBookingsResponse>('/hotels/bookings', {
      params: {
        status: params?.status,
        page: params?.page || 1,
        limit: params?.limit || 50,
      },
    });
    return response.data;
  },

  /**
   * Otel rezervasyonunu iptal et
   * Desktop: POST /api/hotels/bookings/[id]/cancel
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<CancelBookingResponse> {
    const response = await apiClient.post<CancelBookingResponse>(
      `/hotels/bookings/${bookingId}/cancel`,
      reason ? { reason } : {}
    );
    return response.data;
  },
};
