// Araç Kiralama Yardımcı Fonksiyonlar
// Desktop (grbt8) utils/index.ts ile birebir aynı

import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import type {
  CarCategory,
  Car,
  CarFiltersType,
  CarFilterOptions,
} from '../types/car';
import {
  CAR_CATEGORY_LABELS,
  TRANSMISSION_LABELS,
  FUEL_TYPE_LABELS,
  MILEAGE_TYPE_LABELS,
  CANCELLATION_TYPE_LABELS,
} from '../types/car';

/**
 * Fiyat formatlama (Türkçe)
 */
export function formatCarPrice(price: number, currency: string = 'EUR'): string {
  return `${price.toLocaleString('tr-TR')} ${currency}`;
}

/**
 * Tarih formatlama
 */
export function formatCarDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, 'd MMM yyyy', { locale: tr });
  } catch {
    return dateStr;
  }
}

/**
 * Tarih + saat formatlama
 */
export function formatCarDateTime(dateStr: string, timeStr?: string): string {
  try {
    const date = parseISO(dateStr);
    const formatted = format(date, 'd MMM yyyy', { locale: tr });
    return timeStr ? `${formatted}, ${timeStr}` : formatted;
  } catch {
    return dateStr;
  }
}

/**
 * Kısa tarih formatlama (liste görünümü için)
 */
export function formatShortDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, 'd MMM', { locale: tr });
  } catch {
    return dateStr;
  }
}

/**
 * Gün sayısı hesaplama
 */
export function calculateDays(pickupDate: string, dropoffDate: string): number {
  try {
    const pickup = parseISO(pickupDate);
    const dropoff = parseISO(dropoffDate);
    return Math.max(1, Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)));
  } catch {
    return 1;
  }
}

/**
 * Kategori etiketi
 */
export function getCategoryLabel(category: CarCategory): string {
  return CAR_CATEGORY_LABELS[category] || category;
}

/**
 * Vites tipi etiketi
 */
export function getTransmissionLabel(type: 'automatic' | 'manual'): string {
  return TRANSMISSION_LABELS[type];
}

/**
 * Yakıt tipi etiketi
 */
export function getFuelTypeLabel(type: string): string {
  return FUEL_TYPE_LABELS[type as keyof typeof FUEL_TYPE_LABELS] || type;
}

/**
 * KM tipi etiketi
 */
export function getMileageLabel(type: 'unlimited' | 'limited'): string {
  return MILEAGE_TYPE_LABELS[type];
}

/**
 * İptal politikası etiketi
 */
export function getCancellationLabel(
  type: 'free_cancellation' | 'non_refundable' | 'partial_refund'
): string {
  return CANCELLATION_TYPE_LABELS[type];
}

/**
 * Araç listesinden filtre seçeneklerini hesapla
 */
export function calculateFilterOptions(cars: Car[]): CarFilterOptions {
  const categoryMap = new Map<CarCategory, number>();
  const supplierMap = new Map<number, { name: string; count: number }>();
  const transmissionMap = new Map<string, number>();
  const fuelMap = new Map<string, number>();
  const seatSet = new Set<number>();
  let minPrice = Infinity;
  let maxPrice = 0;

  cars.forEach((car) => {
    // Kategori
    categoryMap.set(car.category, (categoryMap.get(car.category) || 0) + 1);

    // Tedarikçi
    const existing = supplierMap.get(car.supplierId);
    if (existing) {
      existing.count++;
    } else {
      supplierMap.set(car.supplierId, { name: car.supplierName, count: 1 });
    }

    // Vites
    transmissionMap.set(car.transmission, (transmissionMap.get(car.transmission) || 0) + 1);

    // Yakıt
    fuelMap.set(car.fuelType, (fuelMap.get(car.fuelType) || 0) + 1);

    // Koltuk
    seatSet.add(car.seats);

    // Fiyat
    if (car.totalPrice < minPrice) minPrice = car.totalPrice;
    if (car.totalPrice > maxPrice) maxPrice = car.totalPrice;
  });

  return {
    categories: Array.from(categoryMap.entries()).map(([value, count]) => ({
      value,
      label: CAR_CATEGORY_LABELS[value],
      count,
    })),
    suppliers: Array.from(supplierMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      count: data.count,
    })),
    priceRange: { min: minPrice === Infinity ? 0 : minPrice, max: maxPrice },
    transmissionTypes: Array.from(transmissionMap.entries()).map(([value, count]) => ({
      value,
      label: TRANSMISSION_LABELS[value as keyof typeof TRANSMISSION_LABELS] || value,
      count,
    })),
    fuelTypes: Array.from(fuelMap.entries()).map(([value, count]) => ({
      value,
      label: FUEL_TYPE_LABELS[value as keyof typeof FUEL_TYPE_LABELS] || value,
      count,
    })),
    seatCounts: Array.from(seatSet).sort((a, b) => a - b),
  };
}

/**
 * Aktif filtre sayısı
 */
export function getActiveFilterCount(filters: CarFiltersType): number {
  return (
    (filters.carCategories?.length || 0) +
    (filters.transmissionType ? 1 : 0) +
    (filters.mileageType ? 1 : 0) +
    (filters.supplierIds?.length || 0) +
    (filters.numberOfSeats ? 1 : 0) +
    (filters.airConditioning !== undefined ? 1 : 0) +
    (filters.priceRange ? 1 : 0)
  );
}

/**
 * Depot lokasyon tipi etiketi
 */
export function getDepotLocationLabel(
  type: 'in_terminal' | 'meet_and_greet' | 'shuttle' | 'downtown'
): string {
  const labels: Record<string, string> = {
    in_terminal: 'Terminal İçi',
    meet_and_greet: 'Karşılama',
    shuttle: 'Servis',
    downtown: 'Şehir Merkezi',
  };
  return labels[type] || type;
}
