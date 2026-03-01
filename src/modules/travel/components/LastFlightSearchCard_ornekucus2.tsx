import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { useLastFlightSearch } from '../hooks/useLastFlightSearch';
import { useTravelStore } from '../store/travelStore';
import type { FlightSearchQuery } from '@/types/flight';

type NavigationProp = any;

/**
 * Component to display last flight search with current price
 * Designed to match the provided image: dark green background with grid pattern,
 * light yellow monospace-style text
 * 
 * Backup: ornekucus2 - Compact horizontal airport board style
 */
export const LastFlightSearchCard_ornekucus2: React.FC = () => {
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
          <ActivityIndicator size="small" color="#F0F8DC" />
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
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.container}>
        {/* Grid pattern overlay */}
        <View style={styles.gridContainer}>
          {/* Horizontal lines */}
          {Array.from({ length: 4 }).map((_, i) => (
            <View
              key={`h-${i}`}
              style={[
                styles.gridLine,
                styles.gridLineHorizontal,
                { top: `${(i + 1) * 25}%` },
              ]}
            />
          ))}
          {/* Vertical lines */}
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={`v-${i}`}
              style={[
                styles.gridLine,
                styles.gridLineVertical,
                { left: `${(i + 1) * 20}%` },
              ]}
            />
          ))}
        </View>
        
        {/* Header - centered at top */}
        <View style={styles.header}>
          <Text style={styles.headerText}>SON UCUS ARAMAN A</Text>
          <View style={styles.headerLine} />
        </View>
        
        {/* Content - Rows with Date | Route | Price */}
        <View style={styles.content}>
          {/* Departure row */}
          <View style={styles.row}>
            <Text style={styles.date}>{formattedDepartureDate}</Text>
            <Text style={styles.route}>
              {search.origin} → {search.destination}
            </Text>
            <Text style={styles.price}>{formatPrice(currentPrice) || '...'}</Text>
          </View>
          
          {/* Return row */}
          {search.tripType === 'roundTrip' && formattedReturnDate && (
            <View style={styles.row}>
              <Text style={styles.date}>{formattedReturnDate}</Text>
              <Text style={styles.route}>
                {search.destination} → {search.origin}
              </Text>
              <Text style={styles.price}>{formatPrice(returnPrice) || '...'}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#38763E', // Dark green background
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 80,
    justifyContent: 'center',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(240, 248, 220, 0.25)',
  },
  gridLineHorizontal: {
    width: '100%',
    height: 1,
  },
  gridLineVertical: {
    height: '100%',
    width: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 1,
  },
  headerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F0F8DC',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  headerLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(240, 248, 220, 0.4)',
  },
  content: {
    gap: 10,
    zIndex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  date: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F0F8DC',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
    flex: 0,
    minWidth: 100,
  },
  route: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFD700', // Yellow for route
    letterSpacing: 1,
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F0F8DC',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
    flex: 0,
    minWidth: 60,
    textAlign: 'right',
  },
});



