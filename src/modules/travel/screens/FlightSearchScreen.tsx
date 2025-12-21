import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
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

export const FlightSearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setSearchQuery } = useTravelStore();

  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [tripType, setTripType] = useState<'oneWay' | 'roundTrip'>('oneWay');
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Trip Type Selector */}
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

        {/* Airport Inputs with Swap Button */}
        <View style={styles.airportContainer}>
          <View style={styles.airportInputWrapper}>
            <AirportSearchInput
              value={origin}
              onSelect={setOrigin}
              placeholder="Nereden"
              iconType="departure"
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
            <Ionicons name="swap-horizontal" size={20} color={colors.primary[600]} />
          </TouchableOpacity>
          <View style={styles.airportInputWrapper}>
            <AirportSearchInput
              value={destination}
              onSelect={setDestination}
              placeholder="Nereye"
              iconType="arrival"
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

        {/* Passenger Selector */}
        <View style={styles.passengerWrapper}>
          <PassengerSelector
            adultCount={adultCount}
            childCount={childCount}
            infantCount={infantCount}
            onAdultCountChange={setAdultCount}
            onChildCountChange={setChildCount}
            onInfantCountChange={setInfantCount}
          />
        </View>

        {/* Search Button */}
        <Button
          title="Uçuş Ara"
          onPress={handleSearch}
          disabled={!isFormValid}
          fullWidth
          style={styles.searchButton}
        />

        {/* Demo Butonu - Test için */}
        <TouchableOpacity
          style={styles.demoButton}
          onPress={() => {
            const demoQuery: FlightSearchQuery = {
              origin: 'IST',
              destination: 'SAW',
              departureDate: new Date().toISOString().split('T')[0],
              passengers: 1,
              tripType: 'oneWay',
              directOnly: false,
            };
            setSearchQuery(demoQuery);

            // FlightSearchScreen Home tab'ında render ediliyor
            // Home tab'ı bir screen olduğu için tab navigator'a direkt erişemiyoruz
            // CommonActions ile root navigator üzerinden Travel tab'ına ve içindeki stack'e navigate et
            navigation.dispatch(
              CommonActions.navigate({
                name: 'Travel',
                params: {
                  screen: 'Travel/FlightResults',
                  params: { searchParams: demoQuery },
                },
              } as any)
            );
          }}
        >
          <Text style={styles.demoButtonText}>📱 Demo: Sonuçları Göster</Text>
        </TouchableOpacity>

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
    paddingTop: 20,
    paddingBottom: 32,
  },
  tripTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    marginLeft: 0,
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
  },
  airportInputWrapper: {
    width: '100%',
  },
  swapButton: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -18 }, { translateY: -18 }],
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: colors.background,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.gray[300],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dateInputWrapper: {
    flex: 1,
  },
  passengerWrapper: {
    marginBottom: 16,
  },
  searchButton: {
    marginTop: 8,
  },
  demoButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.secondary[500],
    borderRadius: 8,
    alignItems: 'center',
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  serviceButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 32,
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
