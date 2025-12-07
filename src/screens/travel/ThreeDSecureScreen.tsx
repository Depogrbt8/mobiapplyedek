import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors } from '@/constants/colors';

export const ThreeDSecureScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { redirectUrl, reservationId } = route.params as any;
  const [loading, setLoading] = useState(true);

  const handleNavigationStateChange = (navState: any) => {
    // Check if we're back from 3D Secure
    if (navState.url.includes('3d-secure-callback')) {
      const url = new URL(navState.url);
      const success = url.searchParams.get('success');
      const token = url.searchParams.get('token');

      if (success === 'true' && token) {
        // Payment successful
        navigation.navigate('Travel/ReservationSuccess' as never, {
          reservationId,
        } as never);
      } else {
        // Payment failed
        Alert.alert('Ödeme Başarısız', '3D Secure doğrulaması başarısız oldu', [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
        </View>
      )}
      <WebView
        source={{ uri: redirectUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
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

