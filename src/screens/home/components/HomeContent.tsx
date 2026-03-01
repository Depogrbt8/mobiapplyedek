import React from 'react';
import { ScrollView } from 'react-native';
import { homeScreenStyles } from '../styles/homeScreenStyles';
import { UserInfoCard } from './UserInfoCard';
import { LastFlightSearchCard } from '@/modules/travel/components/LastFlightSearchCard';
import { BannersSection } from './BannersSection';

export const HomeContent: React.FC = () => {
  return (
    <ScrollView
      style={homeScreenStyles.content}
      contentContainerStyle={homeScreenStyles.contentContainer}
      nestedScrollEnabled={true}
      scrollEventThrottle={16}
      scrollEnabled={true}
      bounces={true}
    >
      {/* Kullanıcı Bilgi Kartı */}
      <UserInfoCard />
      
      {/* Son Uçuş Aramam Kartı */}
      <LastFlightSearchCard />
      
      {/* Banner'lar - Admin panelinden yüklenen */}
      <BannersSection />
    </ScrollView>
  );
};










