import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { priceAlertsService, type PriceAlert } from '@/services/priceAlertsService';
import { formatDate, formatCurrency } from '@/utils/format';
import { colors } from '@/constants/colors';

export const PriceAlertsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await priceAlertsService.getAlerts();
      setAlerts(data);
    } catch (err: any) {
      setError(err.message || 'Fiyat alarmları yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const handleDelete = async (alert: PriceAlert) => {
    Alert.alert(
      'Alarmı Sil',
      'Bu fiyat alarmını silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await priceAlertsService.deleteAlert(alert.id);
              setAlerts(alerts.filter((a) => a.id !== alert.id));
            } catch (err: any) {
              Alert.alert('Hata', err.message || 'Alarm silinemedi');
            }
          },
        },
      ]
    );
  };

  const handleSearch = (alert: PriceAlert) => {
    navigation.navigate('Travel' as never, {
      screen: 'Travel/FlightSearch' as never,
      params: {
        origin: alert.origin,
        destination: alert.destination,
        departureDate: alert.departureDate,
      } as never,
    });
  };

  const renderAlert = ({ item }: { item: PriceAlert }) => {
    return (
      <Card style={styles.alertCard}>
        <View style={styles.alertContent}>
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
            {item.targetPrice && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Hedef Fiyat:</Text>
                <Text style={[styles.detailValue, styles.priceValue]}>
                  {formatCurrency(item.targetPrice, item.currency || 'EUR')}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, item.isActive && styles.statusBadgeActive]}>
              <Text style={[styles.statusText, item.isActive && styles.statusTextActive]}>
                {item.isActive ? 'Aktif' : 'Pasif'}
              </Text>
            </View>
            <Text style={styles.createdText}>
              {formatDate(item.createdAt)}
            </Text>
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

  if (isLoading && alerts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (error && alerts.length === 0) {
    return <ErrorDisplay error={error} onRetry={loadAlerts} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fiyat Alarmlarım</Text>
        <Button
          title="Yeni Alarm"
          onPress={() => {
            navigation.navigate('Travel' as never, {
              screen: 'Travel/FlightSearch' as never,
            });
          }}
          size="small"
        />
      </View>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={renderAlert}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aktif fiyat alarmınız bulunmamaktadır</Text>
            <Text style={styles.emptySubtext}>
              Fiyat alarmı oluşturduğunuzda, belirlediğiniz fiyata ulaşıldığında size bildirim göndereceğiz
            </Text>
            <Button
              title="İlk Alarmı Oluştur"
              onPress={() => {
                navigation.navigate('Travel' as never, {
                  screen: 'Travel/FlightSearch' as never,
                });
              }}
              style={styles.addButton}
            />
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
  listContent: {
    padding: 16,
  },
  alertCard: {
    marginBottom: 16,
  },
  alertContent: {
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
  priceValue: {
    color: colors.warning,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.gray[200],
  },
  statusBadgeActive: {
    backgroundColor: colors.success + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  statusTextActive: {
    color: colors.success,
  },
  createdText: {
    fontSize: 12,
    color: colors.text.secondary,
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
    marginBottom: 24,
  },
  addButton: {
    minWidth: 200,
  },
});
