import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { AirportSearchInput } from './AirportSearchInput';
import { DatePicker } from './DatePicker';
import { PassengerSelector } from './PassengerSelector';
import { searchHistoryService } from '@/services/searchHistoryService';
import type { Airport, FlightSearchQuery } from '@/types/flight';
import { colors } from '@/constants/colors';

interface FlightSearchFormProps {
  initialOrigin?: Airport | null;
  initialDestination?: Airport | null;
  initialDepartureDate?: Date | null;
  initialReturnDate?: Date | null;
  initialTripType?: 'oneWay' | 'roundTrip';
  initialAdultCount?: number;
  initialChildCount?: number;
  initialInfantCount?: number;
  onSearch: (searchQuery: FlightSearchQuery) => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

export const FlightSearchForm: React.FC<FlightSearchFormProps> = ({
  initialOrigin = null,
  initialDestination = null,
  initialDepartureDate = null,
  initialReturnDate = null,
  initialTripType = 'oneWay',
  initialAdultCount = 1,
  initialChildCount = 0,
  initialInfantCount = 0,
  onSearch,
  onCancel,
  showCancelButton = false,
}) => {
  const [origin, setOrigin] = useState<Airport | null>(initialOrigin);
  const [destination, setDestination] = useState<Airport | null>(initialDestination);
  const [departureDate, setDepartureDate] = useState<Date | null>(initialDepartureDate);
  const [returnDate, setReturnDate] = useState<Date | null>(initialReturnDate);
  const [tripType, setTripType] = useState<'oneWay' | 'roundTrip'>(initialTripType);
  const [adultCount, setAdultCount] = useState(initialAdultCount);
  const [childCount, setChildCount] = useState(initialChildCount);
  const [infantCount, setInfantCount] = useState(initialInfantCount);

  // Initial values değiştiğinde state'i güncelle
  useEffect(() => {
    setOrigin(initialOrigin);
    setDestination(initialDestination);
    setDepartureDate(initialDepartureDate);
    setReturnDate(initialReturnDate);
    setTripType(initialTripType);
    setAdultCount(initialAdultCount);
    setChildCount(initialChildCount);
    setInfantCount(initialInfantCount);
  }, [initialOrigin, initialDestination, initialDepartureDate, initialReturnDate, initialTripType, initialAdultCount, initialChildCount, initialInfantCount]);

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

    onSearch(searchQuery);
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

        {/* Search Button */}
        <Button
          title="Uçuş Ara"
          onPress={handleSearch}
          disabled={!isFormValid}
          fullWidth
          style={styles.searchButton}
        />

        {/* Cancel Button (if needed) */}
        {showCancelButton && onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>
        )}
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
    backgroundColor: colors.background,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.gray[300],
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  dateInputWrapper: {
    flex: 1,
  },
  searchButton: {
    marginTop: 8,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
});

