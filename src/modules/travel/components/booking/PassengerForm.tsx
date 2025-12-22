import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { colors } from '@/constants/colors';
import type { FlightBrand } from '@/types/flight';

export interface PassengerDetail {
  id: string | null;
  firstName: string;
  lastName: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  gender: string;
  identityNumber: string;
  isForeigner: boolean;
  shouldSave: boolean;
  type: 'Yetişkin' | 'Çocuk';
}

interface PassengerFormProps {
  passengerNumber: number;
  passengerType: 'Yetişkin' | 'Çocuk';
  savedPassengers: any[];
  onSelectPassenger: (passenger: any | null) => void;
  onFormChange: (field: string, value: any) => void;
  passengerData: PassengerDetail;
  onSaveToggle: (checked: boolean) => void;
  shouldSave: boolean;
  flight: any;
}

const DAYS = Array.from({ length: 31 }, (_, i) => ({
  label: String(i + 1),
  value: String(i + 1),
}));

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  label: String(i + 1),
  value: String(i + 1),
}));

const YEARS = Array.from({ length: 100 }, (_, i) => {
  const year = new Date().getFullYear() - 18 - i;
  return { label: String(year), value: String(year) };
});

export const PassengerForm: React.FC<PassengerFormProps> = ({
  passengerNumber,
  passengerType,
  savedPassengers,
  onSelectPassenger,
  onFormChange,
  passengerData,
  onSaveToggle,
  shouldSave,
  flight,
}) => {
  const [activePassengerId, setActivePassengerId] = useState<string | null>(passengerData?.id || null);

  const handleSelect = (passenger: any) => {
    onSelectPassenger(passenger);
    setActivePassengerId(passenger?.id || null);
  };

  const handleNew = () => {
    onSelectPassenger(null);
    setActivePassengerId(null);
  };

  const handleChange = (field: string, value: any) => {
    onFormChange(field, value);
  };

  return (
    <Card style={styles.card} padding="medium">
      <Text style={styles.title}>{`${passengerNumber}. ${passengerType}`}</Text>

      {/* Saved Passengers Selection */}
      {savedPassengers && savedPassengers.length > 0 && (
        <View style={styles.savedPassengersContainer}>
          <Text style={styles.savedPassengersTitle}>YOLCU LİSTEMDEN SEÇ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.passengerButtons}>
            <TouchableOpacity
              style={[styles.passengerButton, !activePassengerId && styles.passengerButtonActive]}
              onPress={handleNew}
            >
              <Text style={[styles.passengerButtonText, !activePassengerId && styles.passengerButtonTextActive]}>
                Yeni Kişi
              </Text>
            </TouchableOpacity>
            {savedPassengers.map((p: any) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.passengerButton, activePassengerId === p.id && styles.passengerButtonActive]}
                onPress={() => handleSelect(p)}
              >
                <Text style={[styles.passengerButtonText, activePassengerId === p.id && styles.passengerButtonTextActive]}>
                  {p.firstName} {p.lastName.charAt(0)}.
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Gender Selection */}
      <View style={styles.genderContainer}>
        <Text style={styles.label}>Cinsiyet:</Text>
        <View style={styles.genderButtons}>
          <TouchableOpacity
            style={[styles.genderButton, passengerData?.gender === 'male' && styles.genderButtonActive]}
            onPress={() => handleChange('gender', 'male')}
          >
            <Text style={[styles.genderButtonText, passengerData?.gender === 'male' && styles.genderButtonTextActive]}>
              Erkek
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderButton, passengerData?.gender === 'female' && styles.genderButtonActive]}
            onPress={() => handleChange('gender', 'female')}
          >
            <Text style={[styles.genderButtonText, passengerData?.gender === 'female' && styles.genderButtonTextActive]}>
              Kadın
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Name Fields */}
      <View style={styles.nameRow}>
        <View style={styles.nameInput}>
          <Text style={styles.label}>Adı*</Text>
          <TextInput
            style={styles.input}
            value={passengerData?.firstName || ''}
            onChangeText={(value) => handleChange('firstName', value)}
            placeholder=""
            placeholderTextColor={colors.text.disabled}
          />
        </View>
        <View style={styles.nameInput}>
          <Text style={styles.label}>Soyadı*</Text>
          <TextInput
            style={styles.input}
            value={passengerData?.lastName || ''}
            onChangeText={(value) => handleChange('lastName', value)}
            placeholder=""
            placeholderTextColor={colors.text.disabled}
          />
        </View>
      </View>

      {/* Birth Date */}
      <View style={styles.birthDateContainer}>
        <Text style={styles.label}>Doğum Tarihi*</Text>
        <View style={styles.dateRow}>
          <View style={styles.dateInput}>
            <Select
              value={passengerData?.birthDay || ''}
              options={DAYS}
              onSelect={(value) => handleChange('birthDay', value)}
              placeholder="Gün"
            />
          </View>
          <View style={styles.dateInput}>
            <Select
              value={passengerData?.birthMonth || ''}
              options={MONTHS}
              onSelect={(value) => handleChange('birthMonth', value)}
              placeholder="Ay"
            />
          </View>
          <View style={styles.dateInput}>
            <Select
              value={passengerData?.birthYear || ''}
              options={YEARS}
              onSelect={(value) => handleChange('birthYear', value)}
              placeholder="Yıl"
            />
          </View>
        </View>
      </View>

      {/* Identity Number */}
      <View style={styles.identityContainer}>
        <Text style={styles.label}>TC Kimlik No</Text>
        <View style={styles.identityRow}>
          <TextInput
            style={[styles.input, styles.identityInput, passengerData?.isForeigner && styles.inputDisabled]}
            value={passengerData?.identityNumber || ''}
            onChangeText={(value) => handleChange('identityNumber', value)}
            placeholder=""
            placeholderTextColor={colors.text.disabled}
            keyboardType="number-pad"
            maxLength={11}
            editable={!passengerData?.isForeigner}
          />
          <View style={styles.foreignerCheckboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => {
                const newValue = !passengerData?.isForeigner;
                handleChange('isForeigner', newValue);
                if (newValue) {
                  handleChange('identityNumber', '');
                }
              }}
            >
              {passengerData?.isForeigner && (
                <Ionicons name="checkmark" size={16} color={colors.primary[600]} />
              )}
            </TouchableOpacity>
            <Text style={styles.foreignerLabel}>T.C. Vatandaşı Değil</Text>
          </View>
        </View>
      </View>

      {/* Save Passenger Checkbox */}
      {(!activePassengerId || (activePassengerId && passengerData)) && (
        <View style={styles.saveContainer}>
          <TouchableOpacity
            style={styles.saveCheckbox}
            onPress={() => onSaveToggle(!shouldSave)}
          >
            {shouldSave && (
              <Ionicons name="checkmark" size={16} color={colors.primary[600]} />
            )}
          </TouchableOpacity>
          <Text style={styles.saveLabel}>
            {!activePassengerId ? 'Yolcu Listeme Ekle' : 'Yolcu Listemde Güncelle'}
          </Text>
        </View>
      )}

      {/* Selected Brand Info */}
      {flight?.selectedBrand && (
        <View style={styles.brandInfoContainer}>
          <Text style={styles.brandTitle}>Seçilen Paket: {flight.selectedBrand.name}</Text>
          <Text style={styles.brandText}>
            Bagaj Hakkı: {flight.selectedBrand.baggage || flight.baggage || 'Belirtilmemiş'}
          </Text>
          {flight.selectedBrand.rules && (
            <Text style={styles.brandText}>Kurallar: {flight.selectedBrand.rules}</Text>
          )}
          {flight.selectedBrand.description && (
            <Text style={styles.brandDescription}>{flight.selectedBrand.description}</Text>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  savedPassengersContainer: {
    backgroundColor: colors.primary[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  savedPassengersTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary[800],
    marginBottom: 8,
  },
  passengerButtons: {
    flexDirection: 'row',
  },
  passengerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary[600],
    marginRight: 8,
  },
  passengerButtonActive: {
    backgroundColor: colors.primary[600],
  },
  passengerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
  },
  passengerButtonTextActive: {
    color: colors.text.inverse,
  },
  genderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  genderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.background,
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
    color: colors.text.inverse,
    fontWeight: '600',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  nameInput: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.gray[50],
  },
  inputDisabled: {
    backgroundColor: colors.gray[100],
    opacity: 0.6,
  },
  birthDateContainer: {
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateInput: {
    flex: 1,
  },
  identityContainer: {
    marginBottom: 12,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  identityInput: {
    flex: 1,
  },
  foreignerCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  foreignerLabel: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  saveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    marginTop: 16,
  },
  saveCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  brandInfoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.primary[50],
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[600],
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary[800],
    marginBottom: 4,
  },
  brandText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  brandDescription: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 4,
  },
});

