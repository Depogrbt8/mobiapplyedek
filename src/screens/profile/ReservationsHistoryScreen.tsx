import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { TabSelector, type TabType } from '@/components/common/TabSelector';
import { reservationService } from '@/modules/travel/services/reservationService';
import { formatDate, formatCurrency, formatTime } from '@/utils/format';
import { colors } from '@/constants/colors';
import type { FlightReservation } from '@/types/travel';

export const ReservationsHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('flight');
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReservations();
  }, [activeTab]);

  const loadReservations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const type = activeTab === 'flight' ? 'flight' : activeTab === 'hotel' ? 'hotel' : 'car';
      const data = await reservationService.getReservations(type);
      setReservations(data);
    } catch (err: any) {
      setError(err.message || 'Rezervasyonlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReservations();
    setRefreshing(false);
  };

  const renderReservation = ({ item }: { item: any }) => {
    // Uçak rezervasyonu
    if (activeTab === 'flight') {
      return (
        <TouchableOpacity
          onPress={() => {
            // Navigate to reservation details
          }}
        >
          <Card style={styles.reservationCard}>
            <View style={styles.reservationHeader}>
              <View>
                <Text style={styles.pnr}>{item.pnr || item.id}</Text>
                <Text style={styles.route}>
                  {item.origin || item.from} → {item.destination || item.to}
                </Text>
              </View>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'confirmed' && styles.statusBadgeSuccess,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      item.status === 'confirmed' && styles.statusTextSuccess,
                    ]}
                  >
                    {item.status === 'confirmed' ? 'Onaylandı' : item.status || 'Beklemede'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.reservationDetails}>
              {item.departureTime && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tarih:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(new Date(item.departureTime))}
                  </Text>
                </View>
              )}
              {item.departureTime && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Saat:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(item.departureTime).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              )}
              {item.airline && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Havayolu:</Text>
                  <Text style={styles.detailValue}>{item.airline}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tutar:</Text>
                <Text style={styles.detailValue}>
                  {item.amount} {item.currency || 'EUR'}
                </Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      );
    }

    // Otel rezervasyonu
    if (activeTab === 'hotel') {
      return (
        <TouchableOpacity
          onPress={() => {
            // Navigate to reservation details
          }}
        >
          <Card style={styles.reservationCard}>
            <View style={styles.reservationHeader}>
              <View>
                <Text style={styles.pnr}>{item.reservationNo || item.id}</Text>
                <Text style={styles.route}>
                  {item.hotelName || 'Otel Rezervasyonu'}
                </Text>
              </View>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'confirmed' && styles.statusBadgeSuccess,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      item.status === 'confirmed' && styles.statusTextSuccess,
                    ]}
                  >
                    {item.status === 'confirmed' ? 'Onaylandı' : item.status || 'Beklemede'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.reservationDetails}>
              {item.checkIn && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Giriş:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(new Date(item.checkIn))}
                  </Text>
                </View>
              )}
              {item.checkOut && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Çıkış:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(new Date(item.checkOut))}
                  </Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tutar:</Text>
                <Text style={styles.detailValue}>
                  {item.amount} {item.currency || 'EUR'}
                </Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      );
    }

    // Araç rezervasyonu
    return (
      <TouchableOpacity
        onPress={() => {
          // Navigate to reservation details
        }}
      >
        <Card style={styles.reservationCard}>
          <View style={styles.reservationHeader}>
            <View>
              <Text style={styles.pnr}>{item.reservationNo || item.id}</Text>
              <Text style={styles.route}>
                {item.carName || 'Araç Rezervasyonu'}
              </Text>
            </View>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  item.status === 'confirmed' && styles.statusBadgeSuccess,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.status === 'confirmed' && styles.statusTextSuccess,
                  ]}
                >
                  {item.status === 'confirmed' ? 'Onaylandı' : item.status || 'Beklemede'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.reservationDetails}>
            {item.pickupDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Alış:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(new Date(item.pickupDate))}
                </Text>
              </View>
            )}
            {item.dropoffDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Teslim:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(new Date(item.dropoffDate))}
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tutar:</Text>
              <Text style={styles.detailValue}>
                {item.amount} {item.currency || 'EUR'}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (isLoading && reservations.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (error && reservations.length === 0) {
    return <ErrorDisplay error={error} onRetry={loadReservations} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id}
        renderItem={renderReservation}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Rezervasyon bulunamadı</Text>
            <Text style={styles.emptySubtext}>
              Henüz {activeTab === 'flight' ? 'uçak' : activeTab === 'hotel' ? 'otel' : 'araç'} rezervasyonunuz bulunmamaktadır
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
  tabContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
    fontSize: 16,
    color: colors.text.secondary,
  },
  reservationCard: {
    marginBottom: 16,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  pnr: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  route: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.gray[200],
  },
  statusBadgeSuccess: {
    backgroundColor: colors.success + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  statusTextSuccess: {
    color: colors.success,
  },
  reservationDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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


