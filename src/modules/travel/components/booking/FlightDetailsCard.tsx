import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import type { Flight } from '@/types/flight';
import { colors } from '@/constants/colors';

interface FlightDetailsCardProps {
  flight: Flight;
}

export const FlightDetailsCard: React.FC<FlightDetailsCardProps> = ({ flight }) => {
  if (!flight) return null;

  const departureDate = flight.departureTime ? format(new Date(flight.departureTime), 'dd MMM yyyy', { locale: tr }) : '';
  const departureTime = flight.departureTime ? flight.departureTime.slice(11, 16) : '';
  const arrivalDate = flight.arrivalTime ? format(new Date(flight.arrivalTime), 'dd MMM yyyy', { locale: tr }) : '';
  const arrivalTime = flight.arrivalTime ? flight.arrivalTime.slice(11, 16) : '';

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Uçuş Detayları</Text>
      
      <View style={styles.routeContainer}>
        {/* Origin */}
        <View style={styles.airportContainer}>
          <Text style={styles.airportCode}>{flight.origin}</Text>
          <View style={styles.dateTimeContainer}>
            <Ionicons name="airplane-outline" size={16} color={colors.primary[600]} />
            <Text style={styles.dateText}>{departureDate}</Text>
          </View>
          <Text style={styles.timeText}>{departureTime}</Text>
        </View>

        {/* Duration */}
        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>{flight.duration}</Text>
          <View style={styles.directBadge}>
            <Text style={styles.directText}>{flight.direct ? 'Direkt' : 'Aktarmalı'}</Text>
          </View>
        </View>

        {/* Destination */}
        <View style={styles.airportContainer}>
          <Text style={styles.airportCode}>{flight.destination}</Text>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateText}>{arrivalDate}</Text>
            <Ionicons name="airplane" size={16} color={colors.primary[600]} />
          </View>
          <Text style={styles.timeText}>{arrivalTime}</Text>
        </View>
      </View>

      <View style={styles.airlineContainer}>
        <Text style={styles.airlineText}>
          {flight.airlineName} - {flight.flightNumber}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  airportContainer: {
    flex: 1,
    alignItems: 'center',
  },
  airportCode: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  durationContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  directBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  directText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary[600],
  },
  airlineContainer: {
    marginTop: 8,
  },
  airlineText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

