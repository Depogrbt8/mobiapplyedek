import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Select } from '@/components/ui/Select';
import type { HotelGuest } from '../../types/hotel';
import { passengerService, type Passenger } from '@/services/passengerService';
import { colors } from '@/constants/colors';

export const createEmptyGuest = (type: 'adult' | 'child'): HotelGuest => ({
  type,
  firstName: '',
  lastName: '',
  isForeigner: false,
  ...(type === 'adult' ? { gender: 'male' as const } : {}),
});

interface GuestInfoSectionProps {
  guests: { adults: number; children: number; rooms: number };
  guestDetails: HotelGuest[];
  onChange: (details: HotelGuest[]) => void;
  errors?: Record<string, string>;
  /** Ana site mobil görünümü: beyaz kart, yuvarlak cinsiyet seçici */
  variant?: 'default' | 'payment';
}

export const GuestInfoSection: React.FC<GuestInfoSectionProps> = ({
  guests,
  guestDetails,
  onChange,
  errors = {},
  variant = 'default',
}) => {
  const isPaymentVariant = variant === 'payment';
  const [passengerOptions, setPassengerOptions] = useState<Passenger[]>([]);
  const [loadingPassengers, setLoadingPassengers] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchPassengers() {
      try {
        const data = await passengerService.getPassengers();
        if (!cancelled) setPassengerOptions(data);
      } catch {
        // Kullanıcı giriş yapmamış veya liste boş olabilir
      } finally {
        if (!cancelled) setLoadingPassengers(false);
      }
    }
    fetchPassengers();
    return () => { cancelled = true; };
  }, []);

  const totalGuests = guests.adults + guests.children;
  const guestList: HotelGuest[] =
    guestDetails.length >= totalGuests
      ? guestDetails.slice(0, totalGuests)
      : [
          ...guestDetails,
          ...Array.from(
            { length: Math.max(0, totalGuests - guestDetails.length) },
            (_, i) =>
              createEmptyGuest(
                guestDetails.length + i < guests.adults ? 'adult' : 'child'
              )
          ),
        ].slice(0, totalGuests);

  useEffect(() => {
    if (guestDetails.length !== totalGuests) {
      if (guestDetails.length < totalGuests) {
        const next = [...guestDetails];
        for (let i = guestDetails.length; i < totalGuests; i++) {
          next.push(createEmptyGuest(i < guests.adults ? 'adult' : 'child'));
        }
        onChange(next.slice(0, totalGuests));
      } else {
        onChange(guestDetails.slice(0, totalGuests));
      }
    }
  }, [guests.adults, guests.children, totalGuests]);

  const updateGuest = useCallback(
    (index: number, updates: Partial<HotelGuest>) => {
      const next = [...guestList];
      if (!next[index])
        next[index] = createEmptyGuest(
          index < guests.adults ? 'adult' : 'child'
        );
      next[index] = { ...next[index], ...updates };
      onChange(next);
    },
    [guestList, guests.adults, onChange]
  );

  const handleSelectPassenger = useCallback(
    (guestIndex: number, passengerId: string) => {
      const p = passengerOptions.find((x) => x.id === passengerId);
      if (!p) return;
      updateGuest(guestIndex, {
        firstName: p.firstName,
        lastName: p.lastName,
        identityNumber: p.identityNumber || undefined,
        isForeigner: Boolean(p.isForeigner),
        gender: p.gender,
        birthDay: p.birthDay || undefined,
        birthMonth: p.birthMonth || undefined,
        birthYear: p.birthYear || undefined,
        passengerId: p.id,
      });
    },
    [passengerOptions, updateGuest]
  );

  let guestIndex = 0;

  return (
    <View style={styles.container}>
      {/* Yetişkinler */}
      {Array.from({ length: guests.adults }).map((_, i) => {
        const idx = guestIndex++;
        const guest = guestList[idx] || createEmptyGuest('adult');

        return (
          <View key={`adult-${i}`} style={[styles.guestCard, isPaymentVariant && styles.guestCardWhite]}>
            <View style={styles.guestCardHeader}>
              <Text style={styles.guestCardTitle}>{i + 1}. Yetişkin</Text>
              {loadingPassengers ? (
                <ActivityIndicator size="small" color={colors.primary[600]} />
              ) : passengerOptions.length > 0 ? (
                <Select
                  value={guest.passengerId || ''}
                  options={[
                    { label: 'Listemden Seç', value: '' },
                    ...passengerOptions.map((p) => ({
                      label: `${p.firstName} ${p.lastName}`,
                      value: p.id,
                    })),
                  ]}
                  onSelect={(value) => {
                    if (value) handleSelectPassenger(idx, String(value));
                  }}
                  placeholder="Listemden Seç"
                  displayValue={
                    guest.passengerId
                      ? passengerOptions.find((p) => p.id === guest.passengerId)
                          ? `${guest.firstName} ${guest.lastName}`
                          : 'Listemden Seç'
                      : 'Listemden Seç'
                  }
                  selectContainerStyle={[styles.listemdenSelect, isPaymentVariant && styles.listemdenSelectPayment]}
                />
              ) : null}
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Ad</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors[`guest_${idx}_firstName`] && styles.inputError,
                  ]}
                  placeholder="Ad"
                  placeholderTextColor={colors.text.secondary}
                  value={guest.firstName}
                  onChangeText={(v) => updateGuest(idx, { firstName: v })}
                />
                {errors[`guest_${idx}_firstName`] ? (
                  <Text style={styles.errorText}>
                    {errors[`guest_${idx}_firstName`]}
                  </Text>
                ) : null}
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Soyad</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors[`guest_${idx}_lastName`] && styles.inputError,
                  ]}
                  placeholder="Soyad"
                  placeholderTextColor={colors.text.secondary}
                  value={guest.lastName}
                  onChangeText={(v) => updateGuest(idx, { lastName: v })}
                />
                {errors[`guest_${idx}_lastName`] ? (
                  <Text style={styles.errorText}>
                    {errors[`guest_${idx}_lastName`]}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() =>
                  updateGuest(idx, { isForeigner: !guest.isForeigner })
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    guest.isForeigner && styles.checkboxChecked,
                  ]}
                >
                  {guest.isForeigner && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>T.C. vatandaşı değil</Text>
              </TouchableOpacity>
              <View style={styles.genderRow}>
                <Text style={styles.genderLabel}>Cinsiyet</Text>
                {isPaymentVariant ? (
                  <>
                    <TouchableOpacity
                      style={styles.radioRow}
                      onPress={() => updateGuest(idx, { gender: 'male' })}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.radioOuter, guest.gender === 'male' && styles.radioOuterActive]}>
                        {guest.gender === 'male' && <View style={styles.radioInner} />}
                      </View>
                      <Text style={styles.radioLabel}>Erkek</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.radioRow}
                      onPress={() => updateGuest(idx, { gender: 'female' })}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.radioOuter, guest.gender === 'female' && styles.radioOuterActive]}>
                        {guest.gender === 'female' && <View style={styles.radioInner} />}
                      </View>
                      <Text style={styles.radioLabel}>Kadın</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        guest.gender === 'male' && styles.genderButtonActive,
                      ]}
                      onPress={() => updateGuest(idx, { gender: 'male' })}
                    >
                      <Text
                        style={[
                          styles.genderButtonText,
                          guest.gender === 'male' && styles.genderButtonTextActive,
                        ]}
                      >
                        Erkek
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        guest.gender === 'female' && styles.genderButtonActive,
                      ]}
                      onPress={() => updateGuest(idx, { gender: 'female' })}
                    >
                      <Text
                        style={[
                          styles.genderButtonText,
                          guest.gender === 'female' &&
                            styles.genderButtonTextActive,
                        ]}
                      >
                        Kadın
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        );
      })}

      {/* Çocuklar */}
      {Array.from({ length: guests.children }).map((_, i) => {
        const idx = guestIndex++;
        const guest = guestList[idx] || createEmptyGuest('child');

        return (
          <View key={`child-${i}`} style={[styles.guestCard, isPaymentVariant && styles.guestCardWhite]}>
            <View style={styles.guestCardHeader}>
              <Text style={styles.guestCardTitle}>{i + 1}. Çocuk</Text>
              {loadingPassengers ? (
                <ActivityIndicator size="small" color={colors.primary[600]} />
              ) : passengerOptions.length > 0 ? (
                <Select
                  value={guest.passengerId || ''}
                  options={[
                    { label: 'Listemden Seç', value: '' },
                    ...passengerOptions.map((p) => ({
                      label: `${p.firstName} ${p.lastName}`,
                      value: p.id,
                    })),
                  ]}
                  onSelect={(value) => {
                    if (value) handleSelectPassenger(idx, String(value));
                  }}
                  placeholder="Listemden Seç"
                  displayValue={
                    guest.passengerId
                      ? passengerOptions.find((p) => p.id === guest.passengerId)
                          ? `${guest.firstName} ${guest.lastName}`
                          : 'Listemden Seç'
                      : 'Listemden Seç'
                  }
                  selectContainerStyle={[styles.listemdenSelect, isPaymentVariant && styles.listemdenSelectPayment]}
                />
              ) : null}
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Ad</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors[`guest_${idx}_firstName`] && styles.inputError,
                  ]}
                  placeholder="Ad"
                  placeholderTextColor={colors.text.secondary}
                  value={guest.firstName}
                  onChangeText={(v) => updateGuest(idx, { firstName: v })}
                />
                {errors[`guest_${idx}_firstName`] ? (
                  <Text style={styles.errorText}>
                    {errors[`guest_${idx}_firstName`]}
                  </Text>
                ) : null}
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Soyad</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors[`guest_${idx}_lastName`] && styles.inputError,
                  ]}
                  placeholder="Soyad"
                  placeholderTextColor={colors.text.secondary}
                  value={guest.lastName}
                  onChangeText={(v) => updateGuest(idx, { lastName: v })}
                />
                {errors[`guest_${idx}_lastName`] ? (
                  <Text style={styles.errorText}>
                    {errors[`guest_${idx}_lastName`]}
                  </Text>
                ) : null}
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() =>
                updateGuest(idx, { isForeigner: !guest.isForeigner })
              }
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  guest.isForeigner && styles.checkboxChecked,
                ]}
              >
                {guest.isForeigner && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>T.C. vatandaşı değil</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  guestCard: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: 16,
    backgroundColor: colors.gray[50],
  },
  guestCardWhite: {
    backgroundColor: '#fff',
    borderColor: colors.gray[200],
  },
  guestCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  guestCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  listemdenSelect: {
    minWidth: 140,
  },
  listemdenSelectPayment: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: colors.error || '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: colors.error || '#ef4444',
    marginTop: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text.primary,
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginRight: 4,
  },
  genderButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  genderButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  genderButtonText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  genderButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[600],
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  radioLabel: {
    fontSize: 14,
    color: colors.text.primary,
  },
});
