import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { billingInfoService, type BillingInfo } from '@/services/billingInfoService';
import { countries } from '@/constants/countries';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

const billingInfoSchema = z.object({
  type: z.enum(['individual', 'corporate']),
  title: z.string().min(2, 'Adres başlığı en az 2 karakter olmalı'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  taxNumber: z.string().optional(),
  address: z.string().min(5, 'Adres en az 5 karakter olmalı'),
  city: z.string().min(2, 'İl girin'),
  country: z.string().min(2, 'Ülke seçin'),
  isDefault: z.boolean().default(false),
}).refine(
  (data) => {
    if (data.type === 'individual') {
      return data.firstName && data.lastName;
    } else {
      return data.companyName && data.taxNumber;
    }
  },
  {
    message: 'Bireysel için ad-soyad, kurumsal için şirket adı ve vergi numarası gereklidir',
    path: ['type'],
  }
);

type BillingInfoFormData = z.infer<typeof billingInfoSchema>;

export const BillingInfoScreen: React.FC = () => {
  const navigation = useNavigation();
  const [billingInfos, setBillingInfos] = useState<BillingInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<BillingInfoFormData>({
    resolver: zodResolver(billingInfoSchema),
    defaultValues: {
      type: 'individual',
      title: '',
      firstName: '',
      lastName: '',
      companyName: '',
      taxNumber: '',
      address: '',
      city: '',
      country: 'Türkiye',
      isDefault: false,
    },
  });

  const billingType = watch('type');

  useEffect(() => {
    loadBillingInfos();
  }, []);

  const loadBillingInfos = async () => {
    try {
      setIsLoadingList(true);
      const data = await billingInfoService.getBillingInfos();
      setBillingInfos(data);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Fatura bilgileri yüklenemedi');
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    reset({
      type: 'individual',
      title: '',
      firstName: '',
      lastName: '',
      companyName: '',
      taxNumber: '',
      address: '',
      city: '',
      country: 'Türkiye',
      isDefault: false,
    });
  };

  const handleEdit = (billingInfo: BillingInfo) => {
    setEditingId(billingInfo.id || null);
    setIsAdding(false);
    reset({
      type: billingInfo.type,
      title: billingInfo.title,
      firstName: billingInfo.firstName || '',
      lastName: billingInfo.lastName || '',
      companyName: billingInfo.companyName || '',
      taxNumber: billingInfo.taxNumber || '',
      address: billingInfo.address,
      city: billingInfo.city,
      country: billingInfo.country,
      isDefault: billingInfo.isDefault,
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    reset({
      type: 'individual',
      title: '',
      firstName: '',
      lastName: '',
      companyName: '',
      taxNumber: '',
      address: '',
      city: '',
      country: 'Türkiye',
      isDefault: false,
    });
  };

  const onSubmit = async (data: BillingInfoFormData) => {
    setIsLoading(true);
    try {
      const billingData: Omit<BillingInfo, 'id' | 'createdAt' | 'updatedAt'> = {
        type: data.type,
        title: data.title,
        address: data.address,
        city: data.city,
        country: data.country,
        isDefault: data.isDefault,
        ...(data.type === 'individual'
          ? {
              firstName: data.firstName,
              lastName: data.lastName,
            }
          : {
              companyName: data.companyName,
              taxNumber: data.taxNumber,
            }),
      };

      if (editingId) {
        await billingInfoService.updateBillingInfo({ ...billingData, id: editingId });
        Alert.alert('Başarılı', 'Fatura bilgisi güncellendi', [
          { text: 'Tamam', onPress: () => {
            handleCancel();
            loadBillingInfos();
          }},
        ]);
      } else {
        await billingInfoService.createBillingInfo(billingData);
        Alert.alert('Başarılı', 'Fatura bilgisi eklendi', [
          { text: 'Tamam', onPress: () => {
            handleCancel();
            loadBillingInfos();
          }},
        ]);
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Fatura bilgisi kaydedilemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Fatura Bilgisi Sil',
      'Bu fatura bilgisini silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await billingInfoService.deleteBillingInfo(id);
              Alert.alert('Başarılı', 'Fatura bilgisi silindi', [
                { text: 'Tamam', onPress: () => loadBillingInfos() },
              ]);
            } catch (error: any) {
              Alert.alert('Hata', error.message || 'Fatura bilgisi silinemedi');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (id: string) => {
    const billingInfo = billingInfos.find((b) => b.id === id);
    if (!billingInfo) return;

    try {
      const updatedData: BillingInfo = {
        ...billingInfo,
        isDefault: true,
      };
      await billingInfoService.updateBillingInfo(updatedData);
      await loadBillingInfos();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Varsayılan adres ayarlanamadı');
    }
  };

  if (isLoadingList) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Fatura Bilgilerim</Text>
          <Button
            title="Yeni Adres Ekle"
            onPress={handleAdd}
            style={styles.addButton}
          />
        </View>

        {/* Existing Billing Infos */}
        {billingInfos.map((billingInfo) => (
          <Card key={billingInfo.id} style={styles.billingCard}>
            {editingId === billingInfo.id ? (
              <BillingInfoForm
                control={control}
                errors={errors}
                billingType={billingType}
                onSubmit={handleSubmit(onSubmit)}
                onCancel={handleCancel}
                isLoading={isLoading}
                setValue={setValue}
              />
            ) : (
              <View>
                <View style={styles.billingHeader}>
                  <View style={styles.billingTitleRow}>
                    {billingInfo.type === 'individual' ? (
                      <Ionicons name="home" size={24} color={colors.primary[600]} />
                    ) : (
                      <Ionicons name="business" size={24} color={colors.primary[600]} />
                    )}
                    <View style={styles.billingTitleContainer}>
                      <Text style={styles.billingTitle}>{billingInfo.title}</Text>
                      {billingInfo.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Varsayılan</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.billingActions}>
                    {!billingInfo.isDefault && (
                      <TouchableOpacity
                        onPress={() => handleSetDefault(billingInfo.id!)}
                        style={styles.actionButton}
                      >
                        <Ionicons name="checkmark-circle" size={24} color={colors.primary[600]} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => handleEdit(billingInfo)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="pencil" size={24} color={colors.primary[600]} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(billingInfo.id!)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="trash" size={24} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.billingDetails}>
                  {billingInfo.type === 'individual' ? (
                    <Text style={styles.billingName}>
                      {billingInfo.firstName} {billingInfo.lastName}
                    </Text>
                  ) : (
                    <>
                      <Text style={styles.billingName}>{billingInfo.companyName}</Text>
                      <Text style={styles.billingTaxNumber}>Vergi No: {billingInfo.taxNumber}</Text>
                    </>
                  )}
                  <Text style={styles.billingAddress}>{billingInfo.address}</Text>
                  <Text style={styles.billingLocation}>
                    {billingInfo.city} / {billingInfo.country}
                  </Text>
                </View>
              </View>
            )}
          </Card>
        ))}

        {/* Add New Form */}
        {isAdding && (
          <Card style={styles.billingCard}>
            <BillingInfoForm
              control={control}
              errors={errors}
              billingType={billingType}
              onSubmit={handleSubmit(onSubmit)}
              onCancel={handleCancel}
              isLoading={isLoading}
              setValue={setValue}
            />
          </Card>
        )}

        {billingInfos.length === 0 && !isAdding && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Henüz fatura bilgisi eklenmemiş</Text>
            <Button
              title="İlk Adresi Ekle"
              onPress={handleAdd}
              style={styles.emptyButton}
            />
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Separate form component for reusability
interface BillingInfoFormProps {
  control: any;
  errors: any;
  billingType: 'individual' | 'corporate';
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  setValue: (name: keyof BillingInfoFormData, value: any) => void;
}

const BillingInfoForm: React.FC<BillingInfoFormProps> = ({
  control,
  errors,
  billingType,
  onSubmit,
  onCancel,
  isLoading,
  setValue,
}) => {
  return (
    <View>
      {/* Type Selection */}
      <View style={styles.typeSelection}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            billingType === 'individual' && styles.typeButtonActive,
          ]}
          onPress={() => setValue('type', 'individual')}
        >
          <Text
            style={[
              styles.typeButtonText,
              billingType === 'individual' && styles.typeButtonTextActive,
            ]}
          >
            Bireysel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            billingType === 'corporate' && styles.typeButtonActive,
          ]}
          onPress={() => setValue('type', 'corporate')}
        >
          <Text
            style={[
              styles.typeButtonText,
              billingType === 'corporate' && styles.typeButtonTextActive,
            ]}
          >
            Kurumsal
          </Text>
        </TouchableOpacity>
      </View>

      <Input
        control={control}
        name="title"
        label="Adres Başlığı"
        placeholder="Örn: Ev, İş, Şube"
        error={errors.title?.message}
      />

      {billingType === 'individual' ? (
        <>
          <Input
            control={control}
            name="firstName"
            label="Ad"
            placeholder="Ad"
            error={errors.firstName?.message}
          />
          <Input
            control={control}
            name="lastName"
            label="Soyad"
            placeholder="Soyad"
            error={errors.lastName?.message}
          />
        </>
      ) : (
        <>
          <Input
            control={control}
            name="companyName"
            label="Şirket Adı"
            placeholder="Şirket Adı"
            error={errors.companyName?.message}
          />
          <Input
            control={control}
            name="taxNumber"
            label="Vergi Numarası"
            placeholder="Vergi Numarası"
            keyboardType="numeric"
            error={errors.taxNumber?.message}
          />
        </>
      )}

      <Input
        control={control}
        name="address"
        label="Tam Adres"
        placeholder="Tam Adres"
        multiline
        numberOfLines={3}
        error={errors.address?.message}
      />

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Input
            control={control}
            name="city"
            label="İl"
            placeholder="İl"
            error={errors.city?.message}
          />
        </View>
        <View style={styles.halfWidth}>
          {/* Country selection would need a picker component */}
          <Input
            control={control}
            name="country"
            label="Ülke"
            placeholder="Ülke"
            error={errors.country?.message}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title={isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          onPress={onSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.saveButton}
        />
        <Button
          title="Vazgeç"
          onPress={onCancel}
          variant="outline"
          style={styles.cancelButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  addButton: {
    minWidth: 140,
  },
  billingCard: {
    marginBottom: 16,
    padding: 16,
  },
  billingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  billingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  billingTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  billingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  defaultBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  defaultBadgeText: {
    fontSize: 12,
    color: colors.primary[700],
    fontWeight: '600',
  },
  billingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  billingDetails: {
    marginTop: 8,
  },
  billingName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  billingTaxNumber: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  billingAddress: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
  },
  billingLocation: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    minWidth: 200,
  },
  typeSelection: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  typeButtonTextActive: {
    color: colors.background,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
});

