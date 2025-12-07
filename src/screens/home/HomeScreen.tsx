import React from 'react';
import { View, StatusBar } from 'react-native';
import { colors } from '@/constants/colors';
import { homeScreenStyles } from './styles/homeScreenStyles';
import { GlobalHeader } from '@/components/common/GlobalHeader';
import { useHomeStore } from '@/store/homeStore';
import { HomeContent } from './components';
import { FlightSearchScreen } from '@/modules/travel/screens/FlightSearchScreen';
import { HotelSearchScreen } from '@/modules/travel/screens/HotelSearchScreen';
import { CarSearchScreen } from '@/modules/travel/screens/CarSearchScreen';

export const HomeScreen: React.FC = () => {
  const { selectedService } = useHomeStore();

  const renderContent = () => {
    switch (selectedService) {
      case 'flight':
        return <FlightSearchScreen />;
      case 'hotel':
        return <HotelSearchScreen />;
      case 'car':
        return <CarSearchScreen />;
      case 'esim':
        return <HomeContent />; // TODO: E SIM servisi eklenecek
      case 'home':
      default:
        return <HomeContent />;
    }
  };

  return (
    <View style={homeScreenStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary[600]} />
      <GlobalHeader />
      {renderContent()}
    </View>
  );
};

