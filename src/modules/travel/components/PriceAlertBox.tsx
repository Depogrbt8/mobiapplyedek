import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { priceAlertsService } from '@/services/priceAlertsService';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';

interface PriceAlertBoxProps {
  origin: string;
  destination: string;
  departureDate: string;
}

export const PriceAlertBox: React.FC<PriceAlertBoxProps> = ({
  origin,
  destination,
  departureDate,
}) => {
  const { isAuthenticated } = useAuthStore();
  const [isAlertCreated, setIsAlertCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toggleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(toggleAnim, {
      toValue: isAlertCreated ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [isAlertCreated]);

  const handleToggle = async () => {
    if (loading || isAlertCreated) return;

    if (!isAuthenticated) {
      Alert.alert('Giriş Gerekli', 'Fiyat alarmı oluşturmak için giriş yapmalısınız.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await priceAlertsService.createAlert({
        origin,
        destination,
        departureDate,
      });
      setIsAlertCreated(true);
    } catch (err: any) {
      setError(err.message || 'Fiyat alarmı oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fiyat alarmı</Text>
        <TouchableOpacity
          style={[
            styles.toggle,
            isAlertCreated && styles.toggleActive,
            (loading || isAlertCreated) && styles.toggleDisabled,
          ]}
          onPress={handleToggle}
          disabled={loading || isAlertCreated}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.toggleThumb,
              {
                transform: [
                  {
                    translateX: toggleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 24],
                    }),
                  },
                ],
                borderColor: toggleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [colors.gray[300], colors.primary[600]],
                }),
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary[600]} />
            ) : (
              <Ionicons
                name="notifications"
                size={14}
                color={isAlertCreated ? colors.primary[600] : colors.gray[500]}
              />
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>
        Bu rota için fiyatlar değiştiğinde alarm alın.
      </Text>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {isAlertCreated && !error && (
        <Text style={styles.successText}>Alarm başarıyla oluşturuldu!</Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[600],
  },
  toggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary[600],
  },
  toggleDisabled: {
    opacity: 0.7,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 8,
  },
  successText: {
    fontSize: 12,
    color: colors.primary[600],
    marginTop: 8,
  },
});
