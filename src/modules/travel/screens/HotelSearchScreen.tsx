import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '../components/DatePicker';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';

type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/HotelSearch'>;

export const HotelSearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);

  const handleSearch = () => {
    if (!location || !checkIn || !checkOut) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    const searchParams = {
      location,
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      guests,
      rooms,
    };

    navigation.navigate('Travel/HotelResults', { searchParams });
  };

  const isFormValid = location && checkIn && checkOut;

  return (
    <View style={styles.contentContainer}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content}>
        <Input
          label="Konum"
          placeholder="Şehir veya otel adı"
          value={location}
          onChangeText={setLocation}
        />

        <DatePicker
          label="Giriş Tarihi"
          value={checkIn}
          onChange={setCheckIn}
          minimumDate={new Date()}
          placeholder="Giriş tarihi seçin"
        />

        <DatePicker
          label="Çıkış Tarihi"
          value={checkOut}
          onChange={setCheckOut}
          minimumDate={checkIn || new Date()}
          placeholder="Çıkış tarihi seçin"
        />

        <View style={styles.guestsContainer}>
          <Text style={styles.label}>Misafir Sayısı</Text>
          <View style={styles.guestsControls}>
            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => setGuests(Math.max(1, guests - 1))}
            >
              <Text style={styles.guestButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.guestCount}>{guests}</Text>
            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => setGuests(Math.min(10, guests + 1))}
            >
              <Text style={styles.guestButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.roomsContainer}>
          <Text style={styles.label}>Oda Sayısı</Text>
          <View style={styles.roomsControls}>
            <TouchableOpacity
              style={styles.roomButton}
              onPress={() => setRooms(Math.max(1, rooms - 1))}
            >
              <Text style={styles.roomButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.roomCount}>{rooms}</Text>
            <TouchableOpacity
              style={styles.roomButton}
              onPress={() => setRooms(Math.min(5, rooms + 1))}
            >
              <Text style={styles.roomButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title="Otel Ara"
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
  guestsContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  roomsContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 12,
  },
  guestsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guestButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  roomButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  guestCount: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  roomCount: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  searchButton: {
    marginTop: 24,
  },
});

