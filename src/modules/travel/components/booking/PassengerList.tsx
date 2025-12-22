import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { PassengerForm, type PassengerDetail } from './PassengerForm';
import { colors } from '@/constants/colors';

interface PassengerListProps {
  passengers: { adults: number; children: number; infants: number };
  passengerDetails: PassengerDetail[];
  savedPassengers: any[];
  flight: any;
  onSelectSavedPassenger: (passengerIndex: number, passengerData: any | null) => void;
  onPassengerFormChange: (passengerIndex: number, field: string, value: any) => void;
  onSaveToggle: (passengerIndex: number, checked: boolean) => void;
}

export const PassengerList: React.FC<PassengerListProps> = ({
  passengers,
  passengerDetails,
  savedPassengers,
  flight,
  onSelectSavedPassenger,
  onPassengerFormChange,
  onSaveToggle,
}) => {
  return (
    <Card style={styles.card} padding="medium">
      <View style={styles.header}>
        <Ionicons name="person-outline" size={20} color={colors.text.primary} />
        <Text style={styles.title}>Yolcu Bilgileri</Text>
      </View>

      {/* Adults */}
      {Array.from({ length: passengers.adults }).map((_, index) => (
        <PassengerForm
          key={`adult-${index}`}
          passengerNumber={index + 1}
          passengerType="Yetişkin"
          savedPassengers={savedPassengers.filter(
            (p) => !passengerDetails.some((pd) => pd.id === p.id && passengerDetails[index]?.id !== p.id)
          )}
          onSelectPassenger={(p) => onSelectSavedPassenger(index, p)}
          onFormChange={(field, value) => onPassengerFormChange(index, field, value)}
          passengerData={passengerDetails[index] || {
            id: null,
            firstName: '',
            lastName: '',
            birthDay: '',
            birthMonth: '',
            birthYear: '',
            gender: '',
            identityNumber: '',
            isForeigner: false,
            shouldSave: false,
            type: 'Yetişkin',
          }}
          onSaveToggle={(checked) => onSaveToggle(index, checked)}
          shouldSave={passengerDetails[index]?.shouldSave || false}
          flight={flight}
        />
      ))}

      {/* Children */}
      {Array.from({ length: passengers.children }).map((_, index) => {
        const passengerIndex = index + passengers.adults;
        return (
          <PassengerForm
            key={`child-${index}`}
            passengerNumber={passengerIndex + 1}
            passengerType="Çocuk"
            savedPassengers={savedPassengers.filter(
              (p) => !passengerDetails.some((pd) => pd.id === p.id && passengerDetails[passengerIndex]?.id !== p.id)
            )}
            onSelectPassenger={(p) => onSelectSavedPassenger(passengerIndex, p)}
            onFormChange={(field, value) => onPassengerFormChange(passengerIndex, field, value)}
            passengerData={passengerDetails[passengerIndex] || {
              id: null,
              firstName: '',
              lastName: '',
              birthDay: '',
              birthMonth: '',
              birthYear: '',
              gender: '',
              identityNumber: '',
              isForeigner: false,
              shouldSave: false,
              type: 'Çocuk',
            }}
            onSaveToggle={(checked) => onSaveToggle(passengerIndex, checked)}
            shouldSave={passengerDetails[passengerIndex]?.shouldSave || false}
            flight={flight}
          />
        );
      })}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
});

