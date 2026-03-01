import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { homeScreenStyles } from '../styles/homeScreenStyles';

export const HomeHeader: React.FC = () => {
  return (
    <LinearGradient
      colors={[colors.primary[400], colors.primary[500], colors.primary[600]]}
      locations={[0, 0.3, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={homeScreenStyles.headerWrapper}
    >
      <SafeAreaView style={homeScreenStyles.header} edges={['top']}>
        <View style={homeScreenStyles.logoContainer}>
          <Text style={homeScreenStyles.logoText}>
            <Text style={homeScreenStyles.logoWhite}>gurbet</Text>
            <Text style={homeScreenStyles.logoBlack}>biz</Text>
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};











