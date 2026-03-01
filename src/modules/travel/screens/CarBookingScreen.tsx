// Araç Rezervasyon Ekranı - Desktop (grbt8) birebir React Native
// Sürücü formu, ehliyet, rota özeti, fiyat kırılımı, sigorta, ekstra, onay

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createBooking } from '../services/car/api';
import { carBookingService } from '@/services/carBookingService';
import type {
  CarDetails,
  SimpleCarSearchParams,
  Driver,
  CarBookingData,
} from '../types/car';
import { formatCarPrice, formatCarDateTime, calculateDays } from '../utils/carHelpers';
import { CAR_CATEGORY_LABELS, TRANSMISSION_LABELS } from '../types/car';
import type { TravelStackParamList } from '@/core/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';

type CarBookingRouteProp = RouteProp<TravelStackParamList, 'Travel/CarBooking'>;
type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/CarBooking'>;

export const CarBookingScreen: React.FC = () => {
  const route = useRoute<CarBookingRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { car, searchParams, searchToken, selectedInsurance, selectedExtras } =
    route.params as {
      car: CarDetails;
      searchParams: SimpleCarSearchParams;
      searchToken: string;
      selectedInsurance: string | null;
      selectedExtras: Record<string, number>;
    };
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');

  // Sürücü formu
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [countryCode, setCountryCode] = useState('+90');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');

  const days = calculateDays(searchParams.pickupDate, searchParams.dropoffDate);

  // Fiyat hesaplama
  const priceBreakdown = useMemo(() => {
    const basePrice = car.pricePerDay * days;

    const insuranceOption = car.insuranceOptions?.find((i) => i.id === selectedInsurance);
    const insuranceCost =
      insuranceOption && !insuranceOption.included ? insuranceOption.price * days : 0;

    const extraItems = Object.entries(selectedExtras || {}).map(([id, qty]) => {
      const service = car.extraServices?.find((s) => s.id === id);
      if (!service) return { name: '', amount: 0 };
      const amount =
        (service.unit === 'per_day' ? service.price * days : service.price) * qty;
      return { name: service.name, amount };
    });
    const extrasTotal = extraItems.reduce((sum, e) => sum + e.amount, 0);

    const subtotal = basePrice + insuranceCost + extrasTotal;
    const taxRate = 18;
    const tax = Math.round((subtotal * taxRate) / 100);
    const total = subtotal + tax;

    return {
      basePrice,
      insuranceCost,
      extraItems,
      extrasTotal,
      subtotal,
      tax,
      taxRate,
      total,
    };
  }, [car, days, selectedInsurance, selectedExtras]);

  const validateForm = (): boolean => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Hata', 'Ad ve soyad zorunludur');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin');
      return false;
    }
    if (!phone.trim() || phone.length < 10) {
      Alert.alert('Hata', 'Geçerli bir telefon numarası girin');
      return false;
    }
    if (!licenseNumber.trim()) {
      Alert.alert('Hata', 'Ehliyet numarası zorunludur');
      return false;
    }
    if (!agreedToTerms) {
      Alert.alert('Hata', 'Lütfen koşulları kabul edin');
      return false;
    }
    return true;
  };

  const handleBooking = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // 1. Demo API ile rezervasyon oluştur
      const bookingData: CarBookingData = {
        carId: car.id,
        searchToken,
        route: {
          pickup: {
            depotId: car.pickupDepot.id,
            datetime: `${searchParams.pickupDate}T${searchParams.pickupTime}:00`,
          },
          dropoff: {
            depotId: car.dropoffDepot.id,
            datetime: `${searchParams.dropoffDate}T${searchParams.dropoffTime}:00`,
          },
        },
        driver: {
          firstName,
          lastName,
          email,
          phone,
          countryCode,
          dateOfBirth: dateOfBirth || '1990-01-01',
          age: 30,
          license: {
            number: licenseNumber,
            issueDate: '2020-01-01',
            expiryDate: licenseExpiry || '2030-01-01',
            issueCountry: 'TR',
          },
          identity: {
            type: 'id_card',
            number: identityNumber || '00000000000',
            issueCountry: 'TR',
          },
        },
        extras: Object.entries(selectedExtras || {}).map(([serviceId, quantity]) => ({
          serviceId,
          quantity,
        })),
        insurance: selectedInsurance ? { optionId: selectedInsurance } : undefined,
        payment: {
          method: 'credit_card',
          timing: 'pay_online_now',
        },
        specialRequests: specialRequests || undefined,
      };

      const booking = await createBooking(bookingData);

      // 2. Backend'e de gönder (admin panele düşsün)
      try {
        await carBookingService.createBooking({
          carName: car.name,
          carType: car.category,
          carCategory: car.category,
          supplierId: car.supplierId,
          supplierName: car.supplierName,
          driver: JSON.stringify({ firstName, lastName, email, phone, licenseNumber }),
          pickupLocation: JSON.stringify({
            id: searchParams.pickupLocationId,
            name: searchParams.pickupLocationName,
          }),
          dropoffLocation: JSON.stringify({
            id: searchParams.dropoffLocationId,
            name: searchParams.dropoffLocationName,
          }),
          pickupDatetime: `${searchParams.pickupDate}T${searchParams.pickupTime}:00`,
          dropoffDatetime: `${searchParams.dropoffDate}T${searchParams.dropoffTime}:00`,
          amount: priceBreakdown.total,
          currency: car.currency,
          insuranceType: selectedInsurance || undefined,
          extras:
            Object.keys(selectedExtras || {}).length > 0
              ? JSON.stringify(selectedExtras)
              : undefined,
          specialRequests: specialRequests || undefined,
          searchToken,
        });
      } catch (backendError) {
        // Backend hatası olsa bile demo rezervasyon başarılı
        if (__DEV__) {
          console.warn('Backend booking failed (demo still OK):', backendError);
        }
      }

      // 3. Başarı ekranına yönlendir
      navigation.navigate('Travel/CarBookingSuccess', {
        booking,
        searchParams,
      });
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Rezervasyon oluşturulamadı');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Araç & Rota Özeti */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Rezervasyon Özeti</Text>

          <View style={styles.carSummary}>
            <Text style={styles.carName}>{car.name}</Text>
            <Text style={styles.carMeta}>
              {CAR_CATEGORY_LABELS[car.category]} · {TRANSMISSION_LABELS[car.transmission]} ·{' '}
              {car.supplierName}
            </Text>
          </View>

          <View style={styles.routeBox}>
            <View style={styles.routeItem}>
              <Ionicons name="location" size={18} color={colors.primary[600]} />
              <View>
                <Text style={styles.routeLabel}>Alış</Text>
                <Text style={styles.routeValue}>{searchParams.pickupLocationName}</Text>
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
                <Text style={styles.routeValue}>{searchParams.dropoffLocationName}</Text>
                <Text style={styles.routeDate}>
                  {formatCarDateTime(searchParams.dropoffDate, searchParams.dropoffTime)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.daysRow}>
            <Text style={styles.daysLabel}>Kiralama Süresi</Text>
            <Text style={styles.daysValue}>{days} gün</Text>
          </View>
        </Card>

        {/* Sürücü Bilgileri Formu */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Sürücü Bilgileri</Text>

          <View style={styles.formRow}>
            <FormInput
              label="Ad *"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Adınız"
              autoCapitalize="words"
              style={styles.halfInput}
            />
            <FormInput
              label="Soyad *"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Soyadınız"
              autoCapitalize="words"
              style={styles.halfInput}
            />
          </View>

          <FormInput
            label="E-posta *"
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormInput
            label="Telefon *"
            value={phone}
            onChangeText={setPhone}
            placeholder="5XX XXX XX XX"
            keyboardType="phone-pad"
          />

          <FormInput
            label="Doğum Tarihi"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="YYYY-MM-DD"
          />

          <FormInput
            label="Ehliyet Numarası *"
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            placeholder="Ehliyet numaranız"
          />

          <FormInput
            label="Ehliyet Son Geçerlilik"
            value={licenseExpiry}
            onChangeText={setLicenseExpiry}
            placeholder="YYYY-MM-DD"
          />

          <FormInput
            label="TC Kimlik / Pasaport No"
            value={identityNumber}
            onChangeText={setIdentityNumber}
            placeholder="Kimlik numaranız"
          />
        </Card>

        {/* Özel İstekler */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Özel İstekler</Text>
          <TextInput
            style={styles.textArea}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            placeholder="Varsa özel isteklerinizi yazın..."
            placeholderTextColor={colors.gray[400]}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Card>

        {/* Fiyat Kırılımı */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Fiyat Detayı</Text>

          <PriceRow
            label={`Araç kirası (${days} gün x ${formatCarPrice(car.pricePerDay, car.currency)})`}
            value={formatCarPrice(priceBreakdown.basePrice, car.currency)}
          />

          {priceBreakdown.insuranceCost > 0 && (
            <PriceRow
              label="Sigorta"
              value={formatCarPrice(priceBreakdown.insuranceCost, car.currency)}
            />
          )}

          {priceBreakdown.extraItems
            .filter((e) => e.amount > 0)
            .map((e, i) => (
              <PriceRow
                key={i}
                label={e.name}
                value={formatCarPrice(e.amount, car.currency)}
              />
            ))}

          <PriceRow
            label="Ara Toplam"
            value={formatCarPrice(priceBreakdown.subtotal, car.currency)}
          />

          <PriceRow
            label={`KDV (%${priceBreakdown.taxRate})`}
            value={formatCarPrice(priceBreakdown.tax, car.currency)}
          />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Genel Toplam</Text>
            <Text style={styles.totalValue}>
              {formatCarPrice(priceBreakdown.total, car.currency)}
            </Text>
          </View>
        </Card>

        {/* Koşullar */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          activeOpacity={0.7}
        >
          <View style={[styles.termsCheckbox, agreedToTerms && styles.termsCheckboxChecked]}>
            {agreedToTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <Text style={styles.termsText}>
            Kiralama koşullarını ve iptal politikasını okudum, kabul ediyorum.
          </Text>
        </TouchableOpacity>

        {/* Rezervasyon butonu */}
        <Button
          title={isLoading ? 'Rezervasyon Oluşturuluyor...' : 'Rezervasyonu Tamamla'}
          onPress={handleBooking}
          loading={isLoading}
          disabled={isLoading || !agreedToTerms}
          fullWidth
          style={styles.bookButton}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Form Input component
const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  style,
}: any) => (
  <View style={[styles.inputGroup, style]}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.gray[400]}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
    />
  </View>
);

// Fiyat satırı component
const PriceRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.priceRow}>
    <Text style={styles.priceRowLabel}>{label}</Text>
    <Text style={styles.priceRowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: 12,
  },
  section: {
    marginBottom: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 14,
  },
  // Car summary
  carSummary: {
    marginBottom: 12,
  },
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
    marginBottom: 12,
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
    height: 20,
    backgroundColor: colors.gray[300],
    marginLeft: 9,
    marginVertical: 4,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  // Form
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
    marginLeft: 2,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 15,
    color: colors.text.primary,
  },
  textArea: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text.primary,
    minHeight: 80,
  },
  // Price breakdown
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  priceRowLabel: {
    fontSize: 13,
    color: colors.gray[600],
    flex: 1,
    marginRight: 8,
  },
  priceRowValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary[600],
  },
  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 4,
    marginBottom: 16,
    marginTop: 4,
  },
  termsCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  termsCheckboxChecked: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: colors.gray[600],
    lineHeight: 18,
  },
  bookButton: {
    marginTop: 4,
  },
});
