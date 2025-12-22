import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import type { Flight } from '@/types/flight';
import { formatTime } from '@/utils/format';
import { colors } from '@/constants/colors';

interface CompactFlightCardProps {
  flight: Flight;
  isSelected?: boolean;
  onPress: () => void;
}

export const CompactFlightCard: React.FC<CompactFlightCardProps> = ({
  flight,
  isSelected = false,
  onPress,
}) => {
  const departureTime = formatTime(flight.departureTime);
  const arrivalTime = formatTime(flight.arrivalTime);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.card, isSelected && styles.cardSelected]}>
        {/* 1. SATIR: Havayolu + Saatler + Fiyat */}
        <View style={styles.row}>
          {/* Sol: Havayolu */}
          <View style={styles.airlineContainer}>
            <View style={styles.airlineLogo}>
              <Text style={styles.airlineLogoText}>
                {(flight.airlineName || 'P')[0]}
              </Text>
            </View>
            <Text style={styles.airlineName}>
              {flight.airlineName || 'Pegasus'}
            </Text>
          </View>

          {/* Orta: Saatler */}
          <Text style={styles.timeText}>
            {departureTime} → {arrivalTime}
          </Text>

          {/* Sağ: Fiyat */}
          <Text style={styles.priceText}>
            {flight.price}.00 €
          </Text>
        </View>

        {/* 2. SATIR: Rota + Direkt + Bagaj */}
        <View style={styles.row}>
          {/* Sol: Rota */}
          <Text style={styles.routeText}>
            {flight.origin} &gt; {flight.destination}
          </Text>

          {/* Orta: Direkt etiketi */}
          {flight.direct && (
            <View style={styles.directBadge}>
              <Text style={styles.directText}>Direkt</Text>
            </View>
          )}

          {/* Sağ: Bagaj bilgisi */}
          <View style={styles.baggageContainer}>
            <Text style={styles.baggageText}>
              {flight.baggage || 'El çantası'}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cardSelected: {
    borderColor: colors.info,
    backgroundColor: colors.info + '10',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  airlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  airlineLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
  },
  airlineLogoText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  airlineName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  routeText: {
    fontSize: 11,
    color: colors.text.secondary,
    flex: 1,
  },
  directBadge: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  directText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  baggageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  baggageText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
});

