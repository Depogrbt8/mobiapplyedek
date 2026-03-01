import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Text, 
  ActivityIndicator, 
  RefreshControl, 
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { HotelCard } from '../components/HotelCard';
import { HotelFilters } from '../components/HotelFilters';
import { HotelSearchScreen } from './HotelSearchScreen';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { useHotelState } from '../hooks/useHotelState';
import { useHotelFilters } from '../hooks/useHotelFilters';
import type { Hotel, HotelSearchParams, HotelFilters as HotelFiltersType } from '../types/hotel';
import type { TravelStackParamList } from '@/core/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';

type RouteProp = RouteProp<TravelStackParamList, 'Travel/HotelResults'>;
type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/HotelResults'>;

// Sıralama seçenekleri
const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popülerlik' },
  { value: 'price_asc', label: 'Fiyat (Düşükten Yükseğe)' },
  { value: 'price_desc', label: 'Fiyat (Yüksekten Düşüğe)' },
  { value: 'rating', label: 'Puan' },
  { value: 'distance', label: 'Merkeze Uzaklık' },
] as const;

export const HotelResultsScreen: React.FC = () => {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { searchParams: routeSearchParams } = route.params;

  const [showFilters, setShowFilters] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  
  const { hotels, totalCount, loading, error, availableFilters, search } = useHotelState();
  const { filters, setFilters, applyFilters, activeFilterCount } = useHotelFilters();
  const logout = useAuthStore((s) => s.logout);

  // İlk arama ve route params değiştiğinde
  useEffect(() => {
    const hotelSearchParams: HotelSearchParams = {
      location: routeSearchParams.location,
      checkIn: routeSearchParams.checkIn,
      checkOut: routeSearchParams.checkOut,
      guests: routeSearchParams.guests || {
        adults: typeof routeSearchParams.guests === 'number' ? routeSearchParams.guests : 2,
        children: routeSearchParams.children || 0,
        rooms: routeSearchParams.rooms || 1,
      },
      filters: filters,
    };
    
    search(hotelSearchParams);
  }, [routeSearchParams.location, routeSearchParams.checkIn, routeSearchParams.checkOut]);

  // Filtre değiştiğinde arama yap
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      const hotelSearchParams: HotelSearchParams = {
        location: routeSearchParams.location,
        checkIn: routeSearchParams.checkIn,
        checkOut: routeSearchParams.checkOut,
        guests: routeSearchParams.guests || {
          adults: typeof routeSearchParams.guests === 'number' ? routeSearchParams.guests : 2,
          children: routeSearchParams.children || 0,
          rooms: routeSearchParams.rooms || 1,
        },
        filters: filters,
      };
      search(hotelSearchParams);
    }
  }, [filters]);

  const handleRefresh = async () => {
    const hotelSearchParams: HotelSearchParams = {
      location: routeSearchParams.location,
      checkIn: routeSearchParams.checkIn,
      checkOut: routeSearchParams.checkOut,
      guests: routeSearchParams.guests || {
        adults: typeof routeSearchParams.guests === 'number' ? routeSearchParams.guests : 2,
        children: routeSearchParams.children || 0,
        rooms: routeSearchParams.rooms || 1,
      },
      filters: filters,
    };
    await search(hotelSearchParams);
  };

  const handleHotelPress = (hotel: Hotel) => {
    const hotelSearchParams: HotelSearchParams = {
      location: routeSearchParams.location,
      checkIn: routeSearchParams.checkIn,
      checkOut: routeSearchParams.checkOut,
      guests: routeSearchParams.guests || {
        adults: typeof routeSearchParams.guests === 'number' ? routeSearchParams.guests : 2,
        children: routeSearchParams.children || 0,
        rooms: routeSearchParams.rooms || 1,
      },
    };
    
    navigation.navigate('Travel/HotelDetails', {
      hotelId: hotel.id,
      searchParams: hotelSearchParams,
    });
  };

  const handleFiltersChange = (newFilters: HotelFiltersType) => {
    setFilters(newFilters);
  };

  const handleSortChange = (sortBy: HotelFiltersType['sortBy']) => {
    const newFilters = {
      ...filters,
      sortBy,
    };
    setFilters(newFilters);
    setShowSortModal(false);
  };

  // Tarih formatı (örn: 08 Şub Paz)
  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = parseISO(dateStr);
      return format(d, 'dd MMM EEE', { locale: tr });
    } catch {
      return dateStr;
    }
  };

  // Filtrelenmiş ve sıralanmış oteller
  const filteredAndSortedHotels = applyFilters(hotels);

  const hotelSearchParams: HotelSearchParams = {
    location: routeSearchParams.location,
    checkIn: routeSearchParams.checkIn,
    checkOut: routeSearchParams.checkOut,
    guests: routeSearchParams.guests || {
      adults: typeof routeSearchParams.guests === 'number' ? routeSearchParams.guests : 2,
      children: routeSearchParams.children || 0,
      rooms: routeSearchParams.rooms || 1,
    },
  };

  const totalGuests = (hotelSearchParams.guests?.adults || 2) + (hotelSearchParams.guests?.children || 0);

  if (loading && hotels.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Otel aranıyor...</Text>
      </View>
    );
  }

  if (error && hotels.length === 0) {
    return <ErrorDisplay error={error || 'Otel araması başarısız oldu'} onRetry={handleRefresh} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header - Ana sitedeki gibi */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.locationTitle}>
              {routeSearchParams.location}
            </Text>
            <View style={styles.headerInfo}>
              <Text style={styles.dateText}>
                {formatDateShort(routeSearchParams.checkIn)}
              </Text>
              <Text style={styles.dateSeparator}> - </Text>
              <Text style={styles.dateText}>
                {formatDateShort(routeSearchParams.checkOut)}
              </Text>
              <View style={styles.guestsInfo}>
                <Ionicons name="people" size={14} color={colors.text.secondary} />
                <Text style={styles.guestsText}>{totalGuests}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowEditModal(true)}
          >
            <Text style={styles.editButtonText}>Düzenle</Text>
          </TouchableOpacity>
        </View>

        {/* Harita, Filtrele, Sırala butonları */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, showMapView && styles.actionButtonActive]}
            onPress={() => setShowMapView(!showMapView)}
          >
            <Ionicons 
              name="map" 
              size={16} 
              color={showMapView ? colors.primary[600] : colors.text.primary} 
            />
            <Text style={[styles.actionButtonText, showMapView && styles.actionButtonTextActive]}>
              Harita
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, activeFilterCount > 0 && styles.actionButtonActive]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons 
              name="options" 
              size={16} 
              color={activeFilterCount > 0 ? colors.primary[600] : colors.text.primary} 
            />
            <Text style={[styles.actionButtonText, activeFilterCount > 0 && styles.actionButtonTextActive]}>
              Filtrele
            </Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="swap-vertical" size={16} color={colors.text.primary} />
            <Text style={styles.actionButtonText}>Sırala</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Harita görünümü (placeholder) */}
      {showMapView && (
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={48} color={colors.gray[400]} />
          <Text style={styles.mapPlaceholderText}>Harita görünümü yakında eklenecek</Text>
        </View>
      )}

      {/* Otel Listesi */}
      {!showMapView && (
        <FlatList
          data={filteredAndSortedHotels}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HotelCard
              hotel={item}
              checkIn={hotelSearchParams.checkIn}
              checkOut={hotelSearchParams.checkOut}
              guests={hotelSearchParams.guests}
              onPress={() => handleHotelPress(item)}
              onLoginRequired={() => logout()}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={loading} 
              onRefresh={handleRefresh}
              colors={[colors.primary[600]]}
              tintColor={colors.primary[600]}
            />
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
      )}

      {/* Sıralama Modal */}
      <Modal
        visible={showSortModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSortModal(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowSortModal(false)}
          />
          <View style={styles.sortModalContent}>
            <View style={styles.sortModalHeader}>
              <Text style={styles.sortModalTitle}>Sıralama</Text>
              <TouchableOpacity
                onPress={() => setShowSortModal(false)}
                style={styles.sortModalClose}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.sortModalBody}>
              {SORT_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    filters.sortBy === option.value && styles.sortOptionActive
                  ]}
                  onPress={() => handleSortChange(option.value as HotelFiltersType['sortBy'])}
                >
                  <Text style={[
                    styles.sortOptionText,
                    filters.sortBy === option.value && styles.sortOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                  {filters.sortBy === option.value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary[600]} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Düzenle Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowEditModal(false)}
          />
          <View style={styles.editModalContent}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Aramayı Düzenle</Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={styles.editModalClose}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.editModalBody}
              contentContainerStyle={styles.editModalBodyContent}
              keyboardShouldPersistTaps="handled"
            >
              <HotelSearchScreen
                initialLocation={routeSearchParams.location}
                initialCheckIn={routeSearchParams.checkIn}
                initialCheckOut={routeSearchParams.checkOut}
                initialAdults={hotelSearchParams.guests?.adults || 2}
                initialChildren={hotelSearchParams.guests?.children || 0}
                initialRooms={hotelSearchParams.guests?.rooms || 1}
                isModal={true}
                onNavigateToResults={(newSearchParams) => {
                  setShowEditModal(false);
                  // Yeni arama parametreleri ile replace et (ana sitedeki gibi)
                  navigation.replace('Travel/HotelResults', {
                    searchParams: newSearchParams,
                  });
                }}
              />
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Filtre Modal */}
      <HotelFilters
        filters={filters}
        availableFilters={availableFilters || undefined}
        onFiltersChange={handleFiltersChange}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Header - Ana sitedeki gibi
  headerContainer: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingTop: Platform.OS === 'ios' ? 8 : StatusBar.currentHeight || 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  dateSeparator: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  guestsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  guestsText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  editButton: {
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary[600],
    textDecorationLine: 'underline',
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.background,
    position: 'relative',
  },
  actionButtonActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.primary,
  },
  actionButtonTextActive: {
    color: colors.primary[600],
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary[500],
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  // Harita Placeholder
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    padding: 32,
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 12,
  },
  // List
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
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  // Sıralama Modal
  sortModalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  sortModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  sortModalClose: {
    padding: 4,
  },
  sortModalBody: {
    padding: 20,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  sortOptionActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  sortOptionText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  sortOptionTextActive: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  // Düzenle Modal
  editModalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '95%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  editModalClose: {
    padding: 4,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalBody: {
    flex: 1,
  },
  editModalBodyContent: {
    paddingBottom: 20,
  },
});
