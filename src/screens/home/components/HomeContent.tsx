import React from 'react';
import { ScrollView, Text } from 'react-native';
import { homeScreenStyles } from '../styles/homeScreenStyles';

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
      <Text style={homeScreenStyles.placeholderText}>Ana Sayfa İçeriği</Text>
    </ScrollView>
  );
};

