import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { reservationService } from '../services/reservationService';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';

type RouteProp = RouteProp<TravelStackParamList, 'Travel/ReservationSuccess'>;
type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/ReservationSuccess'>;

export const ReservationSuccessScreen: React.FC = () => {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { reservationId } = route.params;
  const [reservation, setReservation] = React.useState<any>(null);

  useEffect(() => {
    loadReservation();
  }, []);

  const loadReservation = async () => {
    try {
      const data = await reservationService.getReservationDetails(reservationId);
      setReservation(data);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.successIcon}>✓</Text>
        </View>

        <Text style={styles.title}>Rezervasyon Başarılı!</Text>
        <Text style={styles.subtitle}>
          Rezervasyonunuz başarıyla oluşturuldu
        </Text>

        {reservation && (
          <Card style={styles.reservationCard}>
            <View style={styles.reservationRow}>
              <Text style={styles.reservationLabel}>PNR:</Text>
              <Text style={styles.reservationValue}>{reservation.pnr}</Text>
            </View>
            <View style={styles.reservationRow}>
              <Text style={styles.reservationLabel}>Durum:</Text>
              <Text style={styles.reservationValue}>{reservation.status}</Text>
            </View>
          </Card>
        )}

        <View style={styles.buttons}>
          <Button
            title="Rezervasyonlarım"
            onPress={() => {
              // Navigate to reservations history
              navigation.navigate('Travel/FlightSearch');
            }}
            fullWidth
            style={styles.button}
          />
          <Button
            title="Ana Sayfa"
            onPress={() => {
              navigation.navigate('Travel/FlightSearch');
            }}
            variant="outline"
            fullWidth
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 48,
    color: colors.success,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  reservationCard: {
    width: '100%',
    marginBottom: 32,
  },
  reservationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reservationLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  reservationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  button: {
    marginBottom: 12,
  },
});



