import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

interface PriceSummaryProps {
  totalPassengers: number;
  baseTotalPrice: number;
  totalBaggagePrice: number;
  taxes: number;
  finalTotalPrice: number;
  termsAccepted: boolean;
  bookingType: 'reserve' | 'book';
  onTermsChange: (accepted: boolean) => void;
  onBookingTypeChange: (type: 'reserve' | 'book') => void;
  onProceedToPayment: () => void;
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({
  totalPassengers,
  baseTotalPrice,
  totalBaggagePrice,
  taxes,
  finalTotalPrice,
  termsAccepted,
  bookingType,
  onTermsChange,
  onBookingTypeChange,
  onProceedToPayment,
}) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Fiyat Özeti</Text>

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Bilet Fiyatı (x{totalPassengers})</Text>
        <Text style={styles.priceValue}>{baseTotalPrice.toFixed(2)} EUR</Text>
      </View>

      {totalBaggagePrice !== 0 && (
        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, styles.baggageLabel]}>Ek Bagaj Ücreti</Text>
          <Text style={[styles.priceValue, styles.baggageValue]}>{totalBaggagePrice.toFixed(2)} EUR</Text>
        </View>
      )}

      <View style={styles.priceRow}>
        <Text style={[styles.priceLabel, styles.taxLabel]}>Vergiler ve Harçlar</Text>
        <Text style={styles.priceValue}>{taxes.toFixed(2)} EUR</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Toplam</Text>
        <Text style={styles.totalValue}>{finalTotalPrice.toFixed(2)} EUR</Text>
      </View>

      {/* Terms Checkbox */}
      <View style={styles.termsContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => onTermsChange(!termsAccepted)}
        >
          {termsAccepted && (
            <Ionicons name="checkmark" size={16} color={colors.primary[600]} />
          )}
        </TouchableOpacity>
        <Text style={styles.termsText}>
          <Text style={styles.linkText}>Havayolu Taşıma Kuralları</Text>'nı,{' '}
          <Text style={styles.linkText}>Kullanım Şartları</Text>'nı ve{' '}
          <Text style={styles.linkText}>Gizlilik Politikası</Text>'nı okudum, anladım ve kabul ediyorum.
        </Text>
      </View>

      {/* Booking Type */}
      <View style={styles.bookingTypeContainer}>
        <Text style={styles.bookingTypeLabel}>İşlem Tipi</Text>
        <View style={styles.bookingTypeButtons}>
          <TouchableOpacity
            style={[styles.bookingTypeButton, bookingType === 'reserve' && styles.bookingTypeButtonActive]}
            onPress={() => onBookingTypeChange('reserve')}
          >
            <Text style={[styles.bookingTypeButtonText, bookingType === 'reserve' && styles.bookingTypeButtonTextActive]}>
              Rezervasyon Yap
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bookingTypeButton, bookingType === 'book' && styles.bookingTypeButtonActive]}
            onPress={() => onBookingTypeChange('book')}
          >
            <Text style={[styles.bookingTypeButtonText, bookingType === 'book' && styles.bookingTypeButtonTextActive]}>
              Bileti Al
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Proceed Button */}
      <View style={styles.proceedButtonContainer}>
        <Button
          title="Ödemeye İlerle"
          onPress={onProceedToPayment}
          disabled={!termsAccepted}
          fullWidth
          style={styles.proceedButton}
        />
      </View>

      {/* Payment Methods */}
      <View style={styles.paymentMethods}>
        <View style={styles.paymentIcons}>
          <Text style={styles.paymentText}>VISA</Text>
          <Text style={styles.paymentText}>Mastercard</Text>
          <Text style={styles.paymentText}>Klarna</Text>
          <Text style={styles.paymentText}>PayPal</Text>
        </View>
        <View style={styles.securityInfo}>
          <Ionicons name="lock-closed-outline" size={12} color={colors.text.secondary} />
          <Text style={styles.securityText}>SSL ile korunan güvenli ödeme</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 0, // Parent container'da margin var
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  baggageLabel: {
    color: colors.info,
    fontWeight: '500',
  },
  taxLabel: {
    fontSize: 12,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  baggageValue: {
    color: colors.info,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
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
  termsText: {
    flex: 1,
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  linkText: {
    textDecorationLine: 'underline',
    color: colors.text.primary,
  },
  bookingTypeContainer: {
    marginBottom: 16,
  },
  bookingTypeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  bookingTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  bookingTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  bookingTypeButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  bookingTypeButtonText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  bookingTypeButtonTextActive: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  proceedButtonContainer: {
    marginBottom: 16,
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  paymentMethods: {
    gap: 8,
  },
  paymentIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.disabled,
  },
  securityInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  securityText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
});

