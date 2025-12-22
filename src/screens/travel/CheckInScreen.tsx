import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, KeyboardAvoidingView, Platform, Alert, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate, formatTime } from '@/utils/format';
import { colors } from '@/constants/colors';

const checkInSchema = z.object({
  bookingRef: z.string().min(1, 'Rezervasyon referansı girin'),
  lastName: z.string().min(1, 'Soyadınızı girin'),
});

type CheckInFormData = z.infer<typeof checkInSchema>;

export const CheckInScreen: React.FC = () => {
  const navigation = useNavigation();
  const [checkInResult, setCheckInResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckInFormData>({
    resolver: zodResolver(checkInSchema),
  });

  const onSubmit = async (data: CheckInFormData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/api/check-in', {
        bookingRef: data.bookingRef,
        lastName: data.lastName,
      });
      setCheckInResult(response.data);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Check-in işlemi başarısız oldu');
      setCheckInResult(null);
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
          <Text style={styles.title}>Online Check-in</Text>
          <Text style={styles.subtitle}>
            Uçuşunuzdan 24 saat önce online check-in yapabilirsiniz
          </Text>
        </View>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Rezervasyon Bilgilerinizi Girin</Text>

          <Input
            label="Rezervasyon Referansı"
            placeholder="Örn: ABC123456"
            control={control}
            name="bookingRef"
            autoCapitalize="characters"
            error={errors.bookingRef?.message}
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
            title="Check-in Yap"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            style={styles.submitButton}
          />
        </Card>

        {checkInResult && (
          <Card style={styles.resultCard}>
            <View style={styles.successHeader}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successTitle}>Check-in Başarılı!</Text>
            </View>

            <View style={styles.checkInDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Yolcu:</Text>
                <Text style={styles.detailValue}>{checkInResult.booking?.passenger}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Uçuş:</Text>
                <Text style={styles.detailValue}>
                  {checkInResult.booking?.flight} - {checkInResult.booking?.airline}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Rota:</Text>
                <Text style={styles.detailValue}>
                  {checkInResult.booking?.origin} → {checkInResult.booking?.destination}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Kalkış:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(checkInResult.booking?.departure)} - {formatTime(checkInResult.booking?.departure)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Koltuk:</Text>
                <Text style={styles.detailValue}>{checkInResult.booking?.seat}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Kapı:</Text>
                <Text style={styles.detailValue}>{checkInResult.booking?.gate}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Boarding:</Text>
                <Text style={styles.detailValue}>{checkInResult.booking?.boardingTime}</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Boarding kartınızı yazdırmayı unutmayın
              </Text>
            </View>
          </Card>
        )}

        <Card style={styles.helpCard}>
          <Text style={styles.helpTitle}>Check-in Hakkında</Text>
          <View style={styles.helpList}>
            <Text style={styles.helpItem}>
              • Check-in işlemini uçuşunuzdan 24 saat önce yapabilirsiniz
            </Text>
            <Text style={styles.helpItem}>
              • Rezervasyon referansınızı biletinizde bulabilirsiniz
            </Text>
            <Text style={styles.helpItem}>
              • Soyadınızı biletinizdeki gibi yazın
            </Text>
            <Text style={styles.helpItem}>
              • Check-in sonrası boarding kartınızı yazdırın
            </Text>
          </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 16,
  },
  resultCard: {
    marginBottom: 24,
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
  checkInDetails: {
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
  infoBox: {
    backgroundColor: colors.info + '20',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.info,
  },
  infoText: {
    fontSize: 14,
    color: colors.info,
    textAlign: 'center',
  },
  helpCard: {
    marginTop: 16,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  helpList: {
    gap: 8,
  },
  helpItem: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

