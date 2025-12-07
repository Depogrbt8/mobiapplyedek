import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlightCard } from '../components/FlightCard';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { useTravelStore } from '../store/travelStore';
import { flightService } from '../services/flightService';
import type { Flight, FlightSearchQuery } from '@/types/flight';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';

type RouteProp = RouteProp<TravelStackParamList, 'Travel/FlightResults'>;
type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/FlightResults'>;

export const FlightResultsScreen: React.FC = () => {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { searchParams } = route.params;

  const { flights, isLoading, error, setFlights, setLoading, setError, setSelectedFlight } =
    useTravelStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    searchFlights();
  }, []);

  const searchFlights = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await flightService.searchFlights(searchParams);
      setFlights(results);
    } catch (err: any) {
      setError(err.message || 'Uçuş araması başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await searchFlights();
    setRefreshing(false);
  };

  const handleFlightPress = (flight: Flight) => {
    setSelectedFlight(flight);
    navigation.navigate('Travel/FlightDetails', { flightId: flight.id, flight });
  };

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

  return (
    <View style={styles.container}>
      <FlatList
        data={flights}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FlightCard flight={item} onPress={() => handleFlightPress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
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
});

