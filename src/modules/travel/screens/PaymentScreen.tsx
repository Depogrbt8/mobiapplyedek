import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { paymentService } from '../services/paymentService';
import { formatCurrency } from '@/utils/format';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';

// Calculate total amount based on reservation type
const calculateTotal = (reservationData: any): number => {
  if (reservationData?.type === 'flight') {
    return reservationData?.flight?.price || 0;
  } else if (reservationData?.type === 'hotel') {
    return reservationData?.hotel?.price || 0;
  } else if (reservationData?.type === 'car') {
    return reservationData?.car?.price || 0;
  }
  return 0;
};

const getCurrency = (reservationData: any): string => {
  if (reservationData?.type === 'flight') {
    return reservationData?.flight?.currency || 'TRY';
  } else if (reservationData?.type === 'hotel') {
    return reservationData?.hotel?.currency || 'TRY';
  } else if (reservationData?.type === 'car') {
    return reservationData?.car?.currency || 'TRY';
  }
  return 'TRY';
};

type RouteProp = RouteProp<TravelStackParamList, 'Travel/Payment'>;
type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/Payment'>;

const paymentSchema = z.object({
  cardNumber: z.string().min(16, 'Kart numarası 16 haneli olmalı').max(19),
  cardHolder: z.string().min(3, 'Kart sahibi adı girin'),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Geçerli bir ay girin (01-12)'),
  expiryYear: z.string().regex(/^\d{2}$/, 'Geçerli bir yıl girin (YY)'),
  cvv: z.string().min(3, 'CVV 3 haneli olmalı').max(4),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export const PaymentScreen: React.FC = () => {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { reservationData } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const onSubmit = async (data: PaymentFormData) => {
    setIsLoading(true);
    try {
      const reservation = reservationData?.reservation;
      if (!reservation || !reservation.id) {
        Alert.alert('Hata', 'Rezervasyon bilgisi bulunamadı');
        return;
      }

      // Get customer info from reservation or user
      const customerEmail = reservationData?.passenger?.email || reservationData?.guest?.email || reservationData?.renter?.email || 'customer@example.com';
      const customerPhone = reservationData?.passenger?.phone || reservationData?.guest?.phone || reservationData?.renter?.phone || '5551234567';

      // Tokenize card first (in production, use payment gateway SDK)
      let paymentToken: string | undefined;
      try {
        paymentToken = await paymentService.tokenizeCard(
          data.cardNumber.replace(/\s/g, ''),
          data.expiryMonth,
          data.expiryYear,
          data.cvv
        );
      } catch (tokenError) {
        // If tokenization fails, continue without token (backend will handle)
        console.warn('Card tokenization failed, proceeding without token');
      }

      const totalAmount = calculateTotal(reservationData);
      const currency = getCurrency(reservationData);

      // Process payment with backend format
      const payment = await paymentService.processPayment({
        orderId: reservation.id,
        amount: totalAmount,
        currency,
        customerEmail,
        customerPhone,
        paymentToken,
      });

      if (payment.requires3DSecure && payment.redirectUrl) {
        // Navigate to 3D Secure screen
        navigation.navigate('Travel/3DSecure' as never, {
          redirectUrl: payment.redirectUrl,
          reservationId: reservation.id,
        } as never);
      } else if (payment.success) {
        navigation.navigate('Travel/ReservationSuccess', { reservationId: reservation.id });
      } else {
        Alert.alert('Ödeme Hatası', payment.message || payment.error || 'Ödeme işlemi başarısız oldu');
      }
    } catch (error: any) {
      Alert.alert('Ödeme Hatası', error.message || 'Ödeme işlemi başarısız oldu');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (text: string) => {
    return text.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Ödeme Özeti</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Toplam Tutar</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(calculateTotal(reservationData), getCurrency(reservationData))}
            </Text>
          </View>
        </Card>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Kart Bilgileri</Text>

          <Input
            label="Kart Numarası"
            placeholder="1234 5678 9012 3456"
            control={control}
            name="cardNumber"
            keyboardType="number-pad"
            maxLength={19}
            error={errors.cardNumber?.message}
          />

          <Input
            label="Kart Sahibi"
            placeholder="AD SOYAD"
            control={control}
            name="cardHolder"
            autoCapitalize="characters"
            error={errors.cardHolder?.message}
          />

          <View style={styles.expiryRow}>
            <View style={styles.expiryInput}>
              <Input
                label="Son Kullanma Ayı"
                placeholder="MM"
                control={control}
                name="expiryMonth"
                keyboardType="number-pad"
                maxLength={2}
                error={errors.expiryMonth?.message}
              />
            </View>
            <View style={styles.expiryInput}>
              <Input
                label="Son Kullanma Yılı"
                placeholder="YY"
                control={control}
                name="expiryYear"
                keyboardType="number-pad"
                maxLength={2}
                error={errors.expiryYear?.message}
              />
            </View>
            <View style={styles.cvvInput}>
              <Input
                label="CVV"
                placeholder="123"
                control={control}
                name="cvv"
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                error={errors.cvv?.message}
              />
            </View>
          </View>

          <Button
            title="Ödemeyi Tamamla"
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
  summaryCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary[600],
  },
  form: {
    gap: 16,
  },
  expiryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  expiryInput: {
    flex: 1,
  },
  cvvInput: {
    flex: 1,
  },
  submitButton: {
    marginTop: 24,
  },
});

