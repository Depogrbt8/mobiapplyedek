import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { MainTabParamList, TravelStackParamList } from '@/core/navigation/types';
import { moduleRegistry } from '@/modules/registry';
import { colors } from '@/constants/colors';

import {
  FlightSearchScreen,
  FlightResultsScreen,
  FlightDetailsScreen,
  ReservationScreen,
  PaymentScreen,
  ReservationSuccessScreen,
  HotelSearchScreen,
  HotelResultsScreen,
  HotelReservationScreen,
  CarSearchScreen,
  CarResultsScreen,
  CarReservationScreen,
  ThreeDSecureScreen,
} from '@/modules/travel/screens';
import { ProfileScreen, SettingsScreen, ReservationsHistoryScreen, PassengersScreen, AddEditPassengerScreen, FavoritesScreen, SearchHistoryScreen, PriceAlertsScreen, BillingInfoScreen } from '@/screens/profile';
import { PNRQueryScreen, CheckInScreen, CancelTicketScreen } from '@/screens/travel';
import { HelpScreen, AboutScreen } from '@/screens/info';
import { HomeScreen } from '@/screens/home';

const Tab = createBottomTabNavigator<MainTabParamList>();
const TravelStackNav = createNativeStackNavigator<TravelStackParamList>();
const ProfileStackNav = createNativeStackNavigator();

// Placeholder screens for now
const PlaceholderScreen = () => {
  return null;
};

// Travel Stack Navigator
const TravelStack: React.FC = () => {
  return (
    <TravelStackNav.Navigator
      screenOptions={{
        headerShown: false, // GlobalHeader kullanacağız
        presentation: 'card', // Normal navigation
      }}
    >
      <TravelStackNav.Screen
        name="Travel/FlightSearch"
        component={FlightSearchScreen}
        options={{ 
          presentation: 'modal', // Aşağıdan açılacak
          headerShown: false,
        }}
      />
      <TravelStackNav.Screen
        name="Travel/FlightResults"
        component={FlightResultsScreen}
        options={{ title: 'Uçuş Sonuçları' }}
      />
      <TravelStackNav.Screen
        name="Travel/FlightDetails"
        component={FlightDetailsScreen}
        options={{ title: 'Uçuş Detayları' }}
      />
      <TravelStackNav.Screen
        name="Travel/HotelSearch"
        component={HotelSearchScreen}
        options={{ 
          presentation: 'modal', // Aşağıdan açılacak
          headerShown: false,
        }}
      />
      <TravelStackNav.Screen
        name="Travel/CarSearch"
        component={CarSearchScreen}
        options={{ 
          presentation: 'modal', // Aşağıdan açılacak
          headerShown: false,
        }}
      />
      <TravelStackNav.Screen
        name="Travel/Reservation"
        component={ReservationScreen}
        options={{ title: 'Rezervasyon' }}
      />
      <TravelStackNav.Screen
        name="Travel/Payment"
        component={PaymentScreen}
        options={{ title: 'Ödeme' }}
      />
      <TravelStackNav.Screen
        name="Travel/ReservationSuccess"
        component={ReservationSuccessScreen}
        options={{ title: 'Başarılı', headerLeft: () => null }}
      />
      <TravelStackNav.Screen
        name="Travel/HotelResults"
        component={HotelResultsScreen}
        options={{ title: 'Otel Sonuçları' }}
      />
      <TravelStackNav.Screen
        name="Travel/CarResults"
        component={CarResultsScreen}
        options={{ title: 'Araç Sonuçları' }}
      />
      <TravelStackNav.Screen
        name="Travel/HotelReservation"
        component={HotelReservationScreen}
        options={{ title: 'Otel Rezervasyonu' }}
      />
      <TravelStackNav.Screen
        name="Travel/CarReservation"
        component={CarReservationScreen}
        options={{ title: 'Araç Kiralama' }}
      />
      <TravelStackNav.Screen
        name="Travel/3DSecure"
        component={ThreeDSecureScreen}
        options={{ title: '3D Secure', headerShown: false }}
      />
    </TravelStackNav.Navigator>
  );
};

export const MainNavigator: React.FC = () => {
  const enabledModules = moduleRegistry.getEnabledModules();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.gray[500],
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.gray[200],
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Ana Sayfa',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      
      {enabledModules.map((module) => {
        if (module.id === 'travel') {
          return (
            <Tab.Screen
              key={module.id}
              name="Travel"
              component={TravelStack}
              options={{
                tabBarLabel: module.name,
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="airplane" size={size} color={color} />
                ),
              }}
            />
          );
        }
        return null;
      })}
      
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profil',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStack: React.FC = () => {
  return (
    <ProfileStackNav.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary[600],
        },
        headerTintColor: colors.text.inverse,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <ProfileStackNav.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
      <ProfileStackNav.Screen
        name="ReservationsHistory"
        component={ReservationsHistoryScreen}
        options={{ title: 'Rezervasyonlarım' }}
      />
      <ProfileStackNav.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Ayarlar' }}
      />
      <ProfileStackNav.Screen
        name="Passengers"
        component={PassengersScreen}
        options={{ title: 'Yolcularım' }}
      />
      <ProfileStackNav.Screen
        name="PNRQuery"
        component={PNRQueryScreen}
        options={{ title: 'PNR Sorgula' }}
      />
      <ProfileStackNav.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{ title: 'Online Check-in' }}
      />
      <ProfileStackNav.Screen
        name="CancelTicket"
        component={CancelTicketScreen}
        options={{ title: 'Bilet İptal' }}
      />
      <ProfileStackNav.Screen
        name="Help"
        component={HelpScreen}
        options={{ title: 'Yardım' }}
      />
      <ProfileStackNav.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'Hakkımızda' }}
      />
      <ProfileStackNav.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Favorilerim' }}
      />
      <ProfileStackNav.Screen
        name="SearchHistory"
        component={SearchHistoryScreen}
        options={{ title: 'Aramalarım' }}
      />
      <ProfileStackNav.Screen
        name="PriceAlerts"
        component={PriceAlertsScreen}
        options={{ title: 'Fiyat Alarmlarım' }}
      />
      <ProfileStackNav.Screen
        name="AddEditPassenger"
        component={AddEditPassengerScreen}
        options={{ title: 'Yolcu' }}
      />
      <ProfileStackNav.Screen
        name="BillingInfo"
        component={BillingInfoScreen}
        options={{ title: 'Fatura Bilgilerim' }}
      />
    </ProfileStackNav.Navigator>
  );
};

