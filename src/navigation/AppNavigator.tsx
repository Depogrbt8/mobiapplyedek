import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/authStore';
import { AuthStack } from './AuthStack';
import { MainNavigator } from './MainNavigator';
import { LoadingScreen, SplashScreen } from '@/components/common';
import type { RootStackParamList } from '@/core/navigation/types';
import {
  HotelResultsScreen,
  HotelDetailsScreen,
  HotelReservationScreen,
  FlightResultsScreen,
  ReservationScreen,
  CarResultsScreen,
  CarReservationScreen,
} from '@/modules/travel/screens';
import { CarDetailsScreen } from '@/modules/travel/screens/CarDetailsScreen';
import { CarBookingScreen } from '@/modules/travel/screens/CarBookingScreen';
import { CarBookingSuccessScreen } from '@/modules/travel/screens/CarBookingSuccessScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isLoading, isAuthenticated, checkAuth } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Splash screen gösteriliyorsa
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Auth kontrolü yapılıyorsa
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            {/* TravelStack ekranları root navigator'da da tanımlı olmalı */}
            <Stack.Screen 
              name="Travel/HotelResults" 
              component={HotelResultsScreen}
              options={{ title: 'Otel Sonuçları' }}
            />
            <Stack.Screen 
              name="Travel/HotelDetails" 
              component={HotelDetailsScreen}
              options={{ title: 'Otel Detayları' }}
            />
            <Stack.Screen 
              name="Travel/HotelReservation" 
              component={HotelReservationScreen}
              options={{ title: 'Otel Rezervasyonu' }}
            />
            <Stack.Screen 
              name="Travel/FlightResults" 
              component={FlightResultsScreen}
              options={{ title: 'Uçuş Sonuçları' }}
            />
            <Stack.Screen 
              name="Travel/Reservation" 
              component={ReservationScreen}
              options={{ title: 'Rezervasyon' }}
            />
            <Stack.Screen 
              name="Travel/CarResults" 
              component={CarResultsScreen}
              options={{ title: 'Araç Sonuçları' }}
            />
            <Stack.Screen 
              name="Travel/CarDetails" 
              component={CarDetailsScreen}
              options={{ title: 'Araç Detayları' }}
            />
            <Stack.Screen 
              name="Travel/CarBooking" 
              component={CarBookingScreen}
              options={{ title: 'Araç Rezervasyonu' }}
            />
            <Stack.Screen 
              name="Travel/CarBookingSuccess" 
              component={CarBookingSuccessScreen}
              options={{ title: 'Rezervasyon Onaylandı', headerBackVisible: false }}
            />
            <Stack.Screen 
              name="Travel/CarReservation" 
              component={CarReservationScreen}
              options={{ title: 'Araç Kiralama' }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

