import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { BirthDatePicker } from '@/components/ui/BirthDatePicker';
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
    watch,
    setValue,
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
      countryCode: '+90',
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

  // Ülke kodları - Bayrak ve ülke ismi ile göster, duplicate'leri filtrele
  const uniquePhoneCodes = new Map<string, { phoneCode: string; flag: string; name: string }>();
  countries.forEach(country => {
    if (!uniquePhoneCodes.has(country.phoneCode)) {
      uniquePhoneCodes.set(country.phoneCode, {
        phoneCode: country.phoneCode,
        flag: country.flag,
        name: country.name,
      });
    }
  });
  const countryCodeOptions = Array.from(uniquePhoneCodes.values()).map((country) => ({
    label: `${country.flag} ${country.name} (${country.phoneCode})`,
    value: country.phoneCode,
  }));

  // Seçili ülkenin bayrağını ve kodunu bul (kapalıyken bayrak + kod gösterilecek)
  const selectedCountryCode = watch('countryCode');
  const selectedCountry = countries.find(country => country.phoneCode === selectedCountryCode);
  const countryCodeDisplayValue = selectedCountry ? `${selectedCountry.flag} ${selectedCountry.phoneCode}` : undefined;

  const onSubmit = async (data: PassengerFormData) => {
    setIsLoading(true);
    try {
      // Debug: Backend'e gönderilen veriyi logla
      console.log('📤 Backend\'e gönderilen yolcu verisi:', {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        countryCode: data.countryCode,
        phone: data.phone,
        birthDay: data.birthDay,
        birthMonth: data.birthMonth,
        birthYear: data.birthYear,
        identityNumber: data.identityNumber,
      });

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

          {/* Doğum Tarihi */}
          <BirthDatePicker
            label="Doğum Tarihi"
            day={watch('birthDay')}
            month={watch('birthMonth')}
            year={watch('birthYear')}
            onSelect={(day, month, year) => {
              console.log('📅 Tarih seçildi:', { day, month, year });
              setValue('birthDay', day);
              setValue('birthMonth', month);
              setValue('birthYear', year);
            }}
            placeholder="Doğum Tarihi"
          />
          {(errors.birthDay || errors.birthMonth || errors.birthYear) && (
            <Text style={styles.errorText}>
              {errors.birthDay?.message || errors.birthMonth?.message || errors.birthYear?.message}
            </Text>
          )}

          {/* Cinsiyet */}
          <Text style={styles.label}>Cinsiyet</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderOption,
                watch('gender') === 'male' && styles.genderOptionSelected,
              ]}
              onPress={() => setValue('gender', 'male')}
            >
              <Text
                style={[
                  styles.genderText,
                  watch('gender') === 'male' && styles.genderTextSelected,
                ]}
              >
                Erkek
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderOption,
                watch('gender') === 'female' && styles.genderOptionSelected,
              ]}
              onPress={() => setValue('gender', 'female')}
            >
              <Text
                style={[
                  styles.genderText,
                  watch('gender') === 'female' && styles.genderTextSelected,
                ]}
              >
                Kadın
              </Text>
            </TouchableOpacity>
          </View>
          {errors.gender && (
            <Text style={styles.errorText}>{errors.gender.message}</Text>
          )}

          {/* TC Kimlik No */}
          <Input
            label="TC Kimlik No (Opsiyonel)"
            placeholder="11 haneli TC kimlik numarası"
            control={control}
            name="identityNumber"
            keyboardType="numeric"
            maxLength={11}
            error={errors.identityNumber?.message}
          />

          {/* Telefon */}
          <Text style={styles.label}>Telefon (Opsiyonel)</Text>
          <View style={styles.phoneContainer}>
            <View style={styles.countryCodeContainer}>
              <Select
                value={selectedCountryCode}
                options={countryCodeOptions}
                onSelect={(value) => {
                  setValue('countryCode', String(value));
                }}
                placeholder="Ülke"
                displayValue={countryCodeDisplayValue}
                error={errors.countryCode?.message}
              />
            </View>
            <View style={styles.phoneInputContainer}>
              <Input
                placeholder="Telefon"
                control={control}
                name="phone"
                keyboardType="phone-pad"
                error={errors.phone?.message}
              />
            </View>
          </View>

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
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  countryCodeContainer: {
    width: 120,
  },
  phoneInputContainer: {
    flex: 1,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderOptionSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  genderText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  genderTextSelected: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: -12,
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 24,
  },
});
