import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { homeScreenStyles } from '../styles/homeScreenStyles';
import type { Service } from '../constants/services';

interface ServiceIconProps {
  service: Service;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({ service }) => {
  return (
    <TouchableOpacity
      style={homeScreenStyles.serviceButton}
      onPress={service.onPress}
      activeOpacity={0.8}
    >
      <View style={homeScreenStyles.serviceIconWrapper}>
        <LinearGradient
          colors={[colors.primary[400], colors.primary[500], colors.primary[600]]}
          locations={[0, 0.3, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={homeScreenStyles.serviceIconContainer}
        >
          <Ionicons name={service.icon as any} size={28} color={colors.text.inverse} />
        </LinearGradient>
      </View>
      <Text style={homeScreenStyles.serviceName}>{service.name}</Text>
    </TouchableOpacity>
  );
};











