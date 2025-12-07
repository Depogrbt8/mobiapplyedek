import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '../components/DatePicker';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';

type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/CarSearch'>;

export const CarSearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [dropoffDate, setDropoffDate] = useState<Date | null>(null);
  const [dropoffTime, setDropoffTime] = useState('');

  const handleSearch = () => {
    if (!pickupLocation || !pickupDate || !dropoffLocation || !dropoffDate) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    const searchParams = {
      pickupLocation,
      pickupDate: pickupDate.toISOString().split('T')[0],
      pickupTime,
      dropoffLocation,
      dropoffDate: dropoffDate.toISOString().split('T')[0],
      dropoffTime,
    };

    navigation.navigate('Travel/CarResults', { searchParams });
  };

  const isFormValid = pickupLocation && pickupDate && dropoffLocation && dropoffDate;

  return (
    <View style={styles.contentContainer}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content}>
        <Input
          label="Alış Lokasyonu"
          placeholder="Şehir veya havalimanı"
          value={pickupLocation}
          onChangeText={setPickupLocation}
        />

        <DatePicker
          label="Alış Tarihi"
          value={pickupDate}
          onChange={setPickupDate}
          minimumDate={new Date()}
          placeholder="Alış tarihi seçin"
        />

        <Input
          label="Alış Saati"
          placeholder="Örn: 10:00"
          value={pickupTime}
          onChangeText={setPickupTime}
        />

        <View style={styles.swapButtonContainer}>
          <TouchableOpacity
            style={styles.swapButton}
            onPress={() => {
              const tempLoc = pickupLocation;
              const tempDate = pickupDate;
              const tempTime = pickupTime;
              setPickupLocation(dropoffLocation);
              setPickupDate(dropoffDate);
              setPickupTime(dropoffTime);
              setDropoffLocation(tempLoc);
              setDropoffDate(tempDate);
              setDropoffTime(tempTime);
            }}
          >
            <Text style={styles.swapButtonText}>⇅</Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Teslim Lokasyonu"
          placeholder="Şehir veya havalimanı"
          value={dropoffLocation}
          onChangeText={setDropoffLocation}
        />

        <DatePicker
          label="Teslim Tarihi"
          value={dropoffDate}
          onChange={setDropoffDate}
          minimumDate={pickupDate || new Date()}
          placeholder="Teslim tarihi seçin"
        />

        <Input
          label="Teslim Saati"
          placeholder="Örn: 18:00"
          value={dropoffTime}
          onChangeText={setDropoffTime}
        />

        <Button
          title="Araç Ara"
          onPress={handleSearch}
          disabled={!isFormValid}
          fullWidth
          style={styles.searchButton}
        />
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 20, // GlobalHeader için boşluk
  },
  swapButtonContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  swapButtonText: {
    color: colors.background,
    fontSize: 20,
    fontWeight: '600',
  },
  searchButton: {
    marginTop: 24,
  },
});

