import React from 'react';
import { ScrollView } from 'react-native';
import { homeScreenStyles } from '../styles/homeScreenStyles';
import { UserInfoCard } from './UserInfoCard';

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
    </ScrollView>
  );
};



