import React, { useState, useEffect } from 'react';
import { Text, Keyboard } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { MainTabParamList, TravelStackParamList, ProfileStackParamList } from '@/core/navigation/types';
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
  HotelDetailsScreen,
  HotelReservationScreen,
  HotelReservationSuccessScreen,
  CarSearchScreen,
  CarResultsScreen,
  CarReservationScreen,
  ThreeDSecureScreen,
} from '@/modules/travel/screens';
import { CarDetailsScreen } from '@/modules/travel/screens/CarDetailsScreen';
import { CarBookingScreen } from '@/modules/travel/screens/CarBookingScreen';
import { CarBookingSuccessScreen } from '@/modules/travel/screens/CarBookingSuccessScreen';
import { ProfileScreen, AccountInfoScreen, SettingsScreen, ReservationsHistoryScreen, PassengersScreen, AddEditPassengerScreen, FavoritesScreen, SearchHistoryScreen, PriceAlertsScreen, BillingInfoScreen } from '@/screens/profile';
import { MyTripsScreen } from '@/screens/profile/mytrips';
import { PNRQueryScreen, CheckInScreen, CancelTicketScreen } from '@/screens/travel';
import { HelpScreen, AboutScreen } from '@/screens/info';
import { HomeScreen } from '@/screens/home';
import { CustomHeaderLeft, CustomHeader } from '@/components/common';

const Tab = createBottomTabNavigator<MainTabParamList>();
const TravelStackNav = createNativeStackNavigator<TravelStackParamList>();
const ProfileStackNav = createNativeStackNavigator<ProfileStackParamList>();
const OperationsStackNav = createNativeStackNavigator();

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
        name="Travel/HotelDetails"
        component={HotelDetailsScreen}
        options={{ title: 'Otel Detayları' }}
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
        name="Travel/HotelReservationSuccess"
        component={HotelReservationSuccessScreen}
        options={{ title: 'Rezervasyon Onaylandı', headerLeft: () => null }}
      />
      <TravelStackNav.Screen
        name="Travel/CarDetails"
        component={CarDetailsScreen}
        options={{ title: 'Araç Detayları' }}
      />
      <TravelStackNav.Screen
        name="Travel/CarBooking"
        component={CarBookingScreen}
        options={{ title: 'Araç Rezervasyonu' }}
      />
      <TravelStackNav.Screen
        name="Travel/CarBookingSuccess"
        component={CarBookingSuccessScreen}
        options={{ title: 'Rezervasyon Onaylandı', headerLeft: () => null }}
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
      <TravelStackNav.Screen
        name="Travel/CheckIn"
        component={CheckInScreen}
        options={{ title: 'Online Check-in', headerShown: true }}
      />
      <TravelStackNav.Screen
        name="Travel/PNRQuery"
        component={PNRQueryScreen}
        options={{ title: 'PNR Sorgula', headerShown: true }}
      />
      <TravelStackNav.Screen
        name="Travel/CancelTicket"
        component={CancelTicketScreen}
        options={{ title: 'Bilet İptal', headerShown: true }}
      />
    </TravelStackNav.Navigator>
  );
};

export const MainNavigator: React.FC = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  let enabledModules: any[] = [];
  try {
    enabledModules = moduleRegistry?.getEnabledModules?.() || [];
    if (!Array.isArray(enabledModules)) {
      enabledModules = [];
    }
  } catch (error) {
    console.error('Module registry error:', error);
    enabledModules = [];
  }

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
          display: isKeyboardVisible ? 'none' : 'flex',
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
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Operations"
        component={OperationsStack}
        options={{
          tabBarLabel: 'İşlemler',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Hesabım',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Profile tab'ına tıklandığında ProfileMain'e git
            e.preventDefault();
            navigation.navigate('Profile', { screen: 'ProfileMain' });
          },
        })}
      />
    </Tab.Navigator>
  );
};

// Operations Stack Navigator - İşlemler tab'ı için
const OperationsStack: React.FC = () => {
  return (
    <OperationsStackNav.Navigator
      initialRouteName="MyTrips"
      screenOptions={({ navigation, route }: any) => {
        if (!route || !navigation) {
          return {
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.primary[600],
            },
            headerTintColor: colors.text.inverse,
          };
        }
        
        return {
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.primary[600],
          },
          headerTintColor: colors.text.inverse,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerBackVisible: false,
          headerBackTitleVisible: false,
          headerLeft: () => null,
          headerLeftContainerStyle: {
            width: 0,
            paddingLeft: 0,
            marginLeft: 0,
          },
          headerTitle: () => {
            if (!route || !route.name) {
              return <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text.inverse }}>İşlemler</Text>;
            }

            const getTitle = (name: string) => {
              const titles: Record<string, string> = {
                MyTrips: 'Seyahatlerim',
              };
              return titles[name] || name;
            };

            const title = getTitle(route.name);
            
            if (route.name === 'MyTrips') {
              return <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text.inverse }}>{title}</Text>;
            }
            return <CustomHeader title={title} showBackButton={true} />;
          },
        };
      }}
    >
      <OperationsStackNav.Screen
        name="MyTrips"
        component={MyTripsScreen}
        options={{ title: 'Seyahatlerim' }}
      />
    </OperationsStackNav.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStack: React.FC = () => {
  return (
    <ProfileStackNav.Navigator
      initialRouteName="ProfileMain"
      screenOptions={({ navigation, route }: any) => {
        // route ve navigation güvenli kontrolü
        if (!route || !navigation) {
          return {
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.primary[600],
            },
            headerTintColor: colors.text.inverse,
          };
        }
        
        return {
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary[600],
        },
        headerTintColor: colors.text.inverse,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerBackVisible: false, // React Navigation'ın default geri butonunu gizle
        headerBackTitleVisible: false, // Geri buton başlığını gizle
        headerLeft: () => null, // headerLeft'i tamamen kaldır
        headerLeftContainerStyle: {
          width: 0,
          paddingLeft: 0,
          marginLeft: 0,
        },
        headerTitle: () => {
          // route ve route.name kontrolü
          if (!route || !route.name) {
            return <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text.inverse }}>Profil</Text>;
          }

          // Ekran isimlerine göre title'ları belirle
          const getTitle = (name: string) => {
            const titles: Record<string, string> = {
              ProfileMain: 'Hesabım',
              AccountInfo: 'Hesap Bilgileri',
              MyTrips: 'Seyahatlerim',
              ReservationsHistory: 'Rezervasyonlarım',
              Settings: 'Ayarlar',
              Passengers: 'Yolcularım',
              // PNRQuery, CheckIn, CancelTicket TravelStack'e taşındı
              Help: 'Yardım',
              About: 'Hakkımızda',
              Favorites: 'Favorilerim',
              SearchHistory: 'Aramalarım',
              PriceAlerts: 'Fiyat Alarmlarım',
              AddEditPassenger: 'Yolcu',
              BillingInfo: 'Fatura Bilgilerim',
            };
            return titles[name] || name;
          };

          const title = getTitle(route.name);
          
          // İlk ekran (ProfileMain) için geri butonu gösterme
          if (route.name === 'ProfileMain') {
            return <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text.inverse }}>{title}</Text>;
          }
          return <CustomHeader title={title} showBackButton={true} />;
        },
      };
      }}
    >
      <ProfileStackNav.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
      <ProfileStackNav.Screen
        name="AccountInfo"
        component={AccountInfoScreen}
        options={{ title: 'Hesap Bilgileri' }}
      />
      <ProfileStackNav.Screen
        name="MyTrips"
        component={MyTripsScreen}
        options={{ title: 'Seyahatlerim' }}
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

