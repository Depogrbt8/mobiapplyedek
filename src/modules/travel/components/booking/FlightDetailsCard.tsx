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
  returnFlight?: Flight; // Opsiyonel dönüş uçuşu
}

export const FlightDetailsCard: React.FC<FlightDetailsCardProps> = ({ flight, returnFlight }) => {
  if (!flight) return null;

  const isRoundTrip = !!returnFlight;

  const departureDate = flight.departureTime ? format(new Date(flight.departureTime), 'dd MMM yyyy', { locale: tr }) : '';
  const departureTime = flight.departureTime ? flight.departureTime.slice(11, 16) : '';
  const arrivalDate = flight.arrivalTime ? format(new Date(flight.arrivalTime), 'dd MMM yyyy', { locale: tr }) : '';
  const arrivalTime = flight.arrivalTime ? flight.arrivalTime.slice(11, 16) : '';

  // Tek uçuş render fonksiyonu
  const renderSingleFlight = (f: Flight, label?: string) => {
    const depDate = f.departureTime ? format(new Date(f.departureTime), 'dd MMM yyyy', { locale: tr }) : '';
    const depTime = f.departureTime ? f.departureTime.slice(11, 16) : '';
    const arrDate = f.arrivalTime ? format(new Date(f.arrivalTime), 'dd MMM yyyy', { locale: tr }) : '';
    const arrTime = f.arrivalTime ? f.arrivalTime.slice(11, 16) : '';

    return (
      <View key={f.id}>
        {label && (
          <Text style={styles.flightLabel}>{label}</Text>
        )}
        <View style={[styles.routeContainer, isRoundTrip && styles.routeContainerWithBorder]}>
          {/* Origin */}
          <View style={styles.airportContainer}>
            <Text style={styles.airportCode}>{f.origin}</Text>
            <View style={styles.dateTimeWrapper}>
              <View style={styles.dateTimeRow}>
                <Ionicons name="airplane-outline" size={14} color={colors.primary[600]} />
                <Text style={styles.dateText}>{depDate}</Text>
              </View>
              <Text style={styles.timeText}>{depTime}</Text>
            </View>
          </View>

          {/* Duration */}
          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>{f.duration}</Text>
            <View style={styles.directBadge}>
              <Text style={styles.directText}>{f.direct ? 'Direkt' : 'Aktarmalı'}</Text>
            </View>
            <Text style={styles.airlineText}>{f.airlineName}</Text>
          </View>

          {/* Destination */}
          <View style={styles.airportContainer}>
            <Text style={styles.airportCode}>{f.destination}</Text>
            <View style={styles.dateTimeWrapper}>
              <View style={styles.dateTimeRow}>
                <Text style={styles.dateText}>{arrDate}</Text>
                <Ionicons name="airplane" size={14} color={colors.primary[600]} />
              </View>
              <Text style={styles.timeText}>{arrTime}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Uçuş Detayları</Text>
      
      {renderSingleFlight(flight, isRoundTrip ? 'Gidiş Uçuşu' : undefined)}
      
      {isRoundTrip && returnFlight && (
        <View style={styles.returnFlightContainer}>
          {renderSingleFlight(returnFlight, 'Dönüş Uçuşu')}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 0, // Parent container'da margin var
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
  dateTimeWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  durationContainer: {
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
    paddingHorizontal: 8,
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
    marginBottom: 4,
  },
  directText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary[600],
  },
  airlineText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  routeContainerWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingBottom: 16,
    marginBottom: 16,
  },
  flightLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  returnFlightContainer: {
    marginTop: 16,
  },
});

