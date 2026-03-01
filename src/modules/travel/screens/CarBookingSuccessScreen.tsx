// Araç Rezervasyon Başarı Ekranı - Desktop (grbt8) birebir React Native

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { CarBooking, SimpleCarSearchParams } from '../types/car';
import { formatCarPrice, formatCarDateTime, calculateDays } from '../utils/carHelpers';
import { CAR_CATEGORY_LABELS, TRANSMISSION_LABELS } from '../types/car';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';

type CarBookingSuccessRouteProp = RouteProp<TravelStackParamList, 'Travel/CarBookingSuccess'>;

export const CarBookingSuccessScreen: React.FC = () => {
  const route = useRoute<CarBookingSuccessRouteProp>();
  const navigation = useNavigation();
  const { booking, searchParams } = route.params as {
    booking: CarBooking;
    searchParams: SimpleCarSearchParams;
  };

  const days = calculateDays(searchParams.pickupDate, searchParams.dropoffDate);

  const handleGoHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
      })
    );
  };

  const handleGoToTrips = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
      })
    );
    // MyTrips tab'ına yönlendir (ana sayfa sonrası)
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Başarı ikonu */}
      <View style={styles.successSection}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={64} color={colors.primary[600]} />
        </View>
        <Text style={styles.successTitle}>Rezervasyon Onaylandı!</Text>
        <Text style={styles.successSubtitle}>
          Araç kiralama rezervasyonunuz başarıyla oluşturuldu.
        </Text>
      </View>

      {/* Rezervasyon numarası */}
      <Card style={styles.section}>
        <View style={styles.bookingNumberRow}>
          <Text style={styles.bookingNumberLabel}>Rezervasyon No</Text>
          <Text style={styles.bookingNumber}>{booking.bookingNumber}</Text>
        </View>
        <Text style={styles.confirmText}>
          Onay e-postası {booking.confirmationEmail} adresine gönderildi.
        </Text>
      </Card>

      {/* Araç Bilgileri */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Araç Bilgileri</Text>
        <Text style={styles.carName}>{booking.car.name}</Text>
        <Text style={styles.carMeta}>
          {CAR_CATEGORY_LABELS[booking.car.category]} ·{' '}
          {TRANSMISSION_LABELS[booking.car.transmission]} · {booking.car.supplierName}
        </Text>
      </Card>

      {/* Rota Bilgileri */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Alış / Teslim</Text>
        <View style={styles.routeBox}>
          <View style={styles.routeItem}>
            <Ionicons name="location" size={18} color={colors.primary[600]} />
            <View>
              <Text style={styles.routeLabel}>Alış</Text>
              <Text style={styles.routeValue}>
                {booking.route.pickup.location.name}
              </Text>
              <Text style={styles.routeDate}>
                {formatCarDateTime(searchParams.pickupDate, searchParams.pickupTime)}
              </Text>
            </View>
          </View>
          <View style={styles.routeDivider} />
          <View style={styles.routeItem}>
            <Ionicons name="location-outline" size={18} color={colors.error} />
            <View>
              <Text style={styles.routeLabel}>Teslim</Text>
              <Text style={styles.routeValue}>
                {booking.route.dropoff.location.name}
              </Text>
              <Text style={styles.routeDate}>
                {formatCarDateTime(searchParams.dropoffDate, searchParams.dropoffTime)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.daysRow}>
          <Text style={styles.daysLabel}>Toplam Süre</Text>
          <Text style={styles.daysValue}>{days} gün</Text>
        </View>
      </Card>

      {/* Fiyat */}
      <Card style={styles.section}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Toplam Tutar</Text>
          <Text style={styles.totalPrice}>
            {formatCarPrice(
              booking.priceBreakdown.total,
              booking.priceBreakdown.currency
            )}
          </Text>
        </View>
      </Card>

      {/* Butonlar */}
      <View style={styles.buttons}>
        <Button
          title="Ana Sayfaya Dön"
          onPress={handleGoHome}
          fullWidth
          style={styles.primaryButton}
        />
        <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToTrips}>
          <Text style={styles.secondaryButtonText}>Rezervasyonlarım</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: 16,
  },
  // Success
  successSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  successIcon: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
  },
  // Section
  section: {
    marginBottom: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 10,
  },
  // Booking number
  bookingNumberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingNumberLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  bookingNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary[600],
  },
  confirmText: {
    fontSize: 12,
    color: colors.gray[500],
  },
  // Car
  carName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  carMeta: {
    fontSize: 13,
    color: colors.gray[500],
  },
  // Route
  routeBox: {
    backgroundColor: colors.gray[50],
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  routeItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  routeLabel: {
    fontSize: 11,
    color: colors.gray[500],
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  routeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 2,
  },
  routeDate: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 1,
  },
  routeDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.gray[300],
    marginLeft: 9,
    marginVertical: 4,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  daysLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  daysValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  // Total
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary[600],
  },
  // Buttons
  buttons: {
    marginTop: 8,
    gap: 10,
  },
  primaryButton: {},
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
