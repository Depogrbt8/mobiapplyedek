import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate, formatTime } from '@/utils/format';
import { apiClient } from '@/core/api/client';
import { colors } from '@/constants/colors';

const cancelTicketSchema = z.object({
  pnr: z.string().min(1, 'PNR kodu girin'),
  lastName: z.string().min(1, 'Soyadınızı girin'),
});

type CancelTicketFormData = z.infer<typeof cancelTicketSchema>;

export const CancelTicketScreen: React.FC = () => {
  const navigation = useNavigation();
  const [reservation, setReservation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cancellationStatus, setCancellationStatus] = useState<{ success: boolean; message: string } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CancelTicketFormData>({
    resolver: zodResolver(cancelTicketSchema),
  });

  const handleSearch = async (data: CancelTicketFormData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/api/reservations/pnr-query', {
        pnr: data.pnr,
        lastName: data.lastName,
      });
      setReservation(response.data);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Rezervasyon bulunamadı');
      setReservation(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!reservation) return;

    Alert.alert(
      'Bilet İptali',
      'Biletinizi iptal etmek istediğinizden emin misiniz? Havayolu kurallarına bağlı olarak ücret kesintisi uygulanabilir.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'İptal Et',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await apiClient.post(`/api/reservations/${reservation.id}/cancel`);
              setCancellationStatus({
                success: true,
                message: 'Bilet başarıyla iptal edildi',
              });
              setReservation(null);
            } catch (error: any) {
              setCancellationStatus({
                success: false,
                message: error.message || 'İptal işlemi başarısız oldu',
              });
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Bilet İptal</Text>
          <Text style={styles.subtitle}>
            PNR ve soyadınız ile biletinizi sorgulayıp iptal edebilirsiniz
          </Text>
        </View>

        {!reservation && !cancellationStatus && (
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
              title="Bileti Bul"
              onPress={handleSubmit(handleSearch)}
              loading={isLoading}
              fullWidth
              style={styles.submitButton}
            />
          </Card>
        )}

        {cancellationStatus && (
          <Card style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusIcon}>
                {cancellationStatus.success ? '✓' : '✗'}
              </Text>
              <Text
                style={[
                  styles.statusTitle,
                  cancellationStatus.success
                    ? styles.statusTitleSuccess
                    : styles.statusTitleError,
                ]}
              >
                {cancellationStatus.success ? 'İptal Başarılı' : 'İptal Başarısız'}
              </Text>
            </View>
            <Text
              style={[
                styles.statusMessage,
                cancellationStatus.success
                  ? styles.statusMessageSuccess
                  : styles.statusMessageError,
              ]}
            >
              {cancellationStatus.message}
            </Text>
          </Card>
        )}

        {reservation && !cancellationStatus && (
          <Card style={styles.reservationCard}>
            <Text style={styles.sectionTitle}>Rezervasyon Detayları</Text>

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
                  {reservation.flight?.airlineName} - {reservation.flight?.flightNumber}
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

            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>İptal Koşulları</Text>
              <Text style={styles.warningText}>
                Biletinizi iptal etmek istediğinizden emin misiniz? Havayolu kurallarına bağlı olarak ücret kesintisi uygulanabilir.
              </Text>
            </View>

            <Button
              title="Bileti İptal Et"
              onPress={handleCancel}
              loading={isLoading}
              fullWidth
              variant="outline"
              style={styles.cancelButton}
            />
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
  statusCard: {
    marginBottom: 24,
  },
  statusHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusTitleSuccess: {
    color: colors.success,
  },
  statusTitleError: {
    color: colors.error,
  },
  statusMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
  statusMessageSuccess: {
    color: colors.success,
  },
  statusMessageError: {
    color: colors.error,
  },
  reservationCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  reservationDetails: {
    gap: 12,
    marginBottom: 16,
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
  warningBox: {
    backgroundColor: colors.warning + '20',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.warning,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  cancelButton: {
    marginTop: 8,
  },
});

