// Otel Service - Business Logic Layer

import type {
  HotelSearchParams,
  HotelSearchResult,
  HotelDetails,
  BookingRequest,
  BookingResponse,
  CancelResponse,
  LocationSuggestion
} from '../types/hotel';

import {
  searchHotelsDemo,
  getHotelDetailsDemo,
  searchLocationsDemo,
  createBookingDemo,
  cancelBookingDemo
} from './adapters/demoHotelApi';

import { HotelApiError, HOTEL_ERROR_CODES } from './hotelApi';
import { hotelBookingService } from '@/services/hotelBookingService';

// Demo mu gerçek API mi? (Mobil uygulamada şimdilik demo kullanıyoruz)
const USE_DEMO = true; // TODO: Environment variable'dan alınacak

/**
 * Otel Arama
 */
export async function searchHotels(params: HotelSearchParams): Promise<HotelSearchResult> {
  try {
    // Parametre validasyonu
    if (!params.location) {
      throw new HotelApiError(HOTEL_ERROR_CODES.INVALID_PARAMS, 'Konum gereklidir');
    }
    if (!params.checkIn || !params.checkOut) {
      throw new HotelApiError(HOTEL_ERROR_CODES.INVALID_PARAMS, 'Giriş ve çıkış tarihleri gereklidir');
    }
    if (!params.guests?.adults || params.guests.adults < 1) {
      throw new HotelApiError(HOTEL_ERROR_CODES.INVALID_PARAMS, 'En az 1 yetişkin gereklidir');
    }

    if (USE_DEMO) {
      return await searchHotelsDemo(params);
    } else {
      // Gerçek API çağrısı (gelecekte eklenecek)
      // return await searchHotelsReal(params);
      return await searchHotelsDemo(params); // Fallback
    }
  } catch (error) {
    console.error('Otel arama hatası:', error);
    
    // Hata durumunda demo veriye fallback
    if (!USE_DEMO) {
      console.log('Gerçek API başarısız, demo veriye geçiliyor...');
      return await searchHotelsDemo(params);
    }
    
    throw error;
  }
}

/**
 * Otel Detayları
 */
export async function getHotelDetails(
  hotelId: string, 
  params?: Partial<HotelSearchParams>
): Promise<HotelDetails | null> {
  try {
    if (!hotelId) {
      throw new HotelApiError(HOTEL_ERROR_CODES.INVALID_PARAMS, 'Otel ID gereklidir');
    }

    if (USE_DEMO) {
      return await getHotelDetailsDemo(hotelId);
    } else {
      // Gerçek API çağrısı (gelecekte eklenecek)
      return await getHotelDetailsDemo(hotelId); // Fallback
    }
  } catch (error) {
    console.error('Otel detay hatası:', error);
    
    if (!USE_DEMO) {
      return await getHotelDetailsDemo(hotelId);
    }
    
    throw error;
  }
}

/**
 * Konum Arama (Autocomplete)
 */
export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    if (USE_DEMO) {
      return await searchLocationsDemo(query);
    } else {
      // Gerçek API çağrısı (gelecekte eklenecek)
      return await searchLocationsDemo(query); // Fallback
    }
  } catch (error) {
    console.error('Konum arama hatası:', error);
    return [];
  }
}

/**
 * Rezervasyon Oluşturma
 * 
 * Desktop (grbt8) ile aynı endpoint: POST /api/hotels/bookings
 * Otel arama/detay demo olsa bile, rezervasyon gerçek API'ye (HotelBooking tablosu) gönderilir.
 * Demo response UI akışı (onay ekranı, detaylar) için kullanılır.
 */
export async function createBooking(request: BookingRequest): Promise<BookingResponse> {
  try {
    // Validasyon
    if (!request.hotelId || !request.roomTypeId || !request.rateId) {
      throw new HotelApiError(HOTEL_ERROR_CODES.INVALID_PARAMS, 'Otel, oda ve fiyat seçimi gereklidir');
    }
    if (!request.checkIn || !request.checkOut) {
      throw new HotelApiError(HOTEL_ERROR_CODES.INVALID_PARAMS, 'Tarihler gereklidir');
    }
    if (request.guestDetails && request.guestDetails.length > 0) {
      if (!request.contactInfo?.email || !request.contactInfo?.phone) {
        throw new HotelApiError(HOTEL_ERROR_CODES.INVALID_PARAMS, 'İletişim bilgileri (e-posta ve telefon) gereklidir');
      }
      const invalidGuest = request.guestDetails.find(
        (g) => !g.firstName?.trim() || g.firstName.trim().length < 2 || !g.lastName?.trim() || g.lastName.trim().length < 2
      );
      if (invalidGuest) {
        throw new HotelApiError(HOTEL_ERROR_CODES.INVALID_PARAMS, 'Tüm misafirlerin ad ve soyadı en az 2 karakter olmalıdır');
      }
    } else if (!request.guestInfo?.firstName || !request.guestInfo?.lastName || !request.guestInfo?.email) {
      throw new HotelApiError(HOTEL_ERROR_CODES.INVALID_PARAMS, 'Misafir bilgileri gereklidir');
    }

    // 1) Demo response oluştur (UI akışı için - otel/oda/fiyat bilgileri demo'dan gelir)
    const demoResponse = await createBookingDemo(request);

    // 2) Gerçek API'ye gönder: POST /api/hotels/bookings (Desktop ile birebir aynı endpoint)
    const nights = calculateNights(request.checkIn, request.checkOut);

    try {
      const apiResponse = await hotelBookingService.createBooking({
        hotelId: request.hotelId,
        hotelName: demoResponse.hotel?.name || request.hotelId,
        hotelLocation: demoResponse.hotel?.location
          ? `${demoResponse.hotel.location.city}, ${demoResponse.hotel.location.country || 'Türkiye'}`
          : '',
        roomType: request.roomTypeId,    // Desktop: selectedRoom.id
        roomName: demoResponse.room?.name || '',
        checkIn: request.checkIn,
        checkOut: request.checkOut,
        nights,
        guests: request.guests,
        contactInfo: request.contactInfo,
        guestDetails: request.guestDetails,
        guestInfo: request.guestInfo,
        totalPrice: demoResponse.totalPrice,
        currency: demoResponse.currency,
        cancellationPolicy: demoResponse.rate?.cancellationPolicy,
        specialRequests: request.specialRequests,
        provider: 'demo',
      });

      console.log('✅ Otel rezervasyonu HotelBooking tablosuna kaydedildi:', apiResponse.data?.confirmationNumber);

      // Backend'den gelen gerçek confirmationNumber ve bookingId'yi demo response'a yaz
      if (apiResponse.success && apiResponse.data) {
        demoResponse.confirmationNumber = apiResponse.data.confirmationNumber;
        demoResponse.bookingId = apiResponse.data.booking.id;
      }
    } catch (apiError) {
      // API başarısız olsa bile kullanıcıya demo akışını göster
      console.warn('⚠️ Otel rezervasyonu backend\'e gönderilemedi (demo akışı devam ediyor):', apiError);
    }

    return demoResponse;
  } catch (error) {
    console.error('Rezervasyon hatası:', error);
    throw error;
  }
}

/**
 * Rezervasyon İptali
 * Desktop ile aynı endpoint: POST /api/hotels/bookings/[id]/cancel
 */
export async function cancelBooking(bookingId: string, reason?: string): Promise<CancelResponse> {
  try {
    if (!bookingId) {
      throw new HotelApiError(HOTEL_ERROR_CODES.INVALID_PARAMS, 'Rezervasyon ID gereklidir');
    }

    // Gerçek API'ye iptal isteği gönder: POST /api/hotels/bookings/[id]/cancel
    try {
      const apiResponse = await hotelBookingService.cancelBooking(bookingId, reason);

      if (apiResponse.success && apiResponse.data) {
        console.log('✅ Otel rezervasyonu iptal edildi:', bookingId);
        return {
          success: true,
          bookingId,
          refundAmount: apiResponse.data.refundAmount,
          refundCurrency: apiResponse.data.refundCurrency,
          message: apiResponse.data.message,
        };
      }

      // API başarısız döndüyse demo fallback
      console.warn('⚠️ API iptal başarısız, demo fallback:', apiResponse.error);
      return await cancelBookingDemo(bookingId);
    } catch (apiError) {
      // API erişilemiyorsa demo fallback
      console.warn('⚠️ Otel iptal isteği backend\'e gönderilemedi, demo fallback:', apiError);
      return await cancelBookingDemo(bookingId);
    }
  } catch (error) {
    console.error('İptal hatası:', error);
    throw error;
  }
}

/**
 * Gece sayısını hesapla
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Toplam fiyat hesapla
 */
export function calculateTotalPrice(
  pricePerNight: number, 
  nights: number, 
  rooms: number
): number {
  return pricePerNight * nights * rooms;
}

// Eski interface'ler (mevcut kodla uyumluluk için - backward compatibility)
export interface HotelSearchQuery {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

// Eski Hotel interface (mevcut kodla uyumluluk için - backward compatibility)
export interface Hotel {
  id: string;
  name: string;
  location: string;
  address: string;
  rating: number;
  price: number;
  currency: string;
  image?: string;
  amenities?: string[];
}

/**
 * Eski searchHotels fonksiyonu (backward compatibility)
 * Yeni HotelSearchParams formatına çevirir ve çağırır
 */
export async function searchHotelsLegacy(query: HotelSearchQuery): Promise<Hotel[]> {
  const params: HotelSearchParams = {
    location: query.location,
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    guests: {
      adults: query.guests,
      children: 0,
      rooms: query.rooms
    }
  };

  const result = await searchHotels(params);
  
  // Yeni formatı eski formata çevir
  return result.hotels.map(hotel => ({
    id: hotel.id,
    name: hotel.name,
    location: hotel.location.city,
    address: hotel.location.address,
    rating: hotel.rating,
    price: hotel.priceRange.min,
    currency: hotel.priceRange.currency,
    image: hotel.images[0],
    amenities: hotel.amenities
  }));
}

/**
 * Eski getHotelDetails fonksiyonu (backward compatibility)
 */
export async function getHotelDetailsLegacy(hotelId: string): Promise<Hotel> {
  const details = await getHotelDetails(hotelId);
  
  if (!details) {
    throw new Error('Hotel details not found');
  }

  // Yeni formatı eski formata çevir
  return {
    id: details.id,
    name: details.name,
    location: details.location.city,
    address: details.location.address,
    rating: details.rating,
    price: details.priceRange.min,
    currency: details.priceRange.currency,
    image: details.images[0],
    amenities: details.amenities
  };
}

// Eski service object (backward compatibility)
export const hotelService = {
  searchHotels: searchHotelsLegacy,
  getHotelDetails: getHotelDetailsLegacy
};
