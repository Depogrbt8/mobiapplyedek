// Araç Kiralama API Servisi - Interface
// Desktop (grbt8) ile birebir aynı adapter pattern
// Gerçek API'ye geçişte sadece adapter değiştirilecek

import type {
  CarSearchParams,
  CarSearchResult,
  CarDetails,
  CarBookingData,
  CarBooking,
  LocationSearchResult,
} from '../../types/car';

/**
 * Araç Kiralama API Interface
 * Tüm provider'lar (Demo, Rentalcars, CartrawLer, Garenta) bu interface'i implement eder
 */
export interface CarRentalAPI {
  searchCars(params: CarSearchParams): Promise<CarSearchResult>;
  getCarDetails(carId: string, searchToken: string): Promise<CarDetails>;
  checkAvailability(carId: string, searchToken: string): Promise<{
    available: boolean;
    price?: number;
    message?: string;
  }>;
  createBooking(data: CarBookingData): Promise<CarBooking>;
  getBooking(bookingId: string): Promise<CarBooking>;
  cancelBooking(bookingId: string, reason?: string): Promise<{
    success: boolean;
    refundAmount?: number;
    message?: string;
  }>;
  searchLocations(query: string, type?: 'airport' | 'city' | 'all'): Promise<LocationSearchResult[]>;
  getPopularLocations(country?: string): Promise<LocationSearchResult[]>;
}

/**
 * Varsayılan API instance
 */
let apiInstance: CarRentalAPI;

export function setCarRentalAPI(api: CarRentalAPI) {
  apiInstance = api;
}

export function getCarRentalAPI(): CarRentalAPI {
  if (!apiInstance) {
    // Lazy init: ilk kullanımda demo API set edilir
    const { demoCarAPI } = require('./adapters/demo');
    setCarRentalAPI(demoCarAPI);
  }
  return apiInstance!;
}

// === API Helper Functions ===

export async function searchCars(params: CarSearchParams): Promise<CarSearchResult> {
  return getCarRentalAPI().searchCars(params);
}

export async function getCarDetails(carId: string, searchToken: string): Promise<CarDetails> {
  return getCarRentalAPI().getCarDetails(carId, searchToken);
}

export async function checkAvailability(carId: string, searchToken: string) {
  return getCarRentalAPI().checkAvailability(carId, searchToken);
}

export async function createBooking(data: CarBookingData): Promise<CarBooking> {
  return getCarRentalAPI().createBooking(data);
}

export async function getBooking(bookingId: string): Promise<CarBooking> {
  return getCarRentalAPI().getBooking(bookingId);
}

export async function cancelBooking(bookingId: string, reason?: string) {
  return getCarRentalAPI().cancelBooking(bookingId, reason);
}

export async function searchLocations(
  query: string,
  type?: 'airport' | 'city' | 'all'
): Promise<LocationSearchResult[]> {
  return getCarRentalAPI().searchLocations(query, type);
}

export async function getPopularLocations(country?: string): Promise<LocationSearchResult[]> {
  return getCarRentalAPI().getPopularLocations(country);
}
