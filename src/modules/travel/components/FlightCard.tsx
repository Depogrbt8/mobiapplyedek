import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import type { Flight } from '@/types/flight';
import { formatTime, formatCurrency, formatDuration } from '@/utils/format';
import { colors } from '@/constants/colors';

interface FlightCardProps {
  flight: Flight;
  onPress: () => void;
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight, onPress }) => {
  // Parse duration from string (e.g., "2h 30m" to minutes)
  const parseDuration = (duration: string): number => {
    const hoursMatch = duration.match(/(\d+)h/);
    const minutesMatch = duration.match(/(\d+)m/);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    return hours * 60 + minutes;
  };

  const durationMinutes = parseDuration(flight.duration);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.airlineInfo}>
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
            <Text style={styles.airport}>{flight.origin}</Text>
          </View>

          <View style={styles.durationSection}>
            <View style={styles.durationLine} />
            <Text style={styles.duration}>{formatDuration(durationMinutes)}</Text>
          </View>

          <View style={styles.timeSection}>
            <Text style={styles.time}>{formatTime(flight.arrivalTime)}</Text>
            <Text style={styles.airport}>{flight.destination}</Text>
          </View>
        </View>

        {flight.baggage && (
          <View style={styles.baggage}>
            <Text style={styles.baggageText}>Bagaj: {flight.baggage}</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  airlineInfo: {
    flex: 1,
  },
  airlineName: {
    fontSize: 16,
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary[600],
    marginBottom: 4,
  },
  directBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  directText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary[700],
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeSection: {
    flex: 1,
    alignItems: 'center',
  },
  time: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  airport: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  durationSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  durationLine: {
    width: '100%',
    height: 1,
    backgroundColor: colors.gray[300],
    marginBottom: 4,
  },
  duration: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  baggage: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  baggageText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});











