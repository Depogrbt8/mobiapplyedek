import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { passengerService, type Passenger } from '@/services/passengerService';
import { formatDate } from '@/utils/format';
import { colors } from '@/constants/colors';

export const PassengersScreen: React.FC = () => {
  const navigation = useNavigation();
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPassengers();
  }, []);

  const loadPassengers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await passengerService.getPassengers();
      setPassengers(data);
    } catch (err: any) {
      setError(err.message || 'Yolcular yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPassengers();
    setRefreshing(false);
  };

  const handleDelete = async (passenger: Passenger) => {
    if (passenger.isAccountOwner) {
      Alert.alert('Hata', 'Hesap sahibi silinemez');
      return;
    }

    Alert.alert(
      'Yolcuyu Sil',
      `${passenger.firstName} ${passenger.lastName} adlı yolcuyu silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await passengerService.deletePassenger(passenger.id);
              setPassengers(passengers.filter((p) => p.id !== passenger.id));
            } catch (err: any) {
              Alert.alert('Hata', err.message || 'Yolcu silinemedi');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (passenger: Passenger) => {
    navigation.navigate('AddEditPassenger' as never, {
      passengerId: passenger.id,
    } as never);
  };

  const handleAdd = () => {
    navigation.navigate('AddEditPassenger' as never, {} as never);
  };

  const formatBirthDate = (day: string, month: string, year: string): string => {
    if (!day || !month || !year) return '-';
    try {
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return formatDate(date.toISOString());
    } catch {
      return `${day}/${month}/${year}`;
    }
  };

  const renderPassenger = ({ item }: { item: Passenger }) => {
    return (
      <Card style={styles.passengerCard}>
        <View style={styles.passengerHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.firstName[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.passengerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>
                {item.firstName} {item.lastName}
              </Text>
              {item.isAccountOwner && (
                <View style={styles.ownerBadge}>
                  <Text style={styles.ownerText}>Hesap Sahibi</Text>
                </View>
              )}
            </View>
            <Text style={styles.identity}>
              TC: {item.identityNumber || '-'}
            </Text>
            <Text style={styles.birthDate}>
              Doğum: {formatBirthDate(item.birthDay, item.birthMonth, item.birthYear)}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit(item)}
            >
              <Text style={styles.editButtonText}>Düzenle</Text>
            </TouchableOpacity>
            {!item.isAccountOwner && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item)}
              >
                <Text style={styles.deleteButtonText}>Sil</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Card>
    );
  };

  if (isLoading && passengers.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (error && passengers.length === 0) {
    return <ErrorDisplay error={error} onRetry={loadPassengers} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Yolcularım</Text>
        <Button
          title="Yeni Yolcu"
          onPress={handleAdd}
          size="small"
        />
      </View>
      <FlatList
        data={passengers}
        keyExtractor={(item) => item.id}
        renderItem={renderPassenger}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz yolcu eklenmemiş</Text>
            <Button
              title="İlk Yolcuyu Ekle"
              onPress={handleAdd}
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
  passengerCard: {
    marginBottom: 16,
  },
  passengerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.background,
  },
  passengerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  ownerBadge: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ownerText: {
    fontSize: 10,
    color: colors.text.secondary,
  },
  identity: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  birthDate: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.primary[50],
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary[600],
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.error + '20',
  },
  deleteButtonText: {
    fontSize: 12,
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
    marginBottom: 24,
  },
  addButton: {
    minWidth: 200,
  },
});

