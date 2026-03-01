import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { AirportSearchInput } from '../components/AirportSearchInput';
import { DatePicker } from '../components/DatePicker';
import { PassengerSelector } from '../components/PassengerSelector';
import { useTravelStore } from '../store/travelStore';
import { searchHistoryService } from '@/services/searchHistoryService';
import type { Airport, FlightSearchQuery } from '@/types/flight';
import type { MainTabParamList, TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';

type NavigationProp = any;

interface FlightSearchScreenProps {
  initialParams?: {
    origin?: string;
    destination?: string;
    departureDate?: string;
    returnDate?: string;
    passengers?: number;
    tripType?: 'oneWay' | 'roundTrip';
  };
}

export const FlightSearchScreen: React.FC<FlightSearchScreenProps> = ({ initialParams }) => {
  const navigation = useNavigation<NavigationProp>();
  const { setSearchQuery } = useTravelStore();

  // Initial params'dan değerleri al ve parse et
  const getInitialAirport = (code?: string): Airport | null => {
    if (!code) return null;
    // Mock airport data'dan bul
    const mockAirports: Record<string, Airport> = {
      'IST': { code: 'IST', name: 'İstanbul Havalimanı', city: 'İstanbul', country: 'Türkiye' },
      'SAW': { code: 'SAW', name: 'Sabiha Gökçen', city: 'İstanbul', country: 'Türkiye' },
      'ESB': { code: 'ESB', name: 'Esenboğa', city: 'Ankara', country: 'Türkiye' },
      'ADB': { code: 'ADB', name: 'Adnan Menderes', city: 'İzmir', country: 'Türkiye' },
      'AYT': { code: 'AYT', name: 'Antalya', city: 'Antalya', country: 'Türkiye' },
      'BRU': { code: 'BRU', name: 'Brüksel', city: 'Brüksel', country: 'Belçika' },
    };
    return mockAirports[code] || null;
  };

  const [origin, setOrigin] = useState<Airport | null>(
    initialParams?.origin ? getInitialAirport(initialParams.origin) : null
  );
  const [destination, setDestination] = useState<Airport | null>(
    initialParams?.destination ? getInitialAirport(initialParams.destination) : null
  );
  const [departureDate, setDepartureDate] = useState<Date | null>(
    initialParams?.departureDate ? new Date(initialParams.departureDate) : null
  );
  const [returnDate, setReturnDate] = useState<Date | null>(
    initialParams?.returnDate ? new Date(initialParams.returnDate) : null
  );
  const [tripType, setTripType] = useState<'oneWay' | 'roundTrip'>(
    initialParams?.tripType || 'oneWay'
  );
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);

  const handleSearch = async () => {
    if (!origin || !destination || !departureDate) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (tripType === 'roundTrip' && !returnDate) {
      Alert.alert('Hata', 'Lütfen dönüş tarihi seçin');
      return;
    }

    const totalPassengers = adultCount + childCount + infantCount;
    const searchQuery: FlightSearchQuery = {
      origin: origin.code,
      destination: destination.code,
      departureDate: departureDate.toISOString().split('T')[0],
      returnDate: returnDate?.toISOString().split('T')[0],
      passengers: totalPassengers,
      tripType,
      directOnly: false,
      originAirport: origin, // Seçilen havaalanı bilgisini ekle
      destinationAirport: destination, // Seçilen havaalanı bilgisini ekle
    };

    setSearchQuery(searchQuery);

    // Save to search history
    try {
      await searchHistoryService.addSearch({
        origin: origin.code,
        destination: destination.code,
        departureDate: searchQuery.departureDate,
        returnDate: searchQuery.returnDate,
        passengers: totalPassengers,
        tripType,
      });
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }

    // FlightSearchScreen Home tab'ında render ediliyor
    // Home tab'ı bir screen olduğu için tab navigator'a direkt erişemiyoruz
    // CommonActions ile root navigator üzerinden Travel tab'ına ve içindeki stack'e navigate et
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Travel',
        params: {
          screen: 'Travel/FlightResults',
          params: { searchParams: searchQuery },
        },
      } as any)
    );
  };

  const isFormValid = origin && destination && departureDate && (tripType === 'oneWay' || returnDate);

  // Status bar yüksekliğine göre sabit padding
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Form Container with Border - Web sitesindeki gibi */}
        <View style={styles.formContainer}>
          {/* Trip Type Selector and Passenger Selector */}
          <View style={styles.tripTypeRow}>
          <View style={styles.tripTypeContainer}>
            <TouchableOpacity
              style={[styles.tripTypeButton, tripType === 'oneWay' && styles.tripTypeButtonActive]}
              onPress={() => {
                setTripType('oneWay');
                setReturnDate(null);
              }}
            >
              <View style={[styles.radioButton, tripType === 'oneWay' && styles.radioButtonActive]}>
                {tripType === 'oneWay' && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={[styles.tripTypeText, tripType === 'oneWay' && styles.tripTypeTextActive]}>
                Tek yön
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tripTypeButton, tripType === 'roundTrip' && styles.tripTypeButtonActive]}
              onPress={() => setTripType('roundTrip')}
            >
              <View style={[styles.radioButton, tripType === 'roundTrip' && styles.radioButtonActive]}>
                {tripType === 'roundTrip' && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={[styles.tripTypeText, tripType === 'roundTrip' && styles.tripTypeTextActive]}>
                Gidiş-dönüş
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Passenger Selector - Sağda */}
          <View style={styles.passengerSelectorInline}>
            <PassengerSelector
              adultCount={adultCount}
              childCount={childCount}
              infantCount={infantCount}
              onAdultCountChange={setAdultCount}
              onChildCountChange={setChildCount}
              onInfantCountChange={setInfantCount}
            />
          </View>
        </View>

        {/* Airport Inputs with Swap Button */}
        <View style={styles.airportContainer}>
          <View style={styles.airportInputWrapper}>
            <AirportSearchInput
              value={origin}
              onSelect={setOrigin}
              placeholder="Nereden"
              iconType="departure"
              zIndex={20}
            />
          </View>
          <TouchableOpacity
            style={styles.swapButton}
            onPress={() => {
              const temp = origin;
              setOrigin(destination);
              setDestination(temp);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="swap-vertical" size={20} color={colors.gray[500]} />
          </TouchableOpacity>
          <View style={[styles.airportInputWrapper, styles.airportInputWrapperLower]}>
            <AirportSearchInput
              value={destination}
              onSelect={setDestination}
              placeholder="Nereye"
              iconType="arrival"
              zIndex={10}
            />
          </View>
        </View>

        {/* Date Pickers */}
        <View style={styles.dateContainer}>
          <View style={styles.dateInputWrapper}>
            <DatePicker
              value={departureDate}
              onChange={setDepartureDate}
              minimumDate={new Date()}
              placeholder="Gidiş Tarihi"
            />
          </View>
          <View style={styles.dateInputWrapper}>
            <DatePicker
              value={returnDate}
              onChange={setReturnDate}
              minimumDate={departureDate || new Date()}
              placeholder="Dönüş Tarihi"
              disabled={tripType === 'oneWay'}
            />
          </View>
        </View>


          {/* Search Button */}
          <Button
            title="Uçuş Ara"
            onPress={handleSearch}
            disabled={!isFormValid}
            fullWidth
            style={styles.searchButton}
          />

          {/* Test Butonu - Demo Uçuş Sonuçlarını Gör */}
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => {
              const demoSearchParams: FlightSearchQuery = {
                origin: 'IST',
                destination: 'SAW',
                departureDate: new Date().toISOString().split('T')[0],
                passengers: 1,
                tripType: 'oneWay',
              };
              navigation.dispatch(
                CommonActions.navigate({
                  name: 'Travel/FlightResults' as never,
                  params: { searchParams: demoSearchParams } as never,
                })
              );
            }}
          >
            <Ionicons name="eye-outline" size={16} color={colors.primary[600]} />
            <Text style={styles.testButtonText}>Demo Uçuş Sonuçlarını Gör</Text>
          </TouchableOpacity>
        </View>

        {/* Service Buttons - Ana sitedeki gibi 2x2 grid */}
        <View style={styles.serviceButtonsContainer}>
          <TouchableOpacity
            style={styles.serviceButton}
            onPress={() => {
              // Profile tab'ına git ve CheckIn ekranını stack'e ekle
              navigation.navigate('Profile' as never, { screen: 'CheckIn' } as never);
            }}
          >
            <Ionicons name="airplane-outline" size={24} color={colors.primary[600]} />
            <Text style={styles.serviceButtonText}>Online Check-in</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.serviceButton}
            onPress={() => {
              // Profile tab'ına git ve PNRQuery ekranını stack'e ekle
              navigation.navigate('Profile' as never, { screen: 'PNRQuery' } as never);
            }}
          >
            <Ionicons name="search-outline" size={24} color={colors.primary[600]} />
            <Text style={styles.serviceButtonText}>PNR Sorgula</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.serviceButton}
            onPress={() => {
              // Profile tab'ına git ve CancelTicket ekranını stack'e ekle
              navigation.navigate('Profile' as never, { screen: 'CancelTicket' } as never);
            }}
          >
            <Ionicons name="close-circle-outline" size={24} color={colors.primary[600]} />
            <Text style={styles.serviceButtonText}>Biletimi İptal Et</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.serviceButton}
            onPress={() => {
              // Profile tab'ına git ve Help ekranını stack'e ekle
              navigation.navigate('Profile' as never, { screen: 'Help' } as never);
            }}
          >
            <Ionicons name="help-circle-outline" size={24} color={colors.primary[600]} />
            <Text style={styles.serviceButtonText}>Yardım</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 20, // Yuvarlak ikonlardan uzak
    paddingBottom: 32,
  },
  formContainer: {
    backgroundColor: colors.background,
    borderRadius: 16, // rounded-2xl (16px)
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 16, // p-4
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // Android için shadow-sm
    marginBottom: 16,
  },
  tripTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  passengerSelectorInline: {
    marginLeft: 12,
  },
  tripTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingLeft: 4,
    marginTop: 6,
  },
  tripTypeButtonActive: {
    // Active state handled by text color
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {
    backgroundColor: colors.primary[600],
  },
  radioButtonInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.background,
  },
  tripTypeText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text.primary,
  },
  tripTypeTextActive: {
    color: colors.text.primary,
  },
  airportContainer: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 12,
    position: 'relative',
    zIndex: 1,
    marginTop: 4,
  },
  airportInputWrapper: {
    width: '100%',
  },
  airportInputWrapperLower: {
    zIndex: 1, // Nereye input'u daha düşük z-index'te
  },
  swapButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -18 }],
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.gray[300],
    zIndex: 50,
    elevation: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dateInputWrapper: {
    flex: 1,
  },
  searchButton: {
    marginTop: 4,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    gap: 6,
  },
  testButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary[600],
  },
  serviceButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16, // Uçuş Ara butonuna yaklaştırıldı
    marginBottom: 16,
  },
  serviceButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.gray[100],
    minHeight: 80,
  },
  serviceButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 6,
    textAlign: 'center',
  },
});
