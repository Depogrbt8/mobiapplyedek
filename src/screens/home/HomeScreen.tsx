import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors } from '@/constants/colors';
import { homeScreenStyles } from './styles/homeScreenStyles';
import { GlobalHeader } from '@/components/common/GlobalHeader';
import { useHomeStore } from '@/store/homeStore';
import { HomeContent } from './components';
import { FlightSearchScreen } from '@/modules/travel/screens/FlightSearchScreen';
import { HotelSearchScreen } from '@/modules/travel/screens/HotelSearchScreen';
import { CarSearchScreen } from '@/modules/travel/screens/CarSearchScreen';
import { ESIMScreen } from '@/screens/esim/ESIMScreen';
import { SurveyPopup } from '@/components/SurveyPopup';

export const HomeScreen: React.FC = () => {
  const homeStore = useHomeStore();
  const route = useRoute();
  const navigation = useNavigation<any>();
  const selectedService = homeStore?.selectedService || 'home';

  // Route params'dan service ve search params'ı al
  useEffect(() => {
    const params = route.params as any;
    if (params?.service && homeStore?.setSelectedService) {
      homeStore.setSelectedService(params.service);
    }
  }, [route.params, homeStore]);

  const renderContent = () => {
    const params = route.params as any;
    switch (selectedService) {
      case 'flight':
        return <FlightSearchScreen initialParams={params?.searchParams} />;
      case 'hotel':
        return <HotelSearchScreen onNavigateToResults={(searchParams) => {
          // Root navigator'a navigate et (Travel/HotelResults artık root navigator'da tanımlı)
          navigation.navigate('Travel/HotelResults' as never, { searchParams } as never);
        }} />;
      case 'car':
        return <CarSearchScreen />;
      case 'esim':
        return <ESIMScreen />;
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
      <SurveyPopup />
    </View>
  );
};

