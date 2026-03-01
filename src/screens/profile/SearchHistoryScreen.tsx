import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { searchHistoryService, type SearchHistory } from '@/services/searchHistoryService';
import { formatDate } from '@/utils/format';
import { colors } from '@/constants/colors';

export const SearchHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchHistoryService.getSearchHistory();
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Arama geçmişi yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleClear = () => {
    Alert.alert(
      'Geçmişi Temizle',
      'Tüm arama geçmişini silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: async () => {
            try {
              await searchHistoryService.clearHistory();
              setHistory([]);
            } catch (err: any) {
              Alert.alert('Hata', err.message || 'Geçmiş temizlenemedi');
            }
          },
        },
      ]
    );
  };

  const handleSearch = (search: SearchHistory) => {
    navigation.navigate('Home' as never, {
      service: 'flight',
      searchParams: {
        origin: search.origin,
        destination: search.destination,
        departureDate: search.departureDate,
        returnDate: search.returnDate,
        passengers: search.passengers,
        tripType: search.tripType,
      },
    } as never);
  };

  const renderHistoryItem = ({ item }: { item: SearchHistory }) => {
    return (
      <Card style={styles.historyCard}>
        <View style={styles.historyContent}>
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
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tarih:</Text>
              <Text style={styles.detailValue}>{formatDate(item.departureDate)}</Text>
            </View>
            {item.returnDate && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Dönüş:</Text>
                <Text style={styles.detailValue}>{formatDate(item.returnDate)}</Text>
              </View>
            )}
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Yolcu:</Text>
              <Text style={styles.detailValue}>{item.passengers}</Text>
            </View>
          </View>
          <View style={styles.footer}>
            <Text style={styles.dateText}>
              {formatDate(item.createdAt)}
            </Text>
            <Button
              title="Tekrar Ara"
              onPress={() => handleSearch(item)}
              size="small"
            />
          </View>
        </View>
      </Card>
    );
  };

  if (isLoading && history.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (error && history.length === 0) {
    return <ErrorDisplay error={error} onRetry={loadHistory} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Aramalarım</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearButton}>Temizle</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz bir arama yapmadınız</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  listContent: {
    padding: 16,
  },
  historyCard: {
    marginBottom: 16,
  },
  historyContent: {
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
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  dateText: {
    fontSize: 12,
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
    textAlign: 'center',
  },
});
