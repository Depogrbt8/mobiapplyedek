import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@/constants/colors';
import { apiClient } from '@/core/api/client';
import { TabType, FlightReservation, HotelReservation, CarReservation } from '@/types/travel';
import {
  TripTabSelector,
  FlightReservationCard,
  HotelReservationCard,
  CarReservationCard,
  TripEmptyState,
} from './components';

// Demo otel verileri
const DEMO_HOTELS: HotelReservation[] = [
  {
    id: 'h1',
    hotelName: 'Grand Hyatt Berlin',
    location: 'Berlin, Almanya',
    address: 'Unter den Linden 77, 10117 Berlin',
    phone: '+49 30 25990',
    checkIn: '2024-08-15',
    checkOut: '2024-08-18',
    roomType: 'Deluxe Oda, Deniz Manzaralı',
    guests: [
      { name: 'Ali İncesu', type: 'Yetişkin' },
      { name: 'Ayşe Yılmaz', type: 'Yetişkin' },
    ],
    price: '4.500 TL',
    status: 'Onaylandı',
    reservationNo: 'HTL987654',
    payment: 'Kredi Kartı',
    rules: 'İptal ve iade girişten 24 saat öncesine kadar ücretsizdir.',
    services: ['Kahvaltı dahil', 'Ücretsiz Wi-Fi', 'Havuz', 'Otopark'],
    checkInTime: '14:00',
    checkOutTime: '12:00',
    notes: 'Yüksek kat, sigara içilmeyen oda talep edildi.',
  },
];

// Demo araç verileri
const DEMO_CARS: CarReservation[] = [
  {
    id: 'c1',
    car: 'Volkswagen Golf',
    type: 'Ekonomi, Dizel, Otomatik',
    plate: '34 ABC 123',
    pickupLocation: 'Sabiha Gökçen Havalimanı',
    pickupCity: 'İstanbul',
    pickupDate: '2024-09-01',
    pickupTime: '10:00',
    dropoffLocation: 'Esenboğa Havalimanı',
    dropoffCity: 'Ankara',
    dropoffDate: '2024-09-05',
    dropoffTime: '14:00',
    price: '2.100 TL',
    status: 'Onaylandı',
    reservationNo: 'CAR456789',
    payment: 'Kredi Kartı',
    services: ['Ek Sürücü', 'Çocuk Koltuğu', 'Tam Sigorta'],
    renter: 'Ali İncesu',
    rules: 'Araç en az %25 yakıt ile teslim edilmelidir. İptal 24 saat öncesine kadar ücretsizdir.',
    officePhone: '+90 216 123 45 67',
    notes: 'Beyaz renk, navigasyon opsiyonel.',
  },
];

export const MyTripsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('ucak');
  const [refreshing, setRefreshing] = useState(false);

  // Uçuş rezervasyonları
  const [flightReservations, setFlightReservations] = useState<FlightReservation[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(true);
  const [airRules, setAirRules] = useState<{ [flightId: string]: any[] }>({});
  const [airRulesLoading, setAirRulesLoading] = useState<string | null>(null);
  const [airRulesError, setAirRulesError] = useState<string | null>(null);

  // Otel ve araç rezervasyonları (şimdilik demo)
  const [hotelReservations] = useState<HotelReservation[]>(DEMO_HOTELS);
  const [carReservations] = useState<CarReservation[]>(DEMO_CARS);

  // Uçuş rezervasyonlarını API'den çek
  const fetchFlightReservations = useCallback(async () => {
    setLoadingFlights(true);
    try {
      const response = await apiClient.get('/reservations?type=flight');
      const reservations = response?.data;

      if (!reservations || !Array.isArray(reservations) || reservations.length === 0) {
        setFlightReservations([]);
        return;
      }

      const results: FlightReservation[] = reservations
        .filter((reservation: any) => reservation && typeof reservation === 'object')
        .map((reservation: any) => {
          // passengers parsing - güvenli
          let passengers: Passenger[] = [];
          if (reservation.passengers) {
            try {
              if (typeof reservation.passengers === 'string') {
                const parsed = JSON.parse(reservation.passengers);
                if (Array.isArray(parsed)) {
                  passengers = parsed
                    .filter((p: any) => p && typeof p === 'object')
                    .map((p: any) => ({
                      name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Yolcu',
                      seat: p.seat || '12A',
                      baggage: '20kg',
                      ticketType: 'Ekonomi',
                    }));
                }
              } else if (Array.isArray(reservation.passengers)) {
                passengers = reservation.passengers
                  .filter((p: any) => p && typeof p === 'object')
                  .map((p: any) => ({
                    name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Yolcu',
                    seat: p.seat || '12A',
                    baggage: '20kg',
                    ticketType: 'Ekonomi',
                  }));
              }
            } catch (e) {
              console.error('Passengers parse error:', e);
              passengers = [];
            }
          }

          return {
            id: reservation.id || String(Date.now()),
            pnr: reservation.pnr || 'N/A',
            airline: reservation.airline || 'Turkish Airlines',
            from: reservation.origin || 'IST',
            to: reservation.destination || 'AMS',
            date: reservation.departureTime || '',
            time: reservation.departureTime
              ? new Date(reservation.departureTime).toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '',
            arrivalTime: reservation.arrivalTime
              ? new Date(reservation.arrivalTime).toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '',
            price: `${reservation.amount || 0} ${reservation.currency || 'TL'}`,
            status: reservation.status === 'confirmed' ? 'Onaylandı' : 'Beklemede',
            passengers,
            details: {
              payment: 'Kredi Kartı',
              rules: 'İade edilemez, değiştirilemez.',
            },
          };
        });
      
      setFlightReservations(results);
    } catch (error: any) {
      // 401 (Unauthorized) hatası için sessizce boş liste göster
      // Diğer hatalar için console'a log at (development için)
      if (error?.status === 401 || error?.response?.status === 401) {
        // Kullanıcı giriş yapmamış veya token geçersiz
        // Sessizce boş liste göster, hata mesajı gösterme
        setFlightReservations([]);
      } else {
        // Diğer hatalar için log (development'ta görmek için)
        if (__DEV__) {
          console.error('Rezervasyonlar yüklenirken hata:', error);
        }
        setFlightReservations([]);
      }
    } finally {
      setLoadingFlights(false);
    }
  }, []);

  useEffect(() => {
    fetchFlightReservations();
  }, [fetchFlightReservations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFlightReservations();
    setRefreshing(false);
  }, [fetchFlightReservations]);

  // Uçuş detayı açıldığında kuralları yükle
  const handleOpenFlightDetail = async (flight: FlightReservation) => {
    setAirRulesError(null);
    setAirRulesLoading(flight.id);
    try {
      // TODO: API'den kuralları çek
      // const rules = await apiClient.get(`/flights/${flight.id}/rules`);
      // setAirRules(prev => ({ ...prev, [flight.id]: rules.data }));
      
      // Şimdilik demo kural
      setAirRules((prev) => ({
        ...prev,
        [flight.id]: [
          { title: 'İptal', detail: 'İptal ücreti 50 EUR\'dur.' },
          { title: 'Değişiklik', detail: 'Değişiklik ücreti 30 EUR\'dur.' },
        ],
      }));
    } catch (e: any) {
      setAirRulesError('Kural bilgisi alınamadı.');
    } finally {
      setAirRulesLoading(null);
    }
  };

  // Navigation handlers
  const handleSearchFlight = () => {
    // @ts-ignore
    navigation.navigate('Home');
  };

  const handleSearchHotel = () => {
    // @ts-ignore
    navigation.navigate('Home');
  };

  const handleSearchCar = () => {
    // @ts-ignore
    navigation.navigate('Home');
  };

  // Uçak içeriği
  const renderFlightContent = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Uçak Rezervasyonlarım</Text>
      {loadingFlights ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.loadingText}>Rezervasyonlarınız yükleniyor...</Text>
        </View>
      ) : flightReservations.length === 0 ? (
        <TripEmptyState type="ucak" onAction={handleSearchFlight} />
      ) : (
        flightReservations.map((flight) => (
          <FlightReservationCard
            key={flight.id}
            flight={flight}
            airRules={airRules[flight.id]}
            airRulesLoading={airRulesLoading === flight.id}
            airRulesError={airRulesError}
            onOpenDetail={handleOpenFlightDetail}
          />
        ))
      )}
    </View>
  );

  // Otel içeriği
  const renderHotelContent = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Otel Rezervasyonlarım</Text>
      {hotelReservations.length === 0 ? (
        <TripEmptyState type="otel" onAction={handleSearchHotel} />
      ) : (
        hotelReservations.map((hotel) => (
          <HotelReservationCard key={hotel.id} hotel={hotel} />
        ))
      )}
    </View>
  );

  // Araç içeriği
  const renderCarContent = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Araç Rezervasyonlarım</Text>
      {carReservations.length === 0 ? (
        <TripEmptyState type="arac" onAction={handleSearchCar} />
      ) : (
        carReservations.map((car) => <CarReservationCard key={car.id} car={car} />)
      )}
    </View>
  );

  // E-sim içeriği
  const renderEsimContent = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>E-sim Satın Alımlarım</Text>
      <TripEmptyState type="esim" />
    </View>
  );

  // İçerik seçici
  const renderContent = () => {
    switch (activeTab) {
      case 'ucak':
        return renderFlightContent();
      case 'otel':
        return renderHotelContent();
      case 'arac':
        return renderCarContent();
      case 'esim':
        return renderEsimContent();
      default:
        return <TripEmptyState type="default" />;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary[600]]}
          tintColor={colors.primary[600]}
        />
      }
    >
      {/* Sekmeler */}
      <TripTabSelector activeTab={activeTab} onTabChange={setActiveTab} />

      {/* İçerik */}
      {renderContent()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  contentSection: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.text.secondary,
  },
});

