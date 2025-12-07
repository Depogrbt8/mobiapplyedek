import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTravelStore } from '../store/travelStore';
import { reservationService } from '../services/reservationService';
import { formatCurrency, formatTime, formatDate } from '@/utils/format';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';
import type { PassengerFormData } from '@/types/passenger';

type RouteProp = RouteProp<TravelStackParamList, 'Travel/Reservation'>;
type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/Reservation'>;

const passengerSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
  identityNumber: z.string().min(11, 'TC Kimlik No 11 karakter olmalı'),
  birthDay: z.string().min(1, 'Doğum günü seçin'),
  birthMonth: z.string().min(1, 'Doğum ayı seçin'),
  birthYear: z.string().min(4, 'Doğum yılı seçin'),
  countryCode: z.string().min(2, 'Ülke kodu seçin'),
  phone: z.string().min(10, 'Telefon numarası geçerli değil'),
  gender: z.enum(['male', 'female'], { required_error: 'Cinsiyet seçin' }),
});

type PassengerFormType = z.infer<typeof passengerSchema>;

export const ReservationScreen: React.FC = () => {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { selectedFlight } = useTravelStore();
  const [isLoading, setIsLoading] = useState(false);

  const flight = selectedFlight || route.params?.flight;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PassengerFormType>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      countryCode: 'TR',
      gender: 'male',
    },
  });

  const onSubmit = async (data: PassengerFormType) => {
    setIsLoading(true);
    try {
      // Create flight reservation
      const reservation = await reservationService.createFlightReservation({
        type: 'flight',
        flightId: flight.id,
        passenger: data,
        amount: flight.price,
        currency: flight.currency,
      });
      navigation.navigate('Travel/Payment', {
        reservationData: { reservation, flight, passenger: data, type: 'flight' },
      });
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Rezervasyon oluşturulamadı');
    } finally {
      setIsLoading(false);
    }
  };

  if (!flight) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Uçuş bilgisi bulunamadı</Text>
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
        <Card style={styles.flightSummary}>
          <Text style={styles.sectionTitle}>Uçuş Özeti</Text>
          <View style={styles.flightInfo}>
            <View style={styles.routeInfo}>
              <Text style={styles.airport}>{flight.origin}</Text>
              <Text style={styles.arrow}>→</Text>
              <Text style={styles.airport}>{flight.destination}</Text>
            </View>
            <Text style={styles.flightDetails}>
              {formatTime(flight.departureTime)} - {formatDate(flight.departureTime)}
            </Text>
            <Text style={styles.price}>{formatCurrency(flight.price, flight.currency)}</Text>
          </View>
        </Card>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Yolcu Bilgileri</Text>

          <View style={styles.nameRow}>
            <View style={styles.nameInput}>
              <Input
                label="Ad"
                placeholder="Adınız"
                control={control}
                name="firstName"
                autoCapitalize="words"
                error={errors.firstName?.message}
              />
            </View>
            <View style={styles.nameInput}>
              <Input
                label="Soyad"
                placeholder="Soyadınız"
                control={control}
                name="lastName"
                autoCapitalize="words"
                error={errors.lastName?.message}
              />
            </View>
          </View>

          <Input
            label="TC Kimlik No"
            placeholder="11 haneli TC Kimlik No"
            control={control}
            name="identityNumber"
            keyboardType="number-pad"
            maxLength={11}
            error={errors.identityNumber?.message}
          />

          <View style={styles.dateRow}>
            <View style={styles.dateInput}>
              <Input
                label="Doğum Günü"
                placeholder="Gün"
                control={control}
                name="birthDay"
                keyboardType="number-pad"
                maxLength={2}
                error={errors.birthDay?.message}
              />
            </View>
            <View style={styles.dateInput}>
              <Input
                label="Doğum Ayı"
                placeholder="Ay"
                control={control}
                name="birthMonth"
                keyboardType="number-pad"
                maxLength={2}
                error={errors.birthMonth?.message}
              />
            </View>
            <View style={styles.dateInput}>
              <Input
                label="Doğum Yılı"
                placeholder="Yıl"
                control={control}
                name="birthYear"
                keyboardType="number-pad"
                maxLength={4}
                error={errors.birthYear?.message}
              />
            </View>
          </View>

          <View style={styles.genderRow}>
            <Text style={styles.label}>Cinsiyet</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity style={styles.genderButton}>
                <Text style={styles.genderButtonText}>Erkek</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.genderButton}>
                <Text style={styles.genderButtonText}>Kadın</Text>
              </TouchableOpacity>
            </View>
          </View>

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
  flightSummary: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  flightInfo: {
    gap: 8,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  airport: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  arrow: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  flightDetails: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary[600],
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  genderRow: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  genderButtonText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  submitButton: {
    marginTop: 24,
  },
});

