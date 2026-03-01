import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatPrice, formatDate } from '../utils/hotelHelpers';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';

type HotelSuccessRouteProp = RouteProp<TravelStackParamList, 'Travel/HotelReservationSuccess'>;
type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/HotelReservationSuccess'>;

export const HotelReservationSuccessScreen: React.FC = () => {
  const route = useRoute<HotelSuccessRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { booking, hotel, room, rate, guest, guestDetails, guests, searchParams } = route.params;

  const confirmationNumber = booking?.confirmationNumber ?? '';
  const hotelName = hotel?.name ?? '';
  const roomName = room?.name ?? '';
  const checkIn = booking?.checkIn ?? searchParams?.checkIn ?? '';
  const checkOut = booking?.checkOut ?? searchParams?.checkOut ?? '';
  const totalPrice = booking?.totalPrice ?? (rate?.price && searchParams ? rate.price * (booking?.nights ?? 0) * (guests?.rooms ?? 1) : 0);
  const currency = booking?.currency ?? rate?.currency ?? 'EUR';

  const goToPayment = () => {
    navigation.navigate('Travel/Payment', {
      reservationData: {
        reservation: { id: booking?.bookingId },
        booking,
        hotel,
        room,
        rate,
        guest,
        guestDetails,
        guests,
        type: 'hotel',
      },
    });
  };

  const goToHome = () => {
    navigation.navigate('Home' as never, { service: 'home' } as never);
  };

  const goToMyTrips = () => {
    navigation.getParent()?.navigate?.('Profile' as never, { screen: 'MyTrips' } as never);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color={colors.primary[500]} />
        </View>

        <Text style={styles.title}>Rezervasyon Onaylandı!</Text>
        <Text style={styles.subtitle}>
          Rezervasyonunuz oluşturuldu. Onay detayları e-posta ile paylaşılacaktır.
        </Text>

        <Card style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Rezervasyon Detayları</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Onay Numarası</Text>
            <Text style={[styles.detailValue, styles.confirmationNumber]}>
              {confirmationNumber}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Otel</Text>
            <Text style={styles.detailValue} numberOfLines={2}>{hotelName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Oda</Text>
            <Text style={styles.detailValue}>{roomName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tarih</Text>
            <Text style={styles.detailValue}>
              {formatDate(checkIn)} - {formatDate(checkOut)}
            </Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Toplam</Text>
            <Text style={[styles.detailValue, styles.totalPrice]}>
              {formatPrice(totalPrice, currency)}
            </Text>
          </View>
        </Card>

        <View style={styles.buttons}>
          <Button
            title="Ödemeye Geç"
            onPress={goToPayment}
            fullWidth
            style={styles.primaryButton}
          />
          <Button
            title="Rezervasyonlarım"
            onPress={goToMyTrips}
            variant="outline"
            fullWidth
            style={styles.outlineButton}
          />
          <Button
            title="Ana Sayfaya Dön"
            onPress={goToHome}
            variant="outline"
            fullWidth
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.gray[100],
    padding: 24,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  iconContainer: {
    marginBottom: 24,
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
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  detailsCard: {
    width: '100%',
    marginBottom: 24,
    padding: 20,
    backgroundColor: colors.gray[50],
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailRowLast: {
    marginBottom: 0,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  confirmationNumber: {
    fontWeight: '700',
    color: colors.primary[600],
    fontVariant: ['tabular-nums'],
  },
  totalPrice: {
    fontWeight: '700',
    color: colors.primary[600],
    fontSize: 16,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    marginBottom: 0,
  },
  outlineButton: {
    marginBottom: 0,
  },
});
