import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { favoritesService } from '@/services/favoritesService';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';

interface SearchFavoriteBoxProps {
  origin: string;
  destination: string;
  departureDate: string;
}

export const SearchFavoriteBox: React.FC<SearchFavoriteBoxProps> = ({
  origin,
  destination,
  departureDate,
}) => {
  const { isAuthenticated } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toggleAnim = useRef(new Animated.Value(0)).current;

  // Mevcut favorileri kontrol et
  useEffect(() => {
    if (isAuthenticated) {
      checkIfFavorite();
    }
  }, [isAuthenticated, origin, destination, departureDate]);

  // Toggle animasyonu
  useEffect(() => {
    Animated.spring(toggleAnim, {
      toValue: isFavorite ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [isFavorite]);

  const checkIfFavorite = async () => {
    try {
      const favorites = await favoritesService.getFavorites();
      const exists = favorites.some(
        (f) =>
          f.origin === origin &&
          f.destination === destination &&
          f.departureDate === departureDate
      );
      setIsFavorite(exists);
    } catch (err) {
      // Sessizce hata yok say
    }
  };

  const handleToggle = async () => {
    if (loading) return;

    if (!isAuthenticated) {
      Alert.alert('Giriş Gerekli', 'Aramayı favorilere eklemek için giriş yapmalısınız.');
      return;
    }

    if (isFavorite) {
      // Favoriden kaldır - önce ID bul
      try {
        const favorites = await favoritesService.getFavorites();
        const favorite = favorites.find(
          (f) =>
            f.origin === origin &&
            f.destination === destination &&
            f.departureDate === departureDate
        );
        if (favorite) {
          await favoritesService.deleteFavorite(favorite.id);
          setIsFavorite(false);
        }
      } catch (err: any) {
        setError(err.message || 'Favoriden kaldırılamadı');
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await favoritesService.addFavorite({
        origin,
        destination,
        departureDate,
      });
      setIsFavorite(true);
    } catch (err: any) {
      setError(err.message || 'Favorilere eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Aramayı favorile</Text>
        <TouchableOpacity
          style={[
            styles.toggle,
            isFavorite && styles.toggleActive,
            loading && styles.toggleDisabled,
          ]}
          onPress={handleToggle}
          disabled={loading}
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
                name="heart"
                size={14}
                color={isFavorite ? colors.primary[600] : colors.gray[500]}
              />
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>
        Bu aramayı daha sonra kolayca tekrar yapmak için kaydet.
      </Text>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {isFavorite && !error && (
        <Text style={styles.successText}>Arama favorilere eklendi!</Text>
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
