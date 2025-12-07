import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/utils/format';
import { reservationService } from '../services/reservationService';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';
import type { Hotel } from '../services/hotelService';
import { Alert } from 'react-native';

type RouteProp = RouteProp<TravelStackParamList, 'Travel/HotelReservation'>;
type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/HotelReservation'>;

const guestSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  phone: z.string().min(10, 'Telefon numarası geçerli değil'),
});

type GuestFormData = z.infer<typeof guestSchema>;

export const HotelReservationScreen: React.FC = () => {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { hotel } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
  });

  const onSubmit = async (data: GuestFormData) => {
    setIsLoading(true);
    try {
      const reservation = await reservationService.createHotelReservation({
        type: 'hotel',
        hotelId: hotel.id,
        guest: data,
        checkIn: '', // Will be passed from search params
        checkOut: '', // Will be passed from search params
        guests: 1, // Will be passed from search params
        rooms: 1, // Will be passed from search params
        amount: hotel.price,
        currency: hotel.currency,
      });
      navigation.navigate('Travel/Payment', {
        reservationData: { reservation, hotel, guest: data, type: 'hotel' },
      });
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Rezervasyon oluşturulamadı');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hotel) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Otel bilgisi bulunamadı</Text>
        <Button title="Geri" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.hotelSummary}>
          <Text style={styles.sectionTitle}>Otel Özeti</Text>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          <Text style={styles.hotelLocation}>{hotel.location}</Text>
          <Text style={styles.hotelAddress}>{hotel.address}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Toplam Tutar</Text>
            <Text style={styles.price}>
              {formatCurrency(hotel.price, hotel.currency)}
            </Text>
          </View>
        </Card>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Misafir Bilgileri</Text>

          <Input
            label="Ad"
            placeholder="Adınız"
            control={control}
            name="firstName"
            autoCapitalize="words"
            error={errors.firstName?.message}
          />

          <Input
            label="Soyad"
            placeholder="Soyadınız"
            control={control}
            name="lastName"
            autoCapitalize="words"
            error={errors.lastName?.message}
          />

          <Input
            label="E-posta"
            placeholder="ornek@email.com"
            control={control}
            name="email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email?.message}
          />

          <Input
            label="Telefon"
            placeholder="5XX XXX XX XX"
            control={control}
            name="phone"
            keyboardType="phone-pad"
            error={errors.phone?.message}
          />

          <Button
            title="Devam Et - Ödeme"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: colors.text.secondary,
    marginBottom: 24,
  },
  hotelSummary: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  hotelName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  hotelLocation: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  hotelAddress: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  priceLabel: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary[600],
  },
  form: {
    gap: 16,
  },
  submitButton: {
    marginTop: 24,
  },
});

