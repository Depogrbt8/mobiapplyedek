import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HotelDetails } from '../components/HotelDetails';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { getHotelDetails } from '../services/hotelService';
import type { HotelDetails as HotelDetailsType, HotelSearchParams } from '../types/hotel';
import type { TravelStackParamList } from '@/core/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';

type RouteProp = RouteProp<TravelStackParamList, 'Travel/HotelDetails'>;
type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/HotelDetails'>;

export const HotelDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { hotelId, searchParams } = route.params;
  const logout = useAuthStore((s) => s.logout);

  const [hotel, setHotel] = useState<HotelDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHotelDetails();
  }, [hotelId]);

  const loadHotelDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const details = await getHotelDetails(hotelId, searchParams);
      if (details) {
        setHotel(details);
      } else {
        setError('Otel detayları bulunamadı');
      }
    } catch (err: any) {
      setError(err.message || 'Otel detayları yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoomSelect = (roomId: string, rateId: string) => {
    if (!hotel || !searchParams) {
      Alert.alert('Hata', 'Rezervasyon bilgileri eksik');
      return;
    }

    // Seçilen oda ve rate'i bul
    const selectedRoom = hotel.rooms.find(r => r.id === roomId);
    const selectedRate = selectedRoom?.rates.find(r => r.id === rateId);

    if (!selectedRoom || !selectedRate) {
      Alert.alert('Hata', 'Oda veya fiyat seçimi geçersiz');
      return;
    }

    // Rezervasyon ekranına git
    navigation.navigate('Travel/HotelReservation', {
      hotel: hotel,
      room: selectedRoom,
      rate: selectedRate,
      searchParams: searchParams,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  if (error || !hotel || !searchParams) {
    return (
      <ErrorDisplay 
        error={error || 'Otel detayları bulunamadı'} 
        onRetry={loadHotelDetails} 
      />
    );
  }

  return (
    <HotelDetails
      hotel={hotel}
      checkIn={searchParams.checkIn}
      checkOut={searchParams.checkOut}
      guests={searchParams.guests}
      onRoomSelect={handleRoomSelect}
      onLoginRequired={() => logout()}
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

