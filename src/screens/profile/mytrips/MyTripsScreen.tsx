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
import { reservationService } from '@/modules/travel/services/reservationService';
import { hotelBookingService } from '@/services/hotelBookingService';
import { TabType, FlightReservation, HotelReservation, CarReservation } from '@/types/travel';
import {
  TripTabSelector,
  FlightReservationCard,
  HotelReservationCard,
  CarReservationCard,
  TripEmptyState,
} from './components';

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

  // Otel ve araç rezervasyonları (gerçek API'den)
  const [hotelReservations, setHotelReservations] = useState<HotelReservation[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [carReservations, setCarReservations] = useState<CarReservation[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);

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

  // Otel rezervasyonlarını API'den çek - Desktop ile aynı: GET /api/hotels/bookings
  const fetchHotelReservations = useCallback(async () => {
    setLoadingHotels(true);
    try {
      const response = await hotelBookingService.getBookings();

      if (!response.success || !response.data?.bookings || response.data.bookings.length === 0) {
        setHotelReservations([]);
        return;
      }

      const bookings = response.data.bookings;

      const results: HotelReservation[] = bookings
        .filter((b: any) => b && typeof b === 'object')
        .map((b: any) => {
          // misafir bilgilerini parse et (desktop ile aynı format)
          let guestsList: { name: string; type: string }[] = [];
          if (b.guestDetails) {
            try {
              const details = typeof b.guestDetails === 'string' ? JSON.parse(b.guestDetails) : b.guestDetails;
              if (Array.isArray(details)) {
                guestsList = details.map((g: any) => ({
                  name: `${g.firstName || ''} ${g.lastName || ''}`.trim() || 'Misafir',
                  type: g.type === 'child' ? 'Çocuk' : 'Yetişkin',
                }));
              }
            } catch {}
          }
          if (guestsList.length === 0 && b.guestInfo) {
            try {
              const gi = typeof b.guestInfo === 'string' ? JSON.parse(b.guestInfo) : b.guestInfo;
              if (gi?.firstName || gi?.lastName) {
                guestsList = [{ name: `${gi.firstName || ''} ${gi.lastName || ''}`.trim() || 'Misafir', type: 'Yetişkin' }];
              }
            } catch {}
          }

          // Tarih formatı: ISO string'den YYYY-MM-DD
          const checkInDate = b.checkIn ? new Date(b.checkIn) : null;
          const checkOutDate = b.checkOut ? new Date(b.checkOut) : null;

          return {
            id: b.id,
            hotelName: b.hotelName || 'Otel',
            location: b.hotelLocation || '',
            address: b.hotelLocation || '',
            phone: '',
            checkIn: checkInDate?.toISOString().slice(0, 10) || '',
            checkOut: checkOutDate?.toISOString().slice(0, 10) || '',
            roomType: b.roomName || b.roomType || '',
            guests: guestsList,
            price: `${b.totalPrice ?? 0} ${b.currency ?? 'EUR'}`,
            status: b.status === 'confirmed' ? 'Onaylandı' : b.status === 'cancelled' ? 'İptal Edildi' : b.status === 'pending' ? 'Beklemede' : b.status || '',
            reservationNo: b.confirmationNumber || b.id,
            payment: 'Kredi Kartı',
            rules: b.cancellationPolicy || 'İptal politikası otel tarafından belirlenir.',
            services: [],
            checkInTime: '14:00',
            checkOutTime: '12:00',
            notes: b.specialRequests || '',
          };
        });

      setHotelReservations(results);
    } catch (error: any) {
      if (error?.status !== 401 && __DEV__) {
        console.error('Otel rezervasyonları yüklenirken hata:', error);
      }
      setHotelReservations([]);
    } finally {
      setLoadingHotels(false);
    }
  }, []);

  // Araç rezervasyonlarını API'den çek
  const fetchCarReservations = useCallback(async () => {
    setLoadingCars(true);
    try {
      const reservations = await reservationService.getReservations('car');
      if (!reservations || !Array.isArray(reservations) || reservations.length === 0) {
        setCarReservations([]);
        return;
      }

      const results: CarReservation[] = reservations
        .filter((r: any) => r && typeof r === 'object')
        .map((r: any) => ({
          id: r.id || String(Date.now()),
          car: r.carName || r.carModel || 'Araç',
          type: r.carType || '',
          plate: r.plate || '',
          pickupLocation: r.pickupLocation || '',
          pickupCity: r.pickupCity || '',
          pickupDate: r.pickupDate || '',
          pickupTime: r.pickupTime || '',
          dropoffLocation: r.dropoffLocation || '',
          dropoffCity: r.dropoffCity || '',
          dropoffDate: r.dropoffDate || '',
          dropoffTime: r.dropoffTime || '',
          price: `${r.amount || 0} ${r.currency || 'EUR'}`,
          status: r.status === 'confirmed' ? 'Onaylandı' : r.status === 'cancelled' ? 'İptal Edildi' : 'Beklemede',
          reservationNo: r.reservationNo || r.id || '',
          payment: r.paymentMethod || 'Kredi Kartı',
          services: [],
          renter: r.renterName || '',
          rules: '',
          officePhone: '',
          notes: r.notes || '',
        }));

      setCarReservations(results);
    } catch (error: any) {
      if (error?.status !== 401 && __DEV__) {
        console.error('Araç rezervasyonları yüklenirken hata:', error);
      }
      setCarReservations([]);
    } finally {
      setLoadingCars(false);
    }
  }, []);

  useEffect(() => {
    fetchFlightReservations();
    fetchHotelReservations();
    fetchCarReservations();
  }, [fetchFlightReservations, fetchHotelReservations, fetchCarReservations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchFlightReservations(),
      fetchHotelReservations(),
      fetchCarReservations(),
    ]);
    setRefreshing(false);
  }, [fetchFlightReservations, fetchHotelReservations, fetchCarReservations]);

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
      {loadingHotels ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.loadingText}>Otel rezervasyonlarınız yükleniyor...</Text>
        </View>
      ) : hotelReservations.length === 0 ? (
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
      {loadingCars ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.loadingText}>Araç rezervasyonlarınız yükleniyor...</Text>
        </View>
      ) : carReservations.length === 0 ? (
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

