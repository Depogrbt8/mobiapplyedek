import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { GuestInfo } from '../../types/hotel';
import { colors } from '@/constants/colors';

const COUNTRIES = [
  { value: 'TR', label: 'Türkiye' },
  { value: 'DE', label: 'Almanya' },
  { value: 'NL', label: 'Hollanda' },
  { value: 'BE', label: 'Belçika' },
  { value: 'AT', label: 'Avusturya' },
  { value: 'FR', label: 'Fransa' },
  { value: 'GB', label: 'İngiltere' },
  { value: 'CH', label: 'İsviçre' },
  { value: 'OTHER', label: 'Diğer' },
];

interface HotelGuestFormProps {
  guestInfo: GuestInfo;
  onChange: (info: GuestInfo) => void;
  errors?: Record<string, string>;
}

export const HotelGuestForm: React.FC<HotelGuestFormProps> = ({
  guestInfo,
  onChange,
  errors = {}
}) => {
  const handleChange = (field: keyof GuestInfo, value: string | boolean | number) => {
    onChange({
      ...guestInfo,
      [field]: typeof value === 'number' ? String(value) : value
    } as GuestInfo);
  };

  return (
    <View style={styles.container}>
      {/* Ad Soyad */}
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Ad</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={colors.gray[400]} style={styles.inputIcon} />
            <TextInput
              style={[
                styles.input,
                errors.firstName && styles.inputError
              ]}
              placeholder="Adınız"
              placeholderTextColor={colors.text.secondary}
              value={guestInfo.firstName || ''}
              onChangeText={(value: string) => handleChange('firstName', value)}
            />
          </View>
          {errors.firstName && (
            <Text style={styles.errorText}>{errors.firstName}</Text>
          )}
        </View>

        <View style={styles.halfWidth}>
          <Text style={styles.label}>Soyad</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={colors.gray[400]} style={styles.inputIcon} />
            <TextInput
              style={[
                styles.input,
                errors.lastName && styles.inputError
              ]}
              placeholder="Soyadınız"
              placeholderTextColor={colors.text.secondary}
              value={guestInfo.lastName || ''}
              onChangeText={(value: string) => handleChange('lastName', value)}
            />
          </View>
          {errors.lastName && (
            <Text style={styles.errorText}>{errors.lastName}</Text>
          )}
        </View>
      </View>

      {/* Ülke (opsiyonel) */}
      <View style={styles.countryContainer}>
        <Text style={styles.label}>
          Ülke <Text style={styles.optionalText}>(opsiyonel)</Text>
        </Text>
        <Select
          value={guestInfo.country || ''}
          options={[
            { label: 'Seçiniz', value: '' },
            ...COUNTRIES.map(country => ({
              label: country.label,
              value: country.value,
            }))
          ]}
          onSelect={(value) => handleChange('country', value)}
          placeholder="Seçiniz"
          displayValue={COUNTRIES.find(c => c.value === guestInfo.country)?.label || 'Seçiniz'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  optionalText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.gray[400],
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  input: {
    width: '100%',
    paddingLeft: 40,
    paddingRight: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.error || '#ef4444',
  },
  countryContainer: {
    marginTop: 0,
  },
  errorText: {
    fontSize: 12,
    color: colors.error || '#ef4444',
    marginTop: 4,
    marginLeft: 4,
  },
});

