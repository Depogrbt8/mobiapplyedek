import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { favoritesService, type FavoriteSearch } from '@/services/favoritesService';
import { formatDate } from '@/utils/format';
import { colors } from '@/constants/colors';

export const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState<FavoriteSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await favoritesService.getFavorites();
      setFavorites(data);
    } catch (err: any) {
      setError(err.message || 'Favoriler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleDelete = async (favorite: FavoriteSearch) => {
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
              setFavorites(favorites.filter((f) => f.id !== favorite.id));
            } catch (err: any) {
              Alert.alert('Hata', err.message || 'Favori silinemedi');
            }
          },
        },
      ]
    );
  };

  const handleSearch = (favorite: FavoriteSearch) => {
    // Navigate to flight search with favorite params
    navigation.navigate('Travel' as never, {
      screen: 'Travel/FlightSearch' as never,
      params: {
        origin: favorite.origin,
        destination: favorite.destination,
        departureDate: favorite.departureDate,
      } as never,
    });
  };

  const renderFavorite = ({ item }: { item: FavoriteSearch }) => {
    return (
      <Card style={styles.favoriteCard}>
        <View style={styles.favoriteContent}>
          <View style={styles.routeInfo}>
            <View style={styles.routeItem}>
              <Text style={styles.routeLabel}>Nereden</Text>
              <Text style={styles.routeValue}>{item.origin}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
            <View style={styles.routeItem}>
              <Text style={styles.routeLabel}>Nereye</Text>
              <Text style={styles.routeValue}>{item.destination}</Text>
            </View>
          </View>
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Tarih:</Text>
            <Text style={styles.dateValue}>{formatDate(item.departureDate)}</Text>
          </View>
          <View style={styles.actions}>
            <Button
              title="Uçuşları Gör"
              onPress={() => handleSearch(item)}
              size="small"
              variant="outline"
            />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item)}
            >
              <Text style={styles.deleteButtonText}>Sil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  if (isLoading && favorites.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (error && favorites.length === 0) {
    return <ErrorDisplay error={error} onRetry={loadFavorites} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorilerim</Text>
      </View>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderFavorite}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz favori aramanız bulunmamaktadır</Text>
            <Text style={styles.emptySubtext}>
              Sık uçtuğunuz rotaları favorilerinize ekleyerek daha hızlı bilet alabilirsiniz
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  listContent: {
    padding: 16,
  },
  favoriteCard: {
    marginBottom: 16,
  },
  favoriteContent: {
    gap: 12,
  },
  routeInfo: {
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  arrow: {
    fontSize: 20,
    color: colors.text.secondary,
    marginHorizontal: 12,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.error + '20',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
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
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
