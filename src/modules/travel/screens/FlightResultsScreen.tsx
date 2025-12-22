import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { addDays, isSameDay, parseISO, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CompactFlightCard } from '../components/CompactFlightCard';
import { PriceDateSelector } from '../components/PriceDateSelector';
import { FlightResultsHeader } from '../components/FlightResultsHeader';
import { FlightFilters } from '../components/FlightFilters';
import { FlightBrandOptions } from '../components/FlightBrandOptions';
import { FlightSearchForm } from '../components/FlightSearchForm';
import { PriceAlertBox } from '../components/PriceAlertBox';
import { SearchFavoriteBox } from '../components/SearchFavoriteBox';
import type { FlightBrand } from '@/types/flight';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { useTravelStore } from '../store/travelStore';
import { flightService } from '../services/flightService';
import type { Flight, FlightSearchQuery, Airport } from '@/types/flight';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';

type RouteProp = RouteProp<TravelStackParamList, 'Travel/FlightResults'>;
type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/FlightResults'>;

interface PriceDate {
  date: Date;
  price: number;
  currency: string;
}

export const FlightResultsScreen: React.FC = () => {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { searchParams } = route.params;

  const { flights, isLoading, error, setFlights, setLoading, setError, setSelectedFlight } =
    useTravelStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    return searchParams.departureDate ? parseISO(searchParams.departureDate) : new Date();
  });
  const [departurePrices, setDeparturePrices] = useState<PriceDate[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [errorPrices, setErrorPrices] = useState<string | null>(null);

  // Modal states
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [showFavorite, setShowFavorite] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [selectedFlightForBrand, setSelectedFlightForBrand] = useState<Flight | null>(null);
  const editModalSlideAnim = useRef(new Animated.Value(-1000)).current;

  // Filter states
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [departureHourRange, setDepartureHourRange] = useState<[number, number]>([0, 24]);
  const [arrivalHourRange, setArrivalHourRange] = useState<[number, number]>([0, 24]);
  const [flightDurationRange, setFlightDurationRange] = useState<[number, number]>([0, 24]);
  const [maxStops, setMaxStops] = useState<number>(2);
  const [selectedCabinClass, setSelectedCabinClass] = useState<string>('economy');
  const [sortOption, setSortOption] = useState<'price' | 'duration' | 'departureTime'>('price');

  // Fiyatları çek (demo - gerçek API entegrasyonu için hazır)
  useEffect(() => {
    fetchPrices();
  }, [searchParams.origin, searchParams.destination]);

  const fetchPrices = async () => {
    setLoadingPrices(true);
    setErrorPrices(null);
    try {
      // Demo: Tarih fiyatlarını oluştur
      const baseDate = searchParams.departureDate ? parseISO(searchParams.departureDate) : new Date();
      const prices: PriceDate[] = Array.from({ length: 10 }, (_, i) => {
        const date = addDays(baseDate, i - 3);
        const price = 90 + Math.floor(Math.abs(Math.sin(date.getTime() / 1e9)) * 60);
        return {
          date,
          price,
          currency: 'EUR',
        };
      });
      setDeparturePrices(prices);
    } catch (err: any) {
      setErrorPrices(err.message || 'Fiyatlar yüklenemedi');
    } finally {
      setLoadingPrices(false);
    }
  };

  useEffect(() => {
    searchFlights();
  }, []);

  // Modal açıldığında animasyonu başlat
  useEffect(() => {
    if (showEditModal) {
      // Animasyonu başlangıç pozisyonuna getir (yukarıda)
      editModalSlideAnim.setValue(-1000);
      // Kısa gecikme sonrası animasyonu başlat (modal render olsun diye)
      const timer = setTimeout(() => {
        Animated.spring(editModalSlideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }).start();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Modal kapandığında animasyonu sıfırla
      editModalSlideAnim.setValue(-1000);
    }
  }, [showEditModal]);

  // Demo veriler - API'den veri gelmezse göster
  useEffect(() => {
    if (flights.length === 0 && !isLoading && !error) {
      // Demo uçuş verileri
      const demoFlights: Flight[] = [
        {
          id: '1',
          airlineName: 'Turkish Airlines',
          flightNumber: 'TK1234',
          origin: searchParams.origin || 'IST',
          destination: searchParams.destination || 'SAW',
          departureTime: new Date().toISOString(),
          arrivalTime: new Date(Date.now() + 80 * 60 * 1000).toISOString(),
          duration: '1h 20m',
          price: 120,
          currency: 'EUR',
          direct: true,
          baggage: '15 kg',
        },
        {
          id: '2',
          airlineName: 'SunExpress',
          flightNumber: 'XQ567',
          origin: searchParams.origin || 'IST',
          destination: searchParams.destination || 'SAW',
          departureTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          arrivalTime: new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString(),
          duration: '1h 30m',
          price: 99,
          currency: 'EUR',
          direct: true,
          baggage: '20 kg',
        },
        {
          id: '3',
          airlineName: 'Pegasus',
          flightNumber: 'PC890',
          origin: searchParams.origin || 'IST',
          destination: searchParams.destination || 'SAW',
          departureTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          arrivalTime: new Date(Date.now() + 9.2 * 60 * 60 * 1000).toISOString(),
          duration: '1h 12m',
          price: 105,
          currency: 'EUR',
          direct: true,
          baggage: '10 kg',
        },
      ];
      setFlights(demoFlights);
    }
  }, [flights.length, isLoading, error, searchParams.origin, searchParams.destination]);

  const searchFlights = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await flightService.searchFlights(searchParams);
      setFlights(results);
    } catch (err: any) {
      // 401 hatası için sessizce boş liste göster
      if (err?.status === 401 || err?.response?.status === 401) {
        setFlights([]);
      } else {
        setError(err.message || 'Uçuş araması başarısız oldu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([searchFlights(), fetchPrices()]);
    setRefreshing(false);
  };

  const handleFlightPress = (flight: Flight) => {
    // Uçuşa tıklandığında paket seçim modalını aç
    setSelectedFlightForBrand(flight);
    setShowBrandModal(true);
  };

  const handleBrandSelect = (brand: FlightBrand) => {
    // Paket seçildiğinde rezervasyon ekranına git
    if (selectedFlightForBrand) {
      setSelectedFlight({ ...selectedFlightForBrand, selectedBrand: brand });
      navigation.navigate('Travel/Reservation', {
        flight: { ...selectedFlightForBrand, selectedBrand: brand },
      });
      setShowBrandModal(false);
      setSelectedFlightForBrand(null);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Tarih değiştiğinde yeni arama yap
    const newParams: FlightSearchQuery = {
      ...searchParams,
      departureDate: format(date, 'yyyy-MM-dd'),
    };
    flightService.searchFlights(newParams).then(setFlights).catch((err) => {
      if (err?.status !== 401) {
        setError(err.message || 'Uçuş araması başarısız oldu');
      }
    });
  };

  const handleEditPress = () => {
    // Modal'ı göster
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    // Modal yukarıya kayarak kapansın
    Animated.timing(editModalSlideAnim, {
      toValue: -1000,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowEditModal(false);
      editModalSlideAnim.setValue(-1000);
    });
  };

  const handleEditSearch = async (searchQuery: FlightSearchQuery) => {
    handleCloseEditModal();
    // Yeni arama parametreleri ile uçuşları ara
    try {
      setLoading(true);
      setError(null);
      const results = await flightService.searchFlights(searchQuery);
      setFlights(results);
      
      // Tarih fiyatlarını güncelle
      await fetchPrices();
      
      // Seçili tarihi güncelle
      if (searchQuery.departureDate) {
        setSelectedDate(parseISO(searchQuery.departureDate));
      }
      
      // Route params'ı güncelle - yeni arama parametreleri ile ekranı yeniden yükle
      navigation.setParams({ searchParams: searchQuery });
    } catch (err: any) {
      if (err?.status === 401 || err?.response?.status === 401) {
        setFlights([]);
      } else {
        setError(err.message || 'Uçuş araması başarısız oldu');
      }
    } finally {
      setLoading(false);
    }
  };

  // Mevcut search params'ı Airport objelerine çevir
  const getInitialAirport = (code: string) => {
    if (!code) return null;
    // Basit bir Airport objesi oluştur (gerçek uygulamada API'den alınabilir)
    return {
      code,
      name: code, // Geçici olarak code'u name olarak kullan
      city: code,
    };
  };

  // Filtrelenmiş ve sıralanmış uçuşlar
  const filteredAndSortedFlights = useMemo(() => {
    let filtered = flights;

    // Havayolu filtresi
    if (selectedAirlines.length > 0) {
      filtered = filtered.filter((f) => selectedAirlines.includes(f.airlineName));
    }

    // Fiyat filtresi
    filtered = filtered.filter((f) => f.price <= maxPrice);

    // Kalkış saati filtresi
    filtered = filtered.filter((f) => {
      const departureHour = new Date(f.departureTime).getHours();
      return departureHour >= departureHourRange[0] && departureHour <= departureHourRange[1];
    });

    // Varış saati filtresi
    filtered = filtered.filter((f) => {
      const arrivalHour = new Date(f.arrivalTime).getHours();
      return arrivalHour >= arrivalHourRange[0] && arrivalHour <= arrivalHourRange[1];
    });

    // Uçuş süresi filtresi
    filtered = filtered.filter((f) => {
      const parseDuration = (dur: string): number => {
        const hoursMatch = dur.match(/(\d+)h/);
        const minutesMatch = dur.match(/(\d+)m/);
        const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
        return hours + minutes / 60;
      };
      const durationHours = parseDuration(f.duration);
      return durationHours >= flightDurationRange[0] && durationHours <= flightDurationRange[1];
    });

    // Aktarma filtresi
    filtered = filtered.filter((f) => {
      const stops = f.direct ? 0 : 1; // Basit bir yaklaşım - gerçek uygulamada stops bilgisi API'den gelmeli
      return stops <= maxStops;
    });

    // Sıralama
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'price':
          return a.price - b.price;
        case 'duration': {
          const parseDuration = (dur: string): number => {
            const hoursMatch = dur.match(/(\d+)h/);
            const minutesMatch = dur.match(/(\d+)m/);
            const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
            const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
            return hours * 60 + minutes;
          };
          return parseDuration(a.duration) - parseDuration(b.duration);
        }
        case 'departureTime':
          return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [
    flights,
    selectedAirlines,
    maxPrice,
    departureHourRange,
    arrivalHourRange,
    flightDurationRange,
    maxStops,
    sortOption,
  ]);

  // Fiyat aralığını hesapla
  const calculatedPriceRange = useMemo(() => {
    if (flights.length === 0) return [0, 1000] as [number, number];
    const prices = flights.map((f) => f.price);
    return [Math.min(...prices), Math.max(...prices)] as [number, number];
  }, [flights]);

  useEffect(() => {
    if (calculatedPriceRange[1] > 0) {
      setPriceRange(calculatedPriceRange);
      setMaxPrice(calculatedPriceRange[1]);
    }
  }, [calculatedPriceRange]);

  if (isLoading && flights.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Uçuşlar aranıyor...</Text>
      </View>
    );
  }

  if (error && flights.length === 0) {
    return (
      <ErrorDisplay error={error} onRetry={searchFlights} />
    );
  }

  // Status bar yüksekliğine göre sabit padding
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {/* Status bar için padding */}
      <View style={{ height: statusBarHeight }} />
      
      {/* Header */}
      <View style={styles.headerWrapper}>
        <FlightResultsHeader
          origin={searchParams.origin}
          destination={searchParams.destination}
          departureDate={searchParams.departureDate}
          passengersCount={searchParams.passengers}
          onEditPress={handleEditPress}
        />
      </View>

      {/* Tarih seçici */}
      <PriceDateSelector
        origin={searchParams.origin}
        destination={searchParams.destination}
        departurePrices={departurePrices}
        selectedDeparture={selectedDate}
        onDateSelect={handleDateSelect}
        loadingPrices={loadingPrices}
        errorPrices={errorPrices}
        onOpenPriceAlert={() => setShowPriceAlert(true)}
        onOpenFavorite={() => setShowFavorite(true)}
        onOpenMobileFilter={() => setShowFilters(true)}
        onOpenSort={() => setShowSort(true)}
      />

      {/* Uçuş listesi */}
      <FlatList
        data={filteredAndSortedFlights}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CompactFlightCard
            flight={item}
            onPress={() => handleFlightPress(item)}
            isSelected={false}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[600]]}
            tintColor={colors.primary[600]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Uçuş bulunamadı</Text>
            <Text style={styles.emptySubtext}>
              Farklı tarih veya havalimanı deneyin
            </Text>
          </View>
        }
      />

      {/* Filtreler Modal */}
      <Modal
        visible={showFilters}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <SafeAreaView style={styles.modalOverlayCenter}>
          <View style={styles.modalContentCenterLarge}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtreler</Text>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <FlightFilters
                flights={flights}
                selectedAirlines={selectedAirlines}
                onAirlinesChange={setSelectedAirlines}
                maxPrice={maxPrice}
                onMaxPriceChange={setMaxPrice}
                priceRange={priceRange}
                departureHourRange={departureHourRange}
                onDepartureHourRangeChange={setDepartureHourRange}
                arrivalHourRange={arrivalHourRange}
                onArrivalHourRangeChange={setArrivalHourRange}
                flightDurationRange={flightDurationRange}
                onFlightDurationRangeChange={setFlightDurationRange}
                maxStops={maxStops}
                onMaxStopsChange={setMaxStops}
                selectedCabinClass={selectedCabinClass}
                onCabinClassChange={setSelectedCabinClass}
                onApply={() => setShowFilters(false)}
                onReset={() => {
                  setSelectedAirlines([]);
                  setMaxPrice(priceRange[1]);
                  setDepartureHourRange([0, 24]);
                  setArrivalHourRange([0, 24]);
                  setFlightDurationRange([0, 24]);
                  setMaxStops(2);
                  setSelectedCabinClass('economy');
                  setShowFilters(false);
                }}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Sıralama Modal */}
      <Modal
        visible={showSort}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSort(false)}
      >
        <SafeAreaView style={styles.modalOverlayCenter}>
          <View style={styles.modalContentCenter}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sıralama</Text>
              <TouchableOpacity
                onPress={() => setShowSort(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.modalBody} 
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={true}
            >
              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => {
                  setSortOption('price');
                  setShowSort(false);
                }}
              >
                <View style={styles.radioContainer}>
                  <View style={[styles.radio, sortOption === 'price' && styles.radioSelected]}>
                    {sortOption === 'price' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.sortOptionText}>Fiyata göre sırala (En düşük fiyat)</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => {
                  setSortOption('duration');
                  setShowSort(false);
                }}
              >
                <View style={styles.radioContainer}>
                  <View style={[styles.radio, sortOption === 'duration' && styles.radioSelected]}>
                    {sortOption === 'duration' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.sortOptionText}>Uçuş süresine göre sırala (En kısa süre)</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => {
                  setSortOption('departureTime');
                  setShowSort(false);
                }}
              >
                <View style={styles.radioContainer}>
                  <View style={[styles.radio, sortOption === 'departureTime' && styles.radioSelected]}>
                    {sortOption === 'departureTime' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.sortOptionText}>Kalkış saatine göre sırala (En erken kalkış)</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Fiyat Alarmı Modal */}
      <Modal
        visible={showPriceAlert}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPriceAlert(false)}
      >
        <SafeAreaView style={styles.modalOverlayCenter}>
          <View style={styles.modalContentCenter}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Fiyat Alarmı</Text>
              <TouchableOpacity
                onPress={() => setShowPriceAlert(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.modalBody} 
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={true}
            >
              <PriceAlertBox
                origin={searchParams.origin}
                destination={searchParams.destination}
                departureDate={searchParams.departureDate}
              />
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Favori Modal */}
      <Modal
        visible={showFavorite}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowFavorite(false)}
      >
        <SafeAreaView style={styles.modalOverlayCenter}>
          <View style={styles.modalContentCenter}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Favorilere Ekle</Text>
              <TouchableOpacity
                onPress={() => setShowFavorite(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.modalBody} 
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={true}
            >
              <SearchFavoriteBox
                origin={searchParams.origin}
                destination={searchParams.destination}
                departureDate={searchParams.departureDate}
              />
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Paket Seçim Modal */}
      {selectedFlightForBrand && (
        <FlightBrandOptions
          flight={selectedFlightForBrand}
          visible={showBrandModal}
          onClose={() => {
            setShowBrandModal(false);
            setSelectedFlightForBrand(null);
          }}
          onSelectBrand={handleBrandSelect}
        />
      )}

      {/* Düzenle Modal - Uçuş Arama Formu - Yukarıdan gelen popup */}
      <Modal
        visible={showEditModal}
        animationType="none"
        transparent={true}
        onRequestClose={handleCloseEditModal}
        statusBarTranslucent={true}
      >
        <View style={styles.editModalOverlay}>
          <TouchableOpacity
            style={styles.editModalOverlayTouchable}
            activeOpacity={1}
            onPress={handleCloseEditModal}
          />
          <Animated.View
            style={[
              styles.editModalContentWrapper,
              {
                transform: [{ translateY: editModalSlideAnim }],
              },
            ]}
          >
            <View style={styles.editModalContent}>
              <View style={styles.editModalHeader}>
                <Text style={styles.editModalTitle}>Aramayı Düzenle</Text>
                <TouchableOpacity
                  onPress={handleCloseEditModal}
                  style={styles.editModalCloseButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
              <ScrollView 
                style={styles.editModalScrollView}
                contentContainerStyle={styles.editModalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <FlightSearchForm
                  initialOrigin={getInitialAirport(searchParams.origin)}
                  initialDestination={getInitialAirport(searchParams.destination)}
                  initialDepartureDate={searchParams.departureDate ? parseISO(searchParams.departureDate) : null}
                  initialReturnDate={searchParams.returnDate ? parseISO(searchParams.returnDate) : null}
                  initialTripType={searchParams.tripType}
                  initialAdultCount={searchParams.passengers}
                  initialChildCount={0}
                  initialInfantCount={0}
                  onSearch={handleEditSearch}
                  onCancel={handleCloseEditModal}
                  showCancelButton={true}
                />
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrapper: {
    zIndex: 100,
    elevation: 100,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: 300,
    paddingBottom: 0,
    width: '100%',
    flexDirection: 'column',
  },
  modalContentCenter: {
    backgroundColor: colors.background,
    borderRadius: 20,
    maxHeight: '90%',
    minHeight: 200,
    width: '100%',
    maxWidth: 420,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    marginHorizontal: 8,
  },
  modalContentCenterLarge: {
    backgroundColor: colors.background,
    borderRadius: 20,
    maxHeight: '90%',
    minHeight: 300,
    width: '100%',
    maxWidth: 420,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    marginHorizontal: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    flexShrink: 1,
  },
  modalBodyContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalBodyText: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 8,
  },
  modalBodySubtext: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  sortContent: {
    padding: 20,
  },
  sortOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: colors.primary[600],
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary[600],
  },
  sortOptionText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  editModalOverlayTouchable: {
    flex: 1,
  },
  editModalContentWrapper: {
    width: '100%',
    maxHeight: '90%',
    marginTop: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  editModalContent: {
    backgroundColor: colors.background,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    maxHeight: '90%',
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.background,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  editModalCloseButton: {
    padding: 4,
  },
  editModalScrollView: {
    flex: 1,
  },
  editModalScrollContent: {
    paddingBottom: 20,
  },
});
