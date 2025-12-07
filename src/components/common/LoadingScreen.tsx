import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { colors } from '@/constants/colors';

export const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary[600]} />
      <Text style={styles.text}>Yükleniyor...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
});

