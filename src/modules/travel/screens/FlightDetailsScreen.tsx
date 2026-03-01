import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { flightService } from '../services/flightService';
import { useTravelStore } from '../store/travelStore';
import { formatTime, formatCurrency, formatDate } from '@/utils/format';
import type { Flight } from '@/types/flight';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';

type RouteProp = RouteProp<TravelStackParamList, 'Travel/FlightDetails'>;
type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/FlightDetails'>;

export const FlightDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { flightId, flight: routeFlight } = route.params;

  const { selectedFlight } = useTravelStore();
  const [flight, setFlight] = useState<Flight | null>(routeFlight || selectedFlight);
  const [isLoading, setIsLoading] = useState(!routeFlight && !selectedFlight);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!routeFlight && !selectedFlight) {
      loadFlightDetails();
    }
  }, []);

  const loadFlightDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const flightData = await flightService.getFlightDetails(flightId);
      setFlight(flightData);
    } catch (err: any) {
      setError(err.message || 'Uçuş detayları yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReserve = () => {
    navigation.navigate('Travel/Reservation', { flight });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  if (error || !flight) {
    return <ErrorDisplay error={error || 'Uçuş bulunamadı'} onRetry={loadFlightDetails} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.flightCard}>
        <View style={styles.header}>
          <View>
            <Text style={styles.airlineName}>{flight.airlineName}</Text>
            <Text style={styles.flightNumber}>{flight.flightNumber}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatCurrency(flight.price, flight.currency)}</Text>
            {flight.direct && (
              <View style={styles.directBadge}>
                <Text style={styles.directText}>Direkt</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.route}>
          <View style={styles.timeSection}>
            <Text style={styles.time}>{formatTime(flight.departureTime)}</Text>
            <View style={styles.airportContainer}>
              <Text style={styles.airport}>{flight.origin}</Text>
            </View>
            <Text style={styles.date}>{formatDate(flight.departureTime)}</Text>
          </View>

          <View style={styles.durationSection}>
            <View style={styles.durationLine} />
            <Text style={styles.duration}>{flight.duration}</Text>
          </View>

          <View style={styles.timeSection}>
            <Text style={styles.time}>{formatTime(flight.arrivalTime)}</Text>
            <View style={styles.airportContainer}>
              <Text style={styles.airport}>{flight.destination}</Text>
            </View>
            <Text style={styles.date}>{formatDate(flight.arrivalTime)}</Text>
          </View>
        </View>

        {flight.baggage && (
          <View style={styles.baggageSection}>
            <Text style={styles.sectionTitle}>Bagaj Bilgisi</Text>
            <Text style={styles.baggageText}>{flight.baggage}</Text>
          </View>
        )}
      </Card>

      <Button
        title="Rezervasyon Yap"
        onPress={handleReserve}
        fullWidth
        style={styles.reserveButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  flightCard: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  airlineName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  flightNumber: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary[600],
    marginBottom: 8,
  },
  directBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  directText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary[700],
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timeSection: {
    flex: 1,
    alignItems: 'center',
  },
  time: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  airportContainer: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
    alignSelf: 'center',
  },
  airport: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  date: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  durationSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  durationLine: {
    width: '100%',
    height: 2,
    backgroundColor: colors.gray[300],
    marginBottom: 8,
  },
  duration: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  baggageSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  baggageText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  reserveButton: {
    marginTop: 8,
  },
});

