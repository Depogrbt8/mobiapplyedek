import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { AirportSearchInput } from '../components/AirportSearchInput';
import { DatePicker } from '../components/DatePicker';
import { PassengerSelector } from '../components/PassengerSelector';
import { useTravelStore } from '../store/travelStore';
import { searchHistoryService } from '@/services/searchHistoryService';
import type { Airport, FlightSearchQuery } from '@/types/flight';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';

type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/FlightSearch'>;

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

    navigation.navigate('Travel/FlightResults', { searchParams: searchQuery });
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
              label="Nereden"
              value={origin}
              onSelect={setOrigin}
              placeholder="Nereden"
            />
          </View>
          <TouchableOpacity
            style={styles.swapButton}
            onPress={() => {
              const temp = origin;
              setOrigin(destination);
              setDestination(temp);
            }}
          >
            <Ionicons name="swap-horizontal" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.airportInputWrapper}>
            <AirportSearchInput
              label="Nereye"
              value={destination}
              onSelect={setDestination}
              placeholder="Nereye"
            />
          </View>
        </View>

        {/* Date Pickers */}
        <View style={styles.dateContainer}>
          <View style={styles.dateInputWrapper}>
            <DatePicker
              label="Gidiş Tarihi"
              value={departureDate}
              onChange={setDepartureDate}
              minimumDate={new Date()}
              placeholder="Gidiş Tarihi"
            />
          </View>
          <View style={styles.dateInputWrapper}>
            <DatePicker
              label="Dönüş Tarihi"
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 120,
    paddingBottom: 32,
  },
  tripTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tripTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginBottom: 8,
    position: 'relative',
  },
  airportInputWrapper: {
    flex: 1,
  },
  swapButton: {
    position: 'absolute',
    left: '50%',
    top: 36,
    transform: [{ translateX: -12 }],
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dateInputWrapper: {
    flex: 1,
  },
  passengerWrapper: {
    marginBottom: 24,
  },
  searchButton: {
    marginTop: 8,
  },
});
