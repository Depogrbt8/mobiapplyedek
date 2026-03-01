import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLastFlightSearch } from '../hooks/useLastFlightSearch';
import { useTravelStore } from '../store/travelStore';
import { colors } from '@/constants/colors';
import type { FlightSearchQuery } from '@/types/flight';

type NavigationProp = any;

/**
 * Component to display last flight search with current price
 * Designed to match the provided image: dark green background with grid pattern,
 * light yellow monospace-style text
 */
export const LastFlightSearchCard: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { search, currentPrice, returnPrice, loading, error } = useLastFlightSearch();
  const { setSearchQuery } = useTravelStore();

  const handlePress = () => {
    if (!search) return;

    const searchQuery: FlightSearchQuery = {
      origin: search.origin,
      destination: search.destination,
      departureDate: search.departureDate,
      returnDate: search.returnDate,
      passengers: search.passengers,
      tripType: search.tripType,
      directOnly: false,
    };

    setSearchQuery(searchQuery);

    // Navigate to flight results
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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary[600]} />
        </View>
      </View>
    );
  }

  if (error || !search) {
    return null; // Don't show anything if there's no search history
  }

  // Format dates
  const departureDate = new Date(search.departureDate);
  const formattedDepartureDate = departureDate.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formattedReturnDate = search.returnDate
    ? new Date(search.returnDate).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;

  // Format prices - simple format like "120€" without thousand separators
  const formatPrice = (price: number | null) => {
    if (price === null) return null;
    return `${Math.round(price)}€`;
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="time-outline" size={14} color={colors.primary[600]} />
            <Text style={styles.headerText}>Son Uçuş Araman</Text>
          </View>
        </View>
        
        {/* Flight rows - compact horizontal layout */}
        <View style={styles.flightRows}>
          {/* Departure row */}
          <View style={styles.flightRow}>
            <Text style={styles.dateValue}>{formattedDepartureDate}</Text>
            <Text style={styles.routeValue}>
              {search.origin} → {search.destination}
            </Text>
            <Text style={styles.priceValue}>{formatPrice(currentPrice) || '---'}</Text>
          </View>
          
          {/* Return row */}
          {search.tripType === 'roundTrip' && formattedReturnDate && (
            <View style={styles.flightRow}>
              <Text style={styles.dateValue}>{formattedReturnDate}</Text>
              <Text style={styles.routeValue}>
                {search.destination} → {search.origin}
              </Text>
              <Text style={styles.priceValue}>{formatPrice(returnPrice) || '---'}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  flightRows: {
    gap: 8,
  },
  flightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    minWidth: 85,
  },
  routeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary[600],
    flex: 1,
    textAlign: 'center',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary[600],
    minWidth: 55,
    textAlign: 'right',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
});



