import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, KeyboardAvoidingView, Platform, Alert, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { apiClient } from '@/core/api/client';
import { formatDate, formatTime } from '@/utils/format';
import { colors } from '@/constants/colors';

const pnrQuerySchema = z.object({
  pnr: z.string().min(1, 'PNR kodu girin'),
  lastName: z.string().min(1, 'Soyadınızı girin'),
});

type PNRQueryFormData = z.infer<typeof pnrQuerySchema>;

export const PNRQueryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [reservation, setReservation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PNRQueryFormData>({
    resolver: zodResolver(pnrQuerySchema),
  });

  const onSubmit = async (data: PNRQueryFormData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/api/reservations/pnr-query', {
        pnr: data.pnr,
        lastName: data.lastName,
      });
      setReservation(response.data);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'PNR sorgulanamadı');
      setReservation(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Status bar yüksekliğine göre sabit padding
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {/* Status bar için padding */}
      <View style={{ height: statusBarHeight }} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>PNR Sorgulama</Text>
          <Text style={styles.subtitle}>
            Rezervasyon kodunuz (PNR) ve soyadınız ile bilet bilgilerinizi sorgulayabilirsiniz
          </Text>
        </View>

        <Card style={styles.formCard}>
          <Input
            label="PNR (Rezervasyon Kodu)"
            placeholder="Örn: ABC123"
            control={control}
            name="pnr"
            autoCapitalize="characters"
            error={errors.pnr?.message}
          />

          <Input
            label="Soyadınız"
            placeholder="Soyadınızı girin"
            control={control}
            name="lastName"
            autoCapitalize="words"
            error={errors.lastName?.message}
          />

          <Button
            title="Sorgula"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            style={styles.submitButton}
          />
        </Card>

        {reservation && (
          <Card style={styles.resultCard}>
            <View style={styles.successHeader}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successTitle}>Rezervasyon Bulundu</Text>
            </View>

            <View style={styles.reservationDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>PNR:</Text>
                <Text style={styles.detailValue}>{reservation.pnr}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Yolcu:</Text>
                <Text style={styles.detailValue}>
                  {reservation.passenger?.firstName} {reservation.passenger?.lastName}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Uçuş:</Text>
                <Text style={styles.detailValue}>
                  {reservation.flight?.flightNumber} - {reservation.flight?.airlineName}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Rota:</Text>
                <Text style={styles.detailValue}>
                  {reservation.flight?.origin} → {reservation.flight?.destination}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tarih:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(reservation.flight?.departureTime)} - {formatTime(reservation.flight?.departureTime)}
                </Text>
              </View>
            </View>
          </Card>
        )}
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
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 16,
  },
  resultCard: {
    marginTop: 16,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 48,
    color: colors.success,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  reservationDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
  },
});

