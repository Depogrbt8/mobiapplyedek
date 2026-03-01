import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp as NavRouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ContactForm } from '../components/booking/ContactForm';
import { GuestInfoSection, createEmptyGuest } from '../components/booking/GuestInfoSection';
import { HotelPriceSummary } from '../components/booking/HotelPriceSummary';
import { createBooking, calculateNights } from '../services/hotelService';
import type { GuestInfo, HotelDetails, RoomType, Rate, HotelSearchParams, HotelGuest } from '../types/hotel';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';

type HotelReservationRouteProp = NavRouteProp<TravelStackParamList, 'Travel/HotelReservation'>;
type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/HotelReservation'>;

export const HotelReservationScreen: React.FC = () => {
  const route = useRoute<HotelReservationRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { hotel, room, rate, searchParams } = route.params as {
    hotel: HotelDetails;
    room: RoomType;
    rate: Rate;
    searchParams: HotelSearchParams;
  };
  const { user } = useAuthStore();

  const guests = searchParams?.guests ?? { adults: 1, children: 0, rooms: 1 };
  const totalGuests = guests.adults + guests.children;

  const initialGuestDetails = useMemo(() => {
    return Array.from({ length: totalGuests }, (_, i) =>
      createEmptyGuest(i < guests.adults ? 'adult' : 'child')
    );
  }, [totalGuests, guests.adults]);

  const [isLoading, setIsLoading] = useState(false);
  const [guestDetails, setGuestDetails] = useState<HotelGuest[]>(initialGuestDetails);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+90');
  const [specialRequests, setSpecialRequests] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // İlk açılışta guestDetails'ı misafir sayısına göre doldur (route params değişirse)
  useEffect(() => {
    const nextTotal = (searchParams?.guests?.adults ?? 1) + (searchParams?.guests?.children ?? 0);
    if (guestDetails.length !== nextTotal) {
      setGuestDetails((prev) => {
        if (prev.length >= nextTotal) return prev.slice(0, nextTotal);
        const next = [...prev];
        const adults = searchParams?.guests?.adults ?? 1;
        for (let i = prev.length; i < nextTotal; i++) {
          next.push(createEmptyGuest(i < adults ? 'adult' : 'child'));
        }
        return next.slice(0, nextTotal);
      });
    }
  }, [searchParams?.guests?.adults, searchParams?.guests?.children]);

  // Kullanıcı bilgilerini otomatik doldur
  useEffect(() => {
    if (user) {
      setContactEmail(user.email || '');
      setContactPhone(user.phone || '');
      if (guestDetails.length > 0) {
        setGuestDetails((prev) => {
          const next = [...prev];
          next[0] = {
            ...next[0],
            firstName: user.firstName || next[0].firstName,
            lastName: user.lastName || next[0].lastName,
          };
          return next;
        });
      }
    }
  }, [user]);

  // Form validasyonu: tüm misafirler + iletişim + şartlar
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const details = guestDetails.slice(0, totalGuests);

    details.forEach((guest, idx) => {
      if (!guest.firstName || guest.firstName.trim().length < 2) {
        newErrors[`guest_${idx}_firstName`] = 'Ad en az 2 karakter olmalıdır';
      }
      if (!guest.lastName || guest.lastName.trim().length < 2) {
        newErrors[`guest_${idx}_lastName`] = 'Soyad en az 2 karakter olmalıdır';
      }
    });

    if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    if (!contactPhone || contactPhone.trim().length < 10) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz';
    }
    if (!agreedToTerms) {
      newErrors.terms = 'Şartları kabul etmelisiniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!hotel || !room || !rate || !searchParams) {
      Alert.alert('Hata', 'Rezervasyon bilgileri eksik');
      return;
    }

    const details = guestDetails.slice(0, totalGuests);
    const contactInfo = {
      email: contactEmail,
      phone: contactPhone,
      countryCode,
    };
    const guestInfoForApi: GuestInfo = {
      firstName: details[0]?.firstName ?? '',
      lastName: details[0]?.lastName ?? '',
      email: contactEmail,
      phone: contactPhone,
      countryCode,
    };

    setIsLoading(true);
    try {
      const bookingRequest = {
        hotelId: hotel.id,
        roomTypeId: room.id,
        rateId: rate.id,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        guests: searchParams.guests,
        guestInfo: guestInfoForApi,
        contactInfo,
        guestDetails: details,
        specialRequests: specialRequests || undefined,
      };

      const bookingResponse = await createBooking(bookingRequest);

      navigation.navigate('Travel/HotelReservationSuccess', {
        booking: bookingResponse,
        hotel,
        room,
        rate,
        guest: guestInfoForApi,
        guestDetails: details,
        guests: searchParams.guests,
        searchParams,
      });
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Rezervasyon oluşturulamadı');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hotel || !room || !rate || !searchParams) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Rezervasyon bilgileri bulunamadı</Text>
        <Button title="Geri" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const nights = calculateNights(searchParams.checkIn, searchParams.checkOut);
  const totalPrice = rate.price * nights * searchParams.guests.rooms;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.content}
        style={styles.scrollView}
      >
        {/* Fiyat Özeti - En Üstte Beyaz Arka Plan */}
        <View style={styles.priceSummaryContainer}>
          <HotelPriceSummary
          hotelName={hotel.name}
          roomName={room.name}
          rateName={rate.name}
          checkIn={searchParams.checkIn}
          checkOut={searchParams.checkOut}
          guests={searchParams.guests}
          totalPrice={totalPrice}
          currency={rate.currency}
          hotelImage={hotel.images && hotel.images[0] ? hotel.images[0] : undefined}
          hotelLocation={`${hotel.location.city}, ${hotel.location.country || 'Türkiye'}`}
          />
        </View>

        {/* Form Alanları */}
        <View style={styles.formsContainer}>
          {/* İletişim Bilgileri */}
          {!user && (
            <View style={styles.loginHintContainer}>
              <Text style={styles.loginHint}>
                Hızlı rezervasyon için{' '}
                <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
                  giriş yap
                </Text>
              </Text>
            </View>
          )}
          <ContactForm
          userEmail={contactEmail}
          userPhone={contactPhone}
          onEmailChange={setContactEmail}
          onPhoneChange={setContactPhone}
          onCountryCodeChange={setCountryCode}
          countryCode={countryCode}
        />

        {/* Misafir Bilgileri - Ana site mobil görünümü ile aynı (beyaz kart, yuvarlak cinsiyet) */}
        <Card style={[styles.sectionCard, styles.guestInfoCard]}>
          <Text style={styles.sectionTitle}>Misafir Bilgileri</Text>
          <Text style={styles.guestSubtitle}>
            {guests.children > 0
              ? `${guests.adults} yetişkin, ${guests.children} çocuk için bilgileri girin.`
              : `${guests.adults} yetişkin için bilgileri girin.`}
          </Text>
          <GuestInfoSection
            guests={searchParams.guests}
            guestDetails={guestDetails}
            onChange={setGuestDetails}
            errors={errors}
            variant="payment"
          />
        </Card>

        {/* Özel İstekler */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Özel İstekler</Text>
          <Text style={styles.specialRequestsHint}>
            Özel istekleriniz garanti edilmez ancak otel elinizden geleni yapmaya çalışacaktır.
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Örn: Yüksek katta oda, erken check-in..."
            placeholderTextColor={colors.text.secondary}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Card>

        {/* Şartlar ve Koşullar */}
        <Card style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && (
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              )}
            </View>
            <Text style={styles.termsText}>
              Rezervasyon koşullarını, gizlilik politikasını ve iptal kurallarını okudum ve kabul ediyorum.
            </Text>
          </TouchableOpacity>
          {errors.terms && (
            <Text style={styles.errorText}>{errors.terms}</Text>
          )}
        </Card>

        </View>

        {/* Ödeme Butonu */}
        <View style={styles.submitButtonContainer}>
          <Button
            title="Rezervasyonu Tamamla"
            onPress={handleSubmit}
            loading={isLoading}
            fullWidth
            style={styles.submitButton}
          />
          <Text style={styles.submitHint}>
            Ödeme güvenli bağlantı üzerinden yapılacaktır
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  scrollView: {
    backgroundColor: colors.gray[100],
  },
  content: {
    paddingBottom: 16,
  },
  priceSummaryContainer: {
    backgroundColor: colors.gray[100],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  sectionCard: {
    marginBottom: 16,
    marginTop: 0,
    padding: 16,
  },
  guestInfoCard: {
    marginTop: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: -8,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  loginHintContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  loginHint: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  loginLink: {
    color: colors.primary[600],
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  specialRequestsHint: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text.primary,
    backgroundColor: colors.background,
    minHeight: 100,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  formsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  submitButtonContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: colors.background,
  },
  submitButton: {
    marginBottom: 12,
  },
  submitHint: {
    fontSize: 12,
    color: colors.gray[500],
    textAlign: 'center',
  },
});

