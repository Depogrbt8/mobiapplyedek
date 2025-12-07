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
import { formatCurrency } from '@/utils/format';
import { reservationService } from '../services/reservationService';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';
import type { Car } from '../services/carService';
import { Alert } from 'react-native';

type RouteProp = RouteProp<TravelStackParamList, 'Travel/CarReservation'>;
type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/CarReservation'>;

const renterSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  phone: z.string().min(10, 'Telefon numarası geçerli değil'),
  licenseNumber: z.string().min(5, 'Ehliyet numarası girin'),
});

type RenterFormData = z.infer<typeof renterSchema>;

export const CarReservationScreen: React.FC = () => {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { car } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RenterFormData>({
    resolver: zodResolver(renterSchema),
  });

  const onSubmit = async (data: RenterFormData) => {
    setIsLoading(true);
    try {
      // Create car reservation
      const reservation = await reservationService.createCarReservation({
        type: 'car',
        carId: car.id,
        renter: data,
        pickupLocation: '', // Will be passed from search params
        pickupDate: '', // Will be passed from search params
        pickupTime: '', // Will be passed from search params
        dropoffLocation: '', // Will be passed from search params
        dropoffDate: '', // Will be passed from search params
        dropoffTime: '', // Will be passed from search params
        amount: car.price,
        currency: car.currency,
      });
      navigation.navigate('Travel/Payment', {
        reservationData: { reservation, car, renter: data, type: 'car' },
      });
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Rezervasyon oluşturulamadı');
    } finally {
      setIsLoading(false);
    }
  };

  if (!car) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Araç bilgisi bulunamadı</Text>
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
        <Card style={styles.carSummary}>
          <Text style={styles.sectionTitle}>Araç Özeti</Text>
          <Text style={styles.carName}>{car.name}</Text>
          <Text style={styles.carBrand}>{car.brand} - {car.type}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Toplam Tutar</Text>
            <Text style={styles.price}>
              {formatCurrency(car.price, car.currency)}
            </Text>
          </View>
        </Card>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Kiralayan Bilgileri</Text>

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

          <Input
            label="Ehliyet Numarası"
            placeholder="Ehliyet numaranız"
            control={control}
            name="licenseNumber"
            error={errors.licenseNumber?.message}
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
  carSummary: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  carName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  carBrand: {
    fontSize: 16,
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

