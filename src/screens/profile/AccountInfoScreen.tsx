import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { BirthDatePicker } from '@/components/ui/BirthDatePicker';
import { useAuthStore } from '@/store/authStore';
import { userService, type UpdateUserProfileData } from '@/services/userService';
import { ChangePasswordModal } from '@/components/modals/ChangePasswordModal';
import { DeleteAccountModal } from '@/components/modals/DeleteAccountModal';
import { colors } from '@/constants/colors';
import { countries } from '@/constants/countries';

export const AccountInfoScreen: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [userData, setUserData] = useState<UpdateUserProfileData>({
    firstName: '',
    lastName: '',
    phone: '',
    countryCode: '+90',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    gender: '',
    identityNumber: '',
    isForeigner: false,
  });

  // Profil verisini yükle
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const profile = await userService.getUserProfile();
      setUserData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        countryCode: profile.countryCode || '+90',
        birthDay: profile.birthDay || '',
        birthMonth: profile.birthMonth || '',
        birthYear: profile.birthYear || '',
        gender: profile.gender || '',
        identityNumber: profile.identityNumber || '',
        isForeigner: profile.isForeigner || false,
      });
      setUser(profile);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Profil bilgileri yüklenemedi');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleChange = (field: keyof UpdateUserProfileData, value: any) => {
    setUserData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!userData.firstName || !userData.lastName) {
      Alert.alert('Hata', 'Ad ve soyad gereklidir');
      return;
    }

    setIsLoading(true);
    try {
      const payload: UpdateUserProfileData = {};
      if (userData && typeof userData === 'object') {
        Object.entries(userData).forEach(([key, value]) => {
          if (value === '' || value === null || value === undefined) return;
          payload[key as keyof UpdateUserProfileData] = value;
        });
      }

      console.log('📤 Backend\'e gönderilen veri:', payload);
      console.log('📅 Tarih bilgileri:', {
        birthDay: payload.birthDay,
        birthMonth: payload.birthMonth,
        birthYear: payload.birthYear,
      });

      const updatedProfile = await userService.updateUserProfile(payload);
      setUser(updatedProfile);
      console.log('✅ Profil başarıyla güncellendi:', updatedProfile);
      Alert.alert('Başarılı', 'Bilgileriniz başarıyla güncellendi.');
    } catch (error: any) {
      console.error('❌ Profil güncelleme hatası:', error);
      Alert.alert('Hata', error.message || 'Güncelleme sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Ülke kodları - Bayrak ve ülke ismi ile göster, duplicate'leri filtrele
  const uniquePhoneCodes = new Map<string, { phoneCode: string; flag: string; name: string }>();
  if (Array.isArray(countries) && countries.length > 0) {
    countries.forEach(country => {
      if (country && country.phoneCode && !uniquePhoneCodes.has(country.phoneCode)) {
        uniquePhoneCodes.set(country.phoneCode, {
          phoneCode: country.phoneCode,
          flag: country.flag || '',
          name: country.name || '',
        });
      }
    });
  }
  const countryCodeOptions = Array.from(uniquePhoneCodes.values()).map((country) => ({
    label: `${country.flag} ${country.name} (${country.phoneCode})`,
    value: country.phoneCode,
  }));

  // Seçili ülkenin bayrağını ve kodunu bul (kapalıyken bayrak + kod gösterilecek)
  const selectedCountry = Array.isArray(countries) ? countries.find(country => country && country.phoneCode === userData.countryCode) : null;
  const countryCodeDisplayValue = selectedCountry ? `${selectedCountry.flag} ${selectedCountry.phoneCode}` : undefined;

  if (isLoadingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.profileCard}>
        {/* Ad ve Soyad - Yan yana */}
        <View style={styles.nameRow}>
          <View style={styles.nameCol}>
            <Input
              label="Ad"
              value={userData.firstName}
              onChangeText={(text) => handleChange('firstName', text)}
              placeholder="Ad"
            />
          </View>
          <View style={styles.nameCol}>
            <Input
              label="Soyad"
              value={userData.lastName}
              onChangeText={(text) => handleChange('lastName', text)}
              placeholder="Soyad"
            />
          </View>
        </View>

        {/* E-Posta */}
        <Input
          label="E-Posta"
          value={user?.email || ''}
          editable={false}
          placeholder="E-Posta"
        />

        {/* Telefon */}
        <Text style={styles.label}>Cep Telefonu Numaranız</Text>
        <View style={styles.phoneContainer}>
          <View style={styles.countryCodeContainer}>
            <Select
              value={userData.countryCode}
              options={countryCodeOptions}
              onSelect={(value) => handleChange('countryCode', String(value))}
              placeholder="Ülke"
              displayValue={countryCodeDisplayValue}
            />
          </View>
          <View style={styles.phoneInputContainer}>
            <Input
              value={userData.phone}
              onChangeText={(text) => handleChange('phone', text)}
              placeholder="Telefon"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Doğum Tarihi */}
        <BirthDatePicker
          label="Doğum Tarihi"
          day={userData.birthDay}
          month={userData.birthMonth}
          year={userData.birthYear}
          onSelect={(day, month, year) => {
            console.log('📅 Tarih seçildi:', { day, month, year });
            handleChange('birthDay', day);
            handleChange('birthMonth', month);
            handleChange('birthYear', year);
          }}
          placeholder="Doğum Tarihi"
        />

        {/* Cinsiyet */}
        <Text style={styles.label}>Cinsiyet</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderOption,
              userData.gender === 'male' && styles.genderOptionSelected,
            ]}
            onPress={() => handleChange('gender', 'male')}
          >
            <Text
              style={[
                styles.genderText,
                userData.gender === 'male' && styles.genderTextSelected,
              ]}
            >
              Erkek
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderOption,
              userData.gender === 'female' && styles.genderOptionSelected,
            ]}
            onPress={() => handleChange('gender', 'female')}
          >
            <Text
              style={[
                styles.genderText,
                userData.gender === 'female' && styles.genderTextSelected,
              ]}
            >
              Kadın
            </Text>
          </TouchableOpacity>
        </View>

        {/* TC Kimlik No */}
        <View style={styles.tcContainer}>
          <Text style={styles.tcLabel}>TC kimlik no</Text>
          <View style={styles.tcInputContainer}>
            <TextInput
              style={styles.tcInput}
              value={userData.identityNumber}
              onChangeText={(text) => handleChange('identityNumber', text)}
              placeholder="TC Kimlik No"
              placeholderTextColor={colors.text.disabled}
              maxLength={11}
              editable={!userData.isForeigner}
              keyboardType="numeric"
            />
            <View style={styles.tcCheckboxWrapper}>
              <TouchableOpacity
                style={[
                  styles.tcCheckbox,
                  userData.isForeigner && styles.tcCheckboxChecked,
                ]}
                onPress={() => handleChange('isForeigner', !userData.isForeigner)}
              >
                {userData.isForeigner && (
                  <Text style={styles.tcCheckmark}>✓</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.tcCheckboxLabel}>TC vatandaşı değil</Text>
            </View>
          </View>
        </View>

        {/* Butonlar - Ana sitedeki gibi */}
        <View style={styles.buttonRow}>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Alert.alert('Bilgi', 'Pasaport ekleme özelliği yakında eklenecek');
              }}
            >
              <Text style={styles.actionButtonText}>Pasaport Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsChangePasswordModalOpen(true)}
            >
              <Text style={styles.actionButtonText}>Şifre Değiştir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteActionButton]}
              onPress={() => setIsDeleteAccountModalOpen(true)}
            >
              <Text style={[styles.actionButtonText, styles.deleteActionButtonText]}>Hesabı Sil</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
      />
    </ScrollView>
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
  profileCard: {
    marginBottom: 24,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },
  nameCol: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  birthDateContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  birthDateItem: {
    flex: 1,
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  countryCodeContainer: {
    width: 140,
  },
  phoneInputContainer: {
    flex: 1,
  },
  tcContainer: {
    marginBottom: 16,
  },
  tcLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  tcInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.background,
    minHeight: 44,
    paddingHorizontal: 16,
  },
  tcInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: 12,
  },
  tcCheckboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 8,
  },
  tcCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  tcCheckboxChecked: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  tcCheckmark: {
    fontSize: 12,
    color: colors.primary[600],
    fontWeight: 'bold',
  },
  tcCheckboxLabel: {
    fontSize: 14,
    color: colors.text.primary,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  genderOption: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.background,
  },
  genderOptionSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  genderText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  genderTextSelected: {
    color: colors.background,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 8,
    paddingTop: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.background,
  },
  actionButtonText: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '500',
  },
  deleteActionButton: {
    borderColor: colors.error,
  },
  deleteActionButtonText: {
    color: colors.error,
  },
  saveButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: colors.primary[600],
    alignSelf: 'center',
    minWidth: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.75,
  },
  saveButtonText: {
    fontSize: 12,
    color: colors.background,
    fontWeight: '600',
  },
});

