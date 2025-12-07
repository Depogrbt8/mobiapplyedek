import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HotelCard } from '../components/HotelCard';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { hotelService, type Hotel } from '../services/hotelService';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';

type RouteProp = RouteProp<TravelStackParamList, 'Travel/HotelResults'>;
type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/HotelResults'>;

export const HotelResultsScreen: React.FC = () => {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { searchParams } = route.params;

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    searchHotels();
  }, []);

  const searchHotels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await hotelService.searchHotels(searchParams);
      setHotels(results);
    } catch (err: any) {
      setError(err.message || 'Otel araması başarısız oldu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await searchHotels();
    setRefreshing(false);
  };

  const handleHotelPress = (hotel: Hotel) => {
    navigation.navigate('Travel/HotelReservation', { hotel });
  };

  if (isLoading && hotels.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Otel aranıyor...</Text>
      </View>
    );
  }

  if (error && hotels.length === 0) {
    return <ErrorDisplay error={error} onRetry={searchHotels} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={hotels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HotelCard hotel={item} onPress={() => handleHotelPress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Otel bulunamadı</Text>
            <Text style={styles.emptySubtext}>
              Farklı tarih veya konum deneyin
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

