import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { favoritesService, type FavoriteSearch } from '@/services/favoritesService';
import { hotelFavoritesService, type HotelFavorite } from '@/services/hotelFavoritesService';
import { formatDate } from '@/utils/format';
import { colors } from '@/constants/colors';

type TabType = 'flights' | 'hotels';

export const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchFavorites, setSearchFavorites] = useState<FavoriteSearch[]>([]);
  const [hotelFavorites, setHotelFavorites] = useState<HotelFavorite[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('flights');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = async () => {
    setError(null);
    try {
      const [searchData, hotelData] = await Promise.all([
        favoritesService.getFavorites(),
        hotelFavoritesService.getFavorites(),
      ]);
      setSearchFavorites(searchData);
      setHotelFavorites(hotelData);
    } catch (err: any) {
      setError(err.message || 'Favoriler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleDeleteSearch = async (favorite: FavoriteSearch) => {
    Alert.alert(
      'Favoriyi Sil',
      'Bu aramayı favorilerinizden silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await favoritesService.deleteFavorite(favorite.id);
              setSearchFavorites((prev) => prev.filter((f) => f.id !== favorite.id));
            } catch (err: any) {
              Alert.alert('Hata', err.message || 'Favori silinemedi');
            }
          },
        },
      ]
    );
  };

  const handleDeleteHotel = async (favorite: HotelFavorite) => {
    Alert.alert(
      'Favoriyi Sil',
      'Bu oteli favorilerinizden silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await hotelFavoritesService.removeFavorite(favorite.hotelId);
              setHotelFavorites((prev) => prev.filter((f) => f.hotelId !== favorite.hotelId));
            } catch (err: any) {
              Alert.alert('Hata', err.message || 'Favori silinemedi');
            }
          },
        },
      ]
    );
  };

  const handleSearchFlight = (favorite: FavoriteSearch) => {
    navigation.navigate('Home' as never, {
      service: 'flight',
      searchParams: {
        origin: favorite.origin,
        destination: favorite.destination,
        departureDate: favorite.departureDate,
      },
    } as never);
  };

  const getDefaultSearchParams = () => {
    const checkIn = new Date();
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 2);
    return {
      location: 'İstanbul',
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      guests: { adults: 2, children: 0, rooms: 1 },
    };
  };

  const handleOpenHotel = (favorite: HotelFavorite) => {
    navigation.navigate('Travel/HotelDetails' as never, {
      hotelId: favorite.hotelId,
      searchParams: getDefaultSearchParams(),
    } as never);
  };

  const renderFlightFavorite = ({ item }: { item: FavoriteSearch }) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.routeRow}>
          <View style={styles.routeItem}>
            <Text style={styles.routeLabel}>Nereden</Text>
            <Text style={styles.routeValue}>{item.origin}</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={colors.gray[400]} />
          <View style={styles.routeItem}>
            <Text style={styles.routeLabel}>Nereye</Text>
            <Text style={styles.routeValue}>{item.destination}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.gray[400]} />
          <Text style={styles.metaText}>{formatDate(item.departureDate)}</Text>
        </View>
        {item.createdAt && (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Eklenme: </Text>
            <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
          </View>
        )}
        <View style={styles.actions}>
          <Button
            title="Uçuşları Gör"
            onPress={() => handleSearchFlight(item)}
            size="small"
            variant="outline"
          />
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteSearch(item)}
          >
            <Ionicons name="trash-outline" size={22} color={colors.error || '#ef4444'} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderHotelFavorite = ({ item }: { item: HotelFavorite }) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.hotelRow}>
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelName} numberOfLines={2}>
              {item.hotelName || `Otel ${item.hotelId}`}
            </Text>
            {item.hotelLocation && (
              <Text style={styles.hotelLocation} numberOfLines={1}>
                {item.hotelLocation}
              </Text>
            )}
            {item.createdAt && (
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={colors.gray[400]} />
                <Text style={styles.metaTextSmall}>{formatDate(item.createdAt)}</Text>
              </View>
            )}
          </View>
          <View style={styles.actions}>
            <Button
              title="Oteli Gör"
              onPress={() => handleOpenHotel(item)}
              size="small"
              variant="outline"
            />
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDeleteHotel(item)}
            >
              <Ionicons name="trash-outline" size={22} color={colors.error || '#ef4444'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );

  if (isLoading && searchFavorites.length === 0 && hotelFavorites.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (error && searchFavorites.length === 0 && hotelFavorites.length === 0) {
    return <ErrorDisplay error={error} onRetry={loadFavorites} />;
  }

  const descriptionText =
    activeTab === 'flights'
      ? 'Favori uçuş aramalarınızı buradan kolayca tekrar yapabilir, fiyatları kontrol edebilirsiniz. Sık uçtuğunuz rotaları favorilerinize ekleyerek daha hızlı bilet alabilirsiniz.'
      : 'Favori otellerinizi buradan görüntüleyebilir ve kolayca tekrar rezervasyon yapabilirsiniz.';

  const ListFooter = () => (
    <View style={styles.footerInfo}>
      <Text style={styles.footerInfoText}>{descriptionText}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="heart" size={24} color={colors.primary[500]} />
          <Text style={styles.title}>Favorilerim</Text>
        </View>

        {/* Tab bar - ana site ile aynı */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'flights' && styles.tabActive]}
            onPress={() => setActiveTab('flights')}
          >
            <Ionicons
              name="airplane-outline"
              size={18}
              color={activeTab === 'flights' ? colors.primary[600] : colors.gray[500]}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'flights' && styles.tabTextActive,
              ]}
            >
              Uçuş Aramaları ({searchFavorites.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'hotels' && styles.tabActive]}
            onPress={() => setActiveTab('hotels')}
          >
            <Ionicons
              name="business-outline"
              size={18}
              color={activeTab === 'hotels' ? colors.primary[600] : colors.gray[500]}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'hotels' && styles.tabTextActive,
              ]}
            >
              Oteller ({hotelFavorites.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={loadFavorites}>
            <Text style={styles.retryText}>Tekrar dene</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'flights' && (
        <FlatList
          data={searchFavorites}
          keyExtractor={(item) => item.id}
          renderItem={renderFlightFavorite}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary[600]]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz favori uçuş aramanız bulunmamaktadır.</Text>
            </View>
          }
          ListFooterComponent={ListFooter}
        />
      )}

      {activeTab === 'hotels' && (
        <FlatList
          data={hotelFavorites}
          keyExtractor={(item) => item.id}
          renderItem={renderHotelFavorite}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary[600]]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz favori oteliniz bulunmamaktadır.</Text>
            </View>
          }
          ListFooterComponent={ListFooter}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.background,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: colors.gray[200],
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: -2,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary[500],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[500],
  },
  tabTextActive: {
    color: colors.primary[600],
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.error + '15',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  errorBannerText: {
    fontSize: 14,
    color: colors.error || '#ef4444',
    flex: 1,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 12,
  },
  cardContent: {
    gap: 10,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeItem: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  routeValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  metaText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  metaTextSmall: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  deleteBtn: {
    padding: 8,
  },
  hotelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  hotelLocation: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  footerInfo: {
    padding: 16,
    paddingBottom: 32,
    marginTop: 16,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  footerInfoText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
  },
});
