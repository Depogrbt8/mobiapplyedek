// Araç Kiralama Modülü - TypeScript Tipleri
// Desktop (grbt8) ile birebir aynı - Booking.com Cars API yapısına uygun

/**
 * Lokasyon (Alış/Teslim noktası)
 */
export interface CarLocation {
  id: string;
  name: string;
  type: 'airport' | 'city' | 'downtown' | 'railway_station';
  airport?: string; // IATA kodu (AMS, IST, AYT)
  city?: string; // Şehir adı
  cityId?: number; // Booking.com city ID
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  depotLocationType?: 'in_terminal' | 'meet_and_greet' | 'shuttle' | 'downtown';
}

/**
 * Araç Kategorileri (Booking.com standartları)
 */
export type CarCategory =
  | 'mini'
  | 'economy'
  | 'compact'
  | 'intermediate'
  | 'standard'
  | 'fullsize'
  | 'premium'
  | 'luxury'
  | 'suv'
  | 'minivan'
  | 'convertible'
  | 'estate';

/**
 * Araç (Liste görünümü)
 */
export interface Car {
  id: string;
  name: string; // "Fiat Egea veya benzeri"
  category: CarCategory;
  imageUrl: string;

  // Araç özellikleri
  transmission: 'automatic' | 'manual';
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'lpg';
  airConditioning: boolean;
  seats: number;
  doors: number;
  largeBags: number;
  smallBags: number;

  // Fiyat
  pricePerDay: number;
  totalPrice: number;
  currency: string;

  // Tedarikçi
  supplierId: number;
  supplierName: string;
  supplierLogo?: string;
  supplierRating?: number;

  // Politikalar
  mileage: {
    type: 'unlimited' | 'limited';
    distance?: number;
    distanceUnit?: 'kilometers' | 'miles';
    extraCostPerUnit?: number;
  };

  fuelPolicy: 'same_to_same' | 'full_to_full' | 'pre_purchase';

  cancellation: {
    type: 'free_cancellation' | 'non_refundable' | 'partial_refund';
    freeCancellationBefore?: string;
    refundPercentage?: number;
  };

  // Ekstra bilgiler
  depositAmount?: number;
  excessAmount?: number;
  insuranceIncluded: boolean;

  // Lokasyon
  pickupDepot: {
    id: number;
    locationType: 'in_terminal' | 'meet_and_greet' | 'shuttle' | 'downtown';
  };
  dropoffDepot: {
    id: number;
    locationType: 'in_terminal' | 'meet_and_greet' | 'shuttle' | 'downtown';
  };
}

/**
 * Araç Detayları (Detay sayfası)
 */
export interface CarDetails extends Car {
  description: string;
  images: string[];

  specifications: {
    make?: string;
    model?: string;
    year?: number;
    engine?: string;
    power?: string;
    fuelConsumption?: string;
    co2Emission?: string;
  };

  features: string[];

  rentalConditions: {
    minimumAge: number;
    minimumLicenseAge: number;
    youngDriverFee?: {
      ageRange: string;
      amount: number;
      currency: string;
    };
    additionalDriverFee?: {
      amount: number;
      currency: string;
      perDriver?: boolean;
    };
    crossBorderAllowed: boolean;
    crossBorderFee?: number;
  };

  insuranceOptions: InsuranceOption[];
  extraServices: ExtraService[];

  policies: {
    cancellation: string;
    amendment: string;
    lateReturn: string;
    earlyReturn: string;
    damage: string;
    theft: string;
  };

  supplier: {
    id: number;
    name: string;
    logo?: string;
    rating?: number;
    reviewCount?: number;
    phone?: string;
    email?: string;
    workingHours?: string;
  };
}

/**
 * Sigorta Seçeneği
 */
export interface InsuranceOption {
  id: string;
  name: string;
  description: string;
  coverage: string[];
  excessReduction: number;
  price: number;
  currency: string;
  included: boolean;
  recommended?: boolean;
}

/**
 * Ekstra Hizmet
 */
export interface ExtraService {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  unit: 'per_day' | 'per_rental';
  icon?: string;
  maxQuantity?: number;
  mandatory?: boolean;
}

/**
 * Araç Arama Parametreleri (Booking.com formatı)
 */
export interface CarSearchParams {
  route: {
    pickup: {
      location: CarLocation;
      datetime: string;
    };
    dropoff: {
      location: CarLocation;
      datetime: string;
    };
  };

  driver: {
    age: number;
    country?: string;
  };

  booker: {
    country: string;
  };

  currency: string;
  filters?: CarFiltersType;

  payment?: {
    timings?: ('pay_online_now' | 'pay_partial_online_now' | 'pay_at_pickup')[];
  };

  maximumResults?: number;
  sort?: {
    by: 'price' | 'distance' | 'review_score';
    direction?: 'ascending' | 'descending';
  };
  page?: string;
}

/**
 * Araç Filtreleri
 */
export interface CarFiltersType {
  carCategories?: CarCategory[];
  transmissionType?: 'automatic' | 'manual';
  mileageType?: 'unlimited' | 'limited';
  depotLocationType?: 'in_terminal' | 'meet_and_greet' | 'shuttle' | 'downtown';
  numberOfSeats?: number;
  airConditioning?: boolean;
  supplierIds?: number[];
  priceRange?: {
    min: number;
    max: number;
  };
}

/**
 * Araç Arama Sonucu
 */
export interface CarSearchResult {
  requestId: string;
  data: Car[];
  metadata: {
    totalResults: number;
    nextPage?: string;
    searchToken: string;
  };
  searchParams: CarSearchParams;
}

/**
 * Sürücü Bilgileri
 */
export interface Driver {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  dateOfBirth: string;
  age: number;

  license: {
    number: string;
    issueDate: string;
    expiryDate: string;
    issueCountry: string;
  };

  identity: {
    type: 'passport' | 'id_card' | 'driving_license';
    number: string;
    issueCountry: string;
    expiryDate?: string;
  };

  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

/**
 * Rezervasyon Verisi (Booking.com formatı)
 */
export interface CarBookingData {
  carId: string;
  searchToken: string;

  route: {
    pickup: {
      depotId: number;
      datetime: string;
    };
    dropoff: {
      depotId: number;
      datetime: string;
    };
  };

  driver: Driver;
  additionalDrivers?: Driver[];

  extras?: {
    serviceId: string;
    quantity: number;
  }[];

  insurance?: {
    optionId: string;
  };

  payment: {
    method: 'credit_card' | 'debit_card';
    timing: 'pay_online_now' | 'pay_partial_online_now' | 'pay_at_pickup';
  };

  contactPreferences?: {
    email: boolean;
    sms: boolean;
  };

  specialRequests?: string;
}

/**
 * Fiyat Detayı
 */
export interface PriceBreakdown {
  basePrice: number;
  pricePerDay: number;
  days: number;

  extras: {
    name: string;
    amount: number;
  }[];
  extrasTotal: number;

  insurance: number;

  youngDriverFee: number;
  additionalDriverFee: number;
  oneWayFee: number;
  airportFee: number;

  subtotal: number;

  tax: number;
  taxRate: number;

  total: number;
  currency: string;

  deposit?: number;
  excess?: number;
}

/**
 * Rezervasyon
 */
export interface CarBooking {
  id: string;
  bookingNumber: string;
  bookingReference?: string;

  car: Car;

  route: {
    pickup: {
      location: CarLocation;
      depot: {
        id: number;
        name: string;
        address: string;
        phone: string;
        workingHours: string;
      };
      datetime: string;
    };
    dropoff: {
      location: CarLocation;
      depot: {
        id: number;
        name: string;
        address: string;
        phone: string;
        workingHours: string;
      };
      datetime: string;
    };
  };

  driver: Driver;
  additionalDrivers?: Driver[];

  extras: ExtraService[];
  insurance?: InsuranceOption;

  priceBreakdown: PriceBreakdown;

  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;

  confirmationEmail: string;
  confirmationSms?: string;

  cancellationPolicy: string;
  amendmentPolicy?: string;

  provider: string;
  providerBookingId?: string;
}

/**
 * Basitleştirilmiş Arama Parametreleri (Frontend için)
 */
export interface SimpleCarSearchParams {
  pickupLocationId: string;
  pickupLocationName: string;
  dropoffLocationId: string;
  dropoffLocationName: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  driverAge: number;
  driverCountry?: string;
}

/**
 * Araç Filtre Seçenekleri
 */
export interface CarFilterOptions {
  categories: { value: CarCategory; label: string; count: number }[];
  suppliers: { id: number; name: string; count: number }[];
  priceRange: { min: number; max: number };
  transmissionTypes: { value: string; label: string; count: number }[];
  fuelTypes: { value: string; label: string; count: number }[];
  seatCounts: number[];
}

/**
 * Sıralama Seçenekleri
 */
export type CarSortOption =
  | 'price_asc'
  | 'price_desc'
  | 'rating'
  | 'distance'
  | 'recommended';

/**
 * Lokasyon Arama Sonucu
 */
export interface LocationSearchResult {
  id: string;
  name: string;
  type: 'airport' | 'city' | 'downtown';
  city: string;
  country: string;
  airport?: string;
  highlight?: string;
}

// Kategori etiketleri (Türkçe)
export const CAR_CATEGORY_LABELS: Record<CarCategory, string> = {
  mini: 'Mini',
  economy: 'Ekonomi',
  compact: 'Kompakt',
  intermediate: 'Orta',
  standard: 'Standart',
  fullsize: 'Büyük',
  premium: 'Premium',
  luxury: 'Lüks',
  suv: 'SUV',
  minivan: 'Minivan',
  convertible: 'Cabrio',
  estate: 'Station Wagon',
};

// Vites tipi etiketleri
export const TRANSMISSION_LABELS = {
  automatic: 'Otomatik',
  manual: 'Manuel',
} as const;

// Yakıt tipi etiketleri
export const FUEL_TYPE_LABELS = {
  petrol: 'Benzin',
  diesel: 'Dizel',
  hybrid: 'Hybrid',
  electric: 'Elektrik',
  lpg: 'LPG',
} as const;

// Kilometre tipi etiketleri
export const MILEAGE_TYPE_LABELS = {
  unlimited: 'Sınırsız',
  limited: 'Sınırlı',
} as const;

// İptal politikası etiketleri
export const CANCELLATION_TYPE_LABELS = {
  free_cancellation: 'Ücretsiz İptal',
  non_refundable: 'İade Edilemez',
  partial_refund: 'Kısmi İade',
} as const;
