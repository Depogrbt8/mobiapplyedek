import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CarCard } from '../components/CarCard';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { carService, type Car } from '../services/carService';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';

type RouteProp = RouteProp<TravelStackParamList, 'Travel/CarResults'>;
type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/CarResults'>;

export const CarResultsScreen: React.FC = () => {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { searchParams } = route.params;

  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    searchCars();
  }, []);

  const searchCars = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await carService.searchCars(searchParams);
      setCars(results);
    } catch (err: any) {
      setError(err.message || 'Araç araması başarısız oldu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await searchCars();
    setRefreshing(false);
  };

  const handleCarPress = (car: Car) => {
    navigation.navigate('Travel/CarReservation', { car });
  };

  if (isLoading && cars.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Araç aranıyor...</Text>
      </View>
    );
  }

  if (error && cars.length === 0) {
    return <ErrorDisplay error={error} onRetry={searchCars} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CarCard car={item} onPress={() => handleCarPress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Araç bulunamadı</Text>
            <Text style={styles.emptySubtext}>
              Farklı tarih veya lokasyon deneyin
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

