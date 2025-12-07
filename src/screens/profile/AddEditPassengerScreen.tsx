import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { passengerService, type Passenger } from '@/services/passengerService';
import { countries, type Country } from '@/constants/countries';
import { colors } from '@/constants/colors';

const passengerSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
  identityNumber: z.string().optional(),
  birthDay: z.string().min(1, 'Gün seçin'),
  birthMonth: z.string().min(1, 'Ay seçin'),
  birthYear: z.string().min(4, 'Yıl girin'),
  gender: z.enum(['male', 'female'], { required_error: 'Cinsiyet seçin' }),
  countryCode: z.string().min(2, 'Ülke seçin'),
  phone: z.string().optional(),
});

type PassengerFormData = z.infer<typeof passengerSchema>;

type RouteProp = RouteProp<{ AddEditPassenger: { passengerId?: string } }>;

export const AddEditPassengerScreen: React.FC = () => {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation();
  const { passengerId } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!passengerId);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PassengerFormData>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      identityNumber: '',
      birthDay: '',
      birthMonth: '',
      birthYear: '',
      gender: 'male',
      countryCode: 'TR',
      phone: '',
    },
  });

  useEffect(() => {
    if (passengerId) {
      loadPassenger();
    }
  }, [passengerId]);

  const loadPassenger = async () => {
    try {
      const passengers = await passengerService.getPassengers();
      const passenger = passengers.find((p) => p.id === passengerId);
      if (passenger) {
        reset({
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          identityNumber: passenger.identityNumber || '',
          birthDay: passenger.birthDay,
          birthMonth: passenger.birthMonth,
          birthYear: passenger.birthYear,
          gender: passenger.gender,
          countryCode: passenger.countryCode,
          phone: passenger.phone || '',
        });
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Yolcu bilgileri yüklenemedi');
    }
  };

  const onSubmit = async (data: PassengerFormData) => {
    setIsLoading(true);
    try {
      if (isEditMode && passengerId) {
        await passengerService.updatePassenger(passengerId, data);
        Alert.alert('Başarılı', 'Yolcu bilgileri güncellendi', [
          { text: 'Tamam', onPress: () => navigation.goBack() },
        ]);
      } else {
        await passengerService.addPassenger(data);
        Alert.alert('Başarılı', 'Yolcu eklendi', [
          { text: 'Tamam', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Yolcu kaydedilemedi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>
            {isEditMode ? 'Yolcu Düzenle' : 'Yeni Yolcu Ekle'}
          </Text>

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
            label="TC Kimlik No (Opsiyonel)"
            placeholder="11 haneli TC kimlik numarası"
            control={control}
            name="identityNumber"
            keyboardType="numeric"
            maxLength={11}
            error={errors.identityNumber?.message}
          />

          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Input
                label="Gün"
                placeholder="01"
                control={control}
                name="birthDay"
                keyboardType="numeric"
                maxLength={2}
                error={errors.birthDay?.message}
              />
            </View>
            <View style={styles.dateItem}>
              <Input
                label="Ay"
                placeholder="01"
                control={control}
                name="birthMonth"
                keyboardType="numeric"
                maxLength={2}
                error={errors.birthMonth?.message}
              />
            </View>
            <View style={styles.dateItem}>
              <Input
                label="Yıl"
                placeholder="1990"
                control={control}
                name="birthYear"
                keyboardType="numeric"
                maxLength={4}
                error={errors.birthYear?.message}
              />
            </View>
          </View>

          <Input
            label="Telefon (Opsiyonel)"
            placeholder="5XX XXX XX XX"
            control={control}
            name="phone"
            keyboardType="phone-pad"
            error={errors.phone?.message}
          />

          <Button
            title={isEditMode ? 'Güncelle' : 'Kaydet'}
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            style={styles.submitButton}
          />
        </Card>
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
  formCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 24,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateItem: {
    flex: 1,
  },
  submitButton: {
    marginTop: 24,
  },
});
