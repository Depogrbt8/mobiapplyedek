import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { colors } from '@/constants/colors';
import type { PassengerDetail } from './PassengerForm';

const BAGGAGE_OPTIONS = [
  { weight: 0, label: 'Sadece Kabin Bagajı', price: -10 },
  { weight: 20, label: '20 kg Bagaj (Standart)', price: 0 },
  { weight: 25, label: '25 kg Bagaj', price: 15 },
  { weight: 30, label: '30 kg Bagaj', price: 25 },
];

interface BaggageSelectionProps {
  passengers: PassengerDetail[];
  flight: any;
  onBaggageChange: (passengerIndex: number, legIndex: number, baggage: any) => void;
  baggageSelections: any[];
}

export const BaggageSelection: React.FC<BaggageSelectionProps> = ({
  passengers,
  flight,
  onBaggageChange,
  baggageSelections,
}) => {
  if (!passengers || passengers.length === 0) return null;

  const flightLegs = [{ type: 'Gidiş', flight }];

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="briefcase-outline" size={20} color={colors.primary[600]} />
        <Text style={styles.title}>Bagaj hakkını yükselt</Text>
      </View>
      
      <Text style={styles.description}>
        Havalimanında bagajınıza yüksek fiyatlar ödemeyin, %50'ye varan fiyat avantajıyla şimdiden bagaj hakkınızı yükseltin.
      </Text>

      <View style={styles.passengersContainer}>
        {passengers.map((passenger, pIndex) => (
          <View key={`passenger-baggage-${pIndex}`} style={styles.passengerContainer}>
            {flightLegs.map((leg, lIndex) => {
              const currentSelection = baggageSelections[pIndex]?.[lIndex];
              const selectedPrice = currentSelection?.price ?? 0;
              
              return (
                <View key={`leg-${lIndex}`} style={styles.legContainer}>
                  <View style={styles.legHeader}>
                    <View style={styles.passengerInfo}>
                      <Text style={styles.passengerName}>
                        {pIndex + 1}. {passenger.type || 'Yolcu'}
                      </Text>
                      <View style={styles.flightInfo}>
                        <Ionicons name="airplane-outline" size={14} color={colors.warning} />
                        <Text style={styles.flightText}>
                          {leg.type} ({leg.flight.origin}-{leg.flight.destination})
                        </Text>
                      </View>
                      <Text style={styles.baggageInfo}>
                        Bagaj hakkı 1x{leg.flight.baggage || '20kg'}
                      </Text>
                    </View>
                    <View style={styles.selectContainer}>
                      <Text style={styles.selectLabel}>Ek check-in bagajı</Text>
                      <Select
                        value={selectedPrice}
                        options={BAGGAGE_OPTIONS.map(opt => ({
                          label: `${opt.label} ${opt.price > 0 ? `(+${opt.price} EUR)` : opt.price < 0 ? `(${opt.price} EUR)` : '(Dahil)'}`,
                          value: opt.price,
                        }))}
                        onSelect={(value) => {
                          const selectedOption = BAGGAGE_OPTIONS.find(opt => opt.price === value);
                          onBaggageChange(pIndex, lIndex, selectedOption);
                        }}
                        placeholder="Seçiniz"
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 0, // Parent container'da margin var
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  description: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  passengersContainer: {
    gap: 16,
  },
  passengerContainer: {
    gap: 12,
  },
  legContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.gray[50],
  },
  legHeader: {
    gap: 12,
  },
  passengerInfo: {
    gap: 4,
  },
  passengerName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  flightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flightText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  baggageInfo: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  selectContainer: {
    gap: 4,
  },
  selectLabel: {
    fontSize: 11,
    color: colors.text.secondary,
  },
});

