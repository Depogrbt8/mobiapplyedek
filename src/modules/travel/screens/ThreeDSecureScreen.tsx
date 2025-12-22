import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
import { apiClient } from '@/core/api/client';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';

type RouteProp = RouteProp<TravelStackParamList, 'Travel/3DSecure'>;
type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/3DSecure'>;

export const ThreeDSecureScreen: React.FC = () => {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { redirectUrl, reservationId } = route.params;
  const [isLoading, setIsLoading] = useState(true);

  const handleNavigationStateChange = (navState: any) => {
    // Check if we're back from 3D Secure
    if (navState.url.includes('3d-secure-callback') || navState.url.includes('success')) {
      // Complete the payment
      completePayment();
    } else if (navState.url.includes('cancel') || navState.url.includes('error')) {
      Alert.alert('Hata', '3D Secure doğrulaması başarısız oldu', [
        {
          text: 'Tamam',
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  };

  const completePayment = async () => {
    try {
      // Call backend to complete 3D Secure payment
      // config.API_URL already includes '/api', so we only need '/payment/3d-secure/complete'
      const response = await apiClient.post('/payment/3d-secure/complete', {
        reservationId,
      });

      if (response.data.success) {
        navigation.navigate('Travel/ReservationSuccess', { reservationId });
      } else {
        Alert.alert('Hata', response.data.message || 'Ödeme tamamlanamadı');
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Ödeme tamamlanamadı');
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
        </View>
      )}
      <WebView
        source={{ uri: redirectUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    zIndex: 1,
  },
  webview: {
    flex: 1,
  },
});



