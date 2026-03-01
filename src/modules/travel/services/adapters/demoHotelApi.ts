// Demo Otel API - Gerçek API'ye hazır demo implementasyon

import type {
  Hotel,
  HotelDetails,
  HotelSearchParams,
  HotelSearchResult,
  RoomType,
  Rate,
  BookingRequest,
  BookingResponse,
  CancelResponse,
  LocationSuggestion,
  Review
} from '../../types/hotel';

// Demo Otel Verileri
const DEMO_HOTELS: Hotel[] = [
  {
    id: 'hotel-1',
    name: 'Grand Hyatt Istanbul',
    location: {
      city: 'İstanbul',
      address: 'Harbiye Mahallesi, Taşkışla Cad. No:1',
      country: 'Türkiye',
      coordinates: { lat: 41.0458, lng: 28.9942 },
      distanceFromCenter: 2.5
    },
    rating: 5,
    reviewScore: 9.2,
    reviewCount: 2847,
    priceRange: { min: 250, max: 800, currency: 'EUR' },
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200'
    ],
    amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service', 'Parking'],
    availability: true,
    description: 'İstanbul\'un kalbinde lüks konaklama deneyimi.',
    hotelChain: 'Hyatt'
  },
  {
    id: 'hotel-2',
    name: 'Swissôtel The Bosphorus',
    location: {
      city: 'İstanbul',
      address: 'Bayıldım Cad. No:2, Maçka',
      country: 'Türkiye',
      coordinates: { lat: 41.0422, lng: 29.0069 },
      distanceFromCenter: 3.0
    },
    rating: 5,
    reviewScore: 9.0,
    reviewCount: 3156,
    priceRange: { min: 280, max: 750, currency: 'EUR' },
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200',
      'https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?w=1200'
    ],
    amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service', 'Parking', 'Conference Room'],
    availability: true,
    description: 'Boğaz manzaralı eşsiz bir konaklama.',
    hotelChain: 'Swissôtel'
  },
  {
    id: 'hotel-3',
    name: 'Radisson Blu Hotel Ankara',
    location: {
      city: 'Ankara',
      address: 'İstiklal Cad. No:20, Ulus',
      country: 'Türkiye',
      coordinates: { lat: 39.9334, lng: 32.8597 },
      distanceFromCenter: 1.5
    },
    rating: 4,
    reviewScore: 8.4,
    reviewCount: 1523,
    priceRange: { min: 120, max: 350, currency: 'EUR' },
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200',
      'https://images.unsplash.com/photo-1520256862855-398228c41684?w=1200'
    ],
    amenities: ['WiFi', 'Gym', 'Restaurant', 'Bar', 'Room Service', 'Parking', 'Conference Room'],
    availability: true,
    description: 'Ankara\'nın merkezinde konforlu konaklama.',
    hotelChain: 'Radisson'
  },
  {
    id: 'hotel-4',
    name: 'Hilton Antalya',
    location: {
      city: 'Antalya',
      address: 'Konyaaltı Sahili, Lara',
      country: 'Türkiye',
      coordinates: { lat: 36.8969, lng: 30.7133 },
      distanceFromCenter: 8.0
    },
    rating: 5,
    reviewScore: 8.8,
    reviewCount: 4521,
    priceRange: { min: 180, max: 550, currency: 'EUR' },
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200',
      'https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?w=1200'
    ],
    amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service', 'Parking', 'Beach Access', 'Kids Club'],
    availability: true,
    description: 'Akdeniz\'in en güzel sahilinde tatil keyfi.',
    hotelChain: 'Hilton'
  },
  {
    id: 'hotel-5',
    name: 'Wyndham Grand İzmir',
    location: {
      city: 'İzmir',
      address: 'Kordon Boyu, Alsancak',
      country: 'Türkiye',
      coordinates: { lat: 38.4237, lng: 27.1428 },
      distanceFromCenter: 2.0
    },
    rating: 4,
    reviewScore: 8.2,
    reviewCount: 1876,
    priceRange: { min: 100, max: 280, currency: 'EUR' },
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200'
    ],
    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Parking', 'Sea View'],
    availability: true,
    description: 'İzmir Körfezi manzaralı modern otel.',
    hotelChain: 'Wyndham'
  }
];

// Demo Oda Tipleri
const DEMO_ROOMS: Record<string, RoomType[]> = {
  'hotel-1': [
    {
      id: 'room-1-1',
      name: 'Standard Room',
      description: 'Şehir manzaralı konforlu oda',
      maxOccupancy: 2,
      bedType: '1 King Bed',
      size: 32,
      amenities: ['WiFi', 'TV', 'Mini Bar', 'Safe', 'Air Conditioning'],
      images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
      rates: [
        { id: 'rate-1-1-1', name: 'Sadece Oda', price: 250, currency: 'EUR', cancellationPolicy: 'free', mealPlan: 'room_only', availability: true, roomsLeft: 5 },
        { id: 'rate-1-1-2', name: 'Kahvaltı Dahil', price: 280, currency: 'EUR', cancellationPolicy: 'free', mealPlan: 'breakfast', availability: true, roomsLeft: 5 }
      ]
    },
    {
      id: 'room-1-2',
      name: 'Deluxe Room',
      description: 'Geniş, Boğaz manzaralı lüks oda',
      maxOccupancy: 3,
      bedType: '1 King Bed + Sofa Bed',
      size: 45,
      amenities: ['WiFi', 'TV', 'Mini Bar', 'Safe', 'Air Conditioning', 'Balcony', 'Sea View'],
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
      rates: [
        { id: 'rate-1-2-1', name: 'Sadece Oda', price: 380, currency: 'EUR', cancellationPolicy: 'free', mealPlan: 'room_only', availability: true, roomsLeft: 3 },
        { id: 'rate-1-2-2', name: 'Kahvaltı Dahil', price: 420, currency: 'EUR', cancellationPolicy: 'free', mealPlan: 'breakfast', availability: true, roomsLeft: 3 }
      ]
    }
  ]
};

// Demo Şehir Önerileri
const DEMO_LOCATIONS: LocationSuggestion[] = [
  { id: 'loc-1', name: 'İstanbul', type: 'city', country: 'Türkiye', countryCode: 'TR', hotelCount: 2500 },
  { id: 'loc-2', name: 'Ankara', type: 'city', country: 'Türkiye', countryCode: 'TR', hotelCount: 450 },
  { id: 'loc-3', name: 'Antalya', type: 'city', country: 'Türkiye', countryCode: 'TR', hotelCount: 1800 },
  { id: 'loc-4', name: 'İzmir', type: 'city', country: 'Türkiye', countryCode: 'TR', hotelCount: 650 },
  { id: 'loc-5', name: 'Muğla', type: 'city', country: 'Türkiye', countryCode: 'TR', hotelCount: 890 },
  { id: 'loc-6', name: 'Bursa', type: 'city', country: 'Türkiye', countryCode: 'TR', hotelCount: 320 },
  { id: 'loc-7', name: 'Trabzon', type: 'city', country: 'Türkiye', countryCode: 'TR', hotelCount: 180 },
  { id: 'loc-8', name: 'Konya', type: 'city', country: 'Türkiye', countryCode: 'TR', hotelCount: 150 },
  { id: 'loc-9', name: 'Paris', type: 'city', country: 'Fransa', countryCode: 'FR', hotelCount: 3200 },
  { id: 'loc-10', name: 'Londra', type: 'city', country: 'İngiltere', countryCode: 'GB', hotelCount: 4100 },
  { id: 'loc-11', name: 'Amsterdam', type: 'city', country: 'Hollanda', countryCode: 'NL', hotelCount: 1200 },
  { id: 'loc-12', name: 'Berlin', type: 'city', country: 'Almanya', countryCode: 'DE', hotelCount: 1800 },
  { id: 'loc-13', name: 'Roma', type: 'city', country: 'İtalya', countryCode: 'IT', hotelCount: 2800 },
  { id: 'loc-14', name: 'Barcelona', type: 'city', country: 'İspanya', countryCode: 'ES', hotelCount: 2100 },
  { id: 'loc-15', name: 'Viyana', type: 'city', country: 'Avusturya', countryCode: 'AT', hotelCount: 980 }
];

// Gecikme simülasyonu
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Demo Otel Arama
 */
export async function searchHotelsDemo(params: HotelSearchParams): Promise<HotelSearchResult> {
  await delay(500);

  let filteredHotels = [...DEMO_HOTELS];

  // Konum filtresi
  if (params.location) {
    const locationLower = params.location.toLowerCase();
    filteredHotels = filteredHotels.filter(hotel => 
      hotel.location.city.toLowerCase().includes(locationLower) ||
      hotel.location.country?.toLowerCase().includes(locationLower)
    );
  }

  // Fiyat filtresi
  if (params.filters?.priceRange) {
    filteredHotels = filteredHotels.filter(hotel =>
      hotel.priceRange.min >= (params.filters?.priceRange?.min || 0) &&
      hotel.priceRange.max <= (params.filters?.priceRange?.max || Infinity)
    );
  }

  // Yıldız filtresi
  if (params.filters?.rating && params.filters.rating.length > 0) {
    filteredHotels = filteredHotels.filter(hotel =>
      params.filters?.rating?.includes(hotel.rating)
    );
  }

  // Amenity filtresi
  if (params.filters?.amenities && params.filters.amenities.length > 0) {
    filteredHotels = filteredHotels.filter(hotel =>
      params.filters?.amenities?.every(amenity => hotel.amenities.includes(amenity))
    );
  }

  // Sıralama
  if (params.filters?.sortBy) {
    switch (params.filters.sortBy) {
      case 'price_asc':
        filteredHotels.sort((a, b) => a.priceRange.min - b.priceRange.min);
        break;
      case 'price_desc':
        filteredHotels.sort((a, b) => b.priceRange.min - a.priceRange.min);
        break;
      case 'rating':
        filteredHotels.sort((a, b) => (b.reviewScore || 0) - (a.reviewScore || 0));
        break;
      case 'distance':
        filteredHotels.sort((a, b) => (a.location.distanceFromCenter || 0) - (b.location.distanceFromCenter || 0));
        break;
      default:
        filteredHotels.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }
  }

  // Tüm otellerdeki amenity'leri topla
  const allAmenities = new Set<string>();
  DEMO_HOTELS.forEach(hotel => hotel.amenities.forEach(a => allAmenities.add(a)));

  // Tüm otel zincirlerini topla
  const allChains = new Set<string>();
  DEMO_HOTELS.forEach(hotel => hotel.hotelChain && allChains.add(hotel.hotelChain));

  return {
    hotels: filteredHotels,
    totalCount: filteredHotels.length,
    searchParams: params,
    filters: {
      availableAmenities: Array.from(allAmenities),
      priceRange: {
        min: Math.min(...DEMO_HOTELS.map(h => h.priceRange.min)),
        max: Math.max(...DEMO_HOTELS.map(h => h.priceRange.max))
      },
      availableChains: Array.from(allChains)
    }
  };
}

/**
 * Demo Otel Detayları
 */
export async function getHotelDetailsDemo(hotelId: string): Promise<HotelDetails | null> {
  await delay(300);

  const hotel = DEMO_HOTELS.find(h => h.id === hotelId);
  if (!hotel) return null;

  const rooms = DEMO_ROOMS[hotelId] || generateDefaultRooms(hotel);

  return {
    ...hotel,
    description: hotel.description || `${hotel.name}, ${hotel.location.city} şehrinde ${hotel.rating} yıldızlı lüks bir oteldir.`,
    rooms,
    policies: {
      cancellation: '48 saat öncesine kadar ücretsiz iptal',
      checkIn: '14:00',
      checkOut: '11:00',
      petsAllowed: false,
      smokingAllowed: false,
      childrenAllowed: true,
      paymentMethods: ['Credit Card', 'Debit Card', 'Cash']
    },
    reviews: generateDemoReviews(5),
    nearbyAttractions: [
      { name: 'Şehir Merkezi', distance: `${hotel.location.distanceFromCenter} km` },
      { name: 'Havalimanı', distance: '25 km' },
      { name: 'Alışveriş Merkezi', distance: '1.5 km' }
    ]
  };
}

/**
 * Demo Konum Arama
 */
export async function searchLocationsDemo(query: string): Promise<LocationSuggestion[]> {
  await delay(200);

  if (!query || query.length < 2) return [];

  const queryLower = query.toLowerCase();
  return DEMO_LOCATIONS.filter(loc =>
    loc.name.toLowerCase().includes(queryLower) ||
    loc.country.toLowerCase().includes(queryLower)
  ).slice(0, 8);
}

/**
 * Demo Rezervasyon Oluşturma
 */
export async function createBookingDemo(request: BookingRequest): Promise<BookingResponse> {
  await delay(1000);

  const hotel = DEMO_HOTELS.find(h => h.id === request.hotelId);
  if (!hotel) {
    throw new Error('Otel bulunamadı');
  }

  const rooms = DEMO_ROOMS[request.hotelId] || generateDefaultRooms(hotel);
  const room = rooms.find(r => r.id === request.roomTypeId);
  if (!room) {
    throw new Error('Oda tipi bulunamadı');
  }

  const rate = room.rates.find(r => r.id === request.rateId);
  if (!rate) {
    throw new Error('Fiyat seçeneği bulunamadı');
  }

  const checkIn = new Date(request.checkIn);
  const checkOut = new Date(request.checkOut);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  const totalPrice = rate.price * nights * request.guests.rooms;

  const guestInfoForResponse = request.guestInfo ?? (request.guestDetails && request.guestDetails.length > 0 && request.contactInfo
    ? {
        firstName: request.guestDetails[0].firstName,
        lastName: request.guestDetails[0].lastName,
        email: request.contactInfo.email,
        phone: request.contactInfo.phone,
        countryCode: request.contactInfo.countryCode,
      }
    : undefined);

  if (!guestInfoForResponse) {
    throw new Error('Misafir bilgileri gereklidir');
  }

  return {
    bookingId: `BK${Date.now()}`,
    confirmationNumber: `GRB${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    hotel,
    room,
    rate,
    checkIn: request.checkIn,
    checkOut: request.checkOut,
    nights,
    totalPrice,
    currency: rate.currency,
    status: 'confirmed',
    guestInfo: guestInfoForResponse,
    guestDetails: request.guestDetails,
    createdAt: new Date().toISOString()
  };
}

/**
 * Demo Rezervasyon İptali
 */
export async function cancelBookingDemo(bookingId: string): Promise<CancelResponse> {
  await delay(500);

  return {
    success: true,
    bookingId,
    refundAmount: 250,
    refundCurrency: 'EUR',
    message: 'Rezervasyonunuz başarıyla iptal edildi. İade tutarı 3-5 iş günü içinde hesabınıza yatırılacaktır.'
  };
}

// Yardımcı Fonksiyonlar

function generateDefaultRooms(hotel: Hotel): RoomType[] {
  const basePrice = hotel.priceRange.min;
  return [
    {
      id: `${hotel.id}-room-1`,
      name: 'Standard Room',
      description: 'Konforlu standart oda',
      maxOccupancy: 2,
      bedType: '1 Double Bed',
      size: 28,
      amenities: ['WiFi', 'TV', 'Air Conditioning', 'Safe'],
      images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
      rates: [
        { id: `${hotel.id}-rate-1`, name: 'Sadece Oda', price: basePrice, currency: 'EUR', cancellationPolicy: 'free', mealPlan: 'room_only', availability: true, roomsLeft: 5 },
        { id: `${hotel.id}-rate-2`, name: 'Kahvaltı Dahil', price: basePrice + 25, currency: 'EUR', cancellationPolicy: 'free', mealPlan: 'breakfast', availability: true, roomsLeft: 5 }
      ]
    },
    {
      id: `${hotel.id}-room-2`,
      name: 'Superior Room',
      description: 'Geniş ve ferah superior oda',
      maxOccupancy: 3,
      bedType: '1 King Bed',
      size: 35,
      amenities: ['WiFi', 'TV', 'Air Conditioning', 'Safe', 'Mini Bar', 'City View'],
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
      rates: [
        { id: `${hotel.id}-rate-3`, name: 'Sadece Oda', price: basePrice + 50, currency: 'EUR', cancellationPolicy: 'free', mealPlan: 'room_only', availability: true, roomsLeft: 3 },
        { id: `${hotel.id}-rate-4`, name: 'Kahvaltı Dahil', price: basePrice + 80, currency: 'EUR', cancellationPolicy: 'free', mealPlan: 'breakfast', availability: true, roomsLeft: 3 }
      ]
    }
  ];
}

function generateDemoReviews(count: number): Review[] {
  const names = ['Ahmet Y.', 'Mehmet K.', 'Ayşe S.', 'Fatma B.', 'Ali D.', 'Zeynep T.', 'Mustafa A.', 'Elif G.'];
  const comments = [
    'Harika bir deneyimdi, kesinlikle tekrar geleceğim!',
    'Personel çok ilgili ve yardımseverdi.',
    'Oda temiz ve konforluydu.',
    'Kahvaltı çeşitleri mükemmeldi.',
    'Konum çok merkezi, her yere yakın.',
    'Fiyat/performans oranı çok iyi.',
    'Havuz ve spa alanı harikaydı.',
    'Manzara muhteşemdi.'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `review-${i}`,
    author: names[i % names.length],
    rating: 7 + Math.floor(Math.random() * 3),
    comment: comments[i % comments.length],
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    verified: Math.random() > 0.3
  }));
}

