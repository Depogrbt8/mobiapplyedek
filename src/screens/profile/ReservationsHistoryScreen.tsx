import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { reservationService } from '@/modules/travel/services/reservationService';
import { formatDate, formatCurrency, formatTime } from '@/utils/format';
import { colors } from '@/constants/colors';
import type { FlightReservation } from '@/types/travel';

export const ReservationsHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [reservations, setReservations] = useState<FlightReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reservationService.getReservations('flight');
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

  const renderReservation = ({ item }: { item: FlightReservation }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          // Navigate to reservation details
        }}
      >
        <Card style={styles.reservationCard}>
          <View style={styles.reservationHeader}>
            <View>
              <Text style={styles.pnr}>{item.pnr}</Text>
              <Text style={styles.route}>
                {item.from} → {item.to}
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
                  {item.status === 'confirmed' ? 'Onaylandı' : item.status}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.reservationDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tarih:</Text>
              <Text style={styles.detailValue}>{formatDate(item.date)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Saat:</Text>
              <Text style={styles.detailValue}>{item.time}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Havayolu:</Text>
              <Text style={styles.detailValue}>{item.airline}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tutar:</Text>
              <Text style={styles.detailValue}>{item.price}</Text>
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
              Henüz rezervasyonunuz bulunmamaktadır
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

