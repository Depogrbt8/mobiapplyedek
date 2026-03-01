// Araç Sonuçları Ekranı - Desktop (grbt8) birebir React Native
// Filtre, sıralama, skeleton loading, araç listesi + arama özeti header

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CarCard } from '../components/CarCard';
import { CarFilters } from '../components/CarFilters';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { useCarSearch } from '../hooks/useCarSearch';
import type {
  Car,
  CarSearchParams,
  CarFiltersType,
  SimpleCarSearchParams,
  CarSortOption,
} from '../types/car';
import {
  formatCarDate,
  getActiveFilterCount,
} from '../utils/carHelpers';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';

type CarResultsRouteProp = RouteProp<TravelStackParamList, 'Travel/CarResults'>;
type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/CarResults'>;

// Sıralama seçenekleri - Desktop ile birebir
const SORT_OPTIONS: { value: CarSortOption; label: string }[] = [
  { value: 'recommended', label: 'Önerilen' },
  { value: 'price_asc', label: 'Fiyat (Düşükten Yükseğe)' },
  { value: 'price_desc', label: 'Fiyat (Yüksekten Düşüğe)' },
  { value: 'rating', label: 'Puan' },
];

export const CarResultsScreen: React.FC = () => {
  const route = useRoute<CarResultsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { searchParams: simpleParams } = route.params as { searchParams: SimpleCarSearchParams };

  const [showFilters, setShowFilters] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [filters, setFilters] = useState<CarFiltersType>({});
  const [sortOption, setSortOption] = useState<CarSortOption>('recommended');

  const { result, allCars, loading, error, search, filterOptions } = useCarSearch();

  // İlk arama
  useEffect(() => {
    performSearch();
  }, []);

  const performSearch = useCallback(() => {
    const params: CarSearchParams = {
      route: {
        pickup: {
          location: {
            id: simpleParams.pickupLocationId,
            name: simpleParams.pickupLocationName,
            type: simpleParams.pickupLocationId.includes('airport') ? 'airport' : 'city',
            country: 'Türkiye',
            countryCode: 'TR',
          },
          datetime: `${simpleParams.pickupDate}T${simpleParams.pickupTime}:00`,
        },
        dropoff: {
          location: {
            id: simpleParams.dropoffLocationId,
            name: simpleParams.dropoffLocationName,
            type: simpleParams.dropoffLocationId.includes('airport') ? 'airport' : 'city',
            country: 'Türkiye',
            countryCode: 'TR',
          },
          datetime: `${simpleParams.dropoffDate}T${simpleParams.dropoffTime}:00`,
        },
      },
      driver: { age: simpleParams.driverAge || 30 },
      booker: { country: 'tr' },
      currency: 'EUR',
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      sort:
        sortOption === 'price_asc'
          ? { by: 'price', direction: 'ascending' }
          : sortOption === 'price_desc'
            ? { by: 'price', direction: 'descending' }
            : sortOption === 'rating'
              ? { by: 'review_score', direction: 'descending' }
              : undefined,
    };

    search(params);
  }, [simpleParams, filters, sortOption, search]);

  // Filtre değişince yeniden ara
  const handleFiltersChange = useCallback(
    (newFilters: CarFiltersType) => {
      setFilters(newFilters);
      // Filtered search will trigger via effect
    },
    []
  );

  // Filtre/sıralama değişince yeniden ara
  useEffect(() => {
    if (allCars.length > 0) {
      performSearch();
    }
  }, [filters, sortOption]);

  const handleCarPress = useCallback(
    (car: Car) => {
      const searchToken = result?.metadata.searchToken || '';
      navigation.navigate('Travel/CarDetails', {
        carId: car.id,
        searchToken,
        searchParams: simpleParams,
      });
    },
    [result, navigation, simpleParams]
  );

  const activeFilterCount = getActiveFilterCount(filters);
  const totalCount = result?.metadata.totalResults || 0;

  if (loading && allCars.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Araçlar aranıyor...</Text>
      </View>
    );
  }

  if (error && allCars.length === 0) {
    return <ErrorDisplay error={error} onRetry={performSearch} />;
  }

  const cars = result?.data || [];

  return (
    <View style={styles.container}>
      {/* Search Summary Header */}
      <View style={styles.summaryHeader}>
        <View style={styles.summaryTop}>
          <Text style={styles.summaryTitle} numberOfLines={1}>
            {simpleParams.pickupLocationName}
          </Text>
          <Text style={styles.summaryCount}>{totalCount} araç bulundu</Text>
        </View>
        <Text style={styles.summaryDates}>
          {formatCarDate(simpleParams.pickupDate)} - {formatCarDate(simpleParams.dropoffDate)}
        </Text>
      </View>

      {/* Filtre / Sıralama bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowFilters(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="filter" size={18} color={colors.text.primary} />
          <Text style={styles.actionButtonText}>Filtrele</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowSortModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="swap-vertical" size={18} color={colors.text.primary} />
          <Text style={styles.actionButtonText}>Sırala</Text>
        </TouchableOpacity>
      </View>

      {/* Araç Listesi */}
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CarCard car={item} onPress={() => handleCarPress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={performSearch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🚗</Text>
            <Text style={styles.emptyTitle}>Araç Bulunamadı</Text>
            <Text style={styles.emptySubtext}>
              Arama kriterlerinize uygun araç bulunamadı.{'\n'}Lütfen farklı tarih veya lokasyon
              deneyin.
            </Text>
          </View>
        }
      />

      {/* Filtre Modal */}
      <CarFilters
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        filterOptions={filterOptions}
      />

      {/* Sıralama Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.sortOverlay}>
          <SafeAreaView style={styles.sortContainer}>
            <View style={styles.sortHeader}>
              <Text style={styles.sortTitle}>Sıralama</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  sortOption === option.value && styles.sortOptionActive,
                ]}
                onPress={() => {
                  setSortOption(option.value);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortOption === option.value && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {sortOption === option.value && (
                  <Ionicons name="checkmark" size={20} color={colors.primary[600]} />
                )}
              </TouchableOpacity>
            ))}
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
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
  // Summary header
  summaryHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  summaryCount: {
    fontSize: 13,
    color: colors.gray[500],
  },
  summaryDates: {
    fontSize: 13,
    color: colors.gray[500],
    marginTop: 2,
  },
  // Action bar
  actionBar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  filterBadge: {
    backgroundColor: colors.primary[600],
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  // List
  listContent: {
    padding: 12,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
  },
  // Sort modal
  sortOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sortContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },
  sortHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  sortTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  sortOptionActive: {
    backgroundColor: colors.primary[50],
  },
  sortOptionText: {
    fontSize: 15,
    color: colors.text.primary,
  },
  sortOptionTextActive: {
    color: colors.primary[600],
    fontWeight: '600',
  },
});
