import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { passengerService, type Passenger } from '@/services/passengerService';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';

export const PassengersScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isAuthenticated, logout } = useAuthStore();
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadPassengers();
    } else {
      setIsLoading(false);
      setError('Yolcuları görüntülemek için giriş yapmanız gerekiyor');
    }
  }, [isAuthenticated]);

  const loadPassengers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await passengerService.getPassengers();
      setPassengers(data);
    } catch (err: any) {
      console.error('Yolcu yükleme hatası:', err);
      
      // 401 hatası alındığında (Session expired) kullanıcıyı logout yap
      if (err?.status === 401 || err?.code === 'SESSION_EXPIRED') {
        await logout();
        Alert.alert(
          'Oturum Süresi Doldu',
          'Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.',
          [
            {
              text: 'Tamam',
              onPress: () => {
                // Navigation will be handled by auth state change
              },
            },
          ]
        );
        return;
      }
      
      // Daha detaylı hata mesajı
      let errorMessage = 'Yolcular yüklenemedi';
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      setError(errorMessage);
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

  const formatDate = (day: string, month: string, year: string): string => {
    if (!day || !month || !year) return '-';
    
    const monthNames = [
      'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
      'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'
    ];
    
    const monthIndex = parseInt(month) - 1;
    const monthAbbr = monthNames[monthIndex] || month;
    const formattedDay = day.padStart(2, '0');
    
    return `${formattedDay} ${monthAbbr} ${year}`;
  };

  // Hesap sahibini önce, diğerlerini sonra sırala
  const sortedPassengers = React.useMemo(() => {
    const owner = passengers.find(p => p.isAccountOwner);
    const others = passengers.filter(p => !p.isAccountOwner);
    return owner ? [owner, ...others] : others;
  }, [passengers]);

  const renderPassenger = ({ item }: { item: Passenger }) => {
    return (
      <Card style={styles.passengerCard}>
        <View style={styles.passengerContent}>
          {/* Avatar ve Bilgiler */}
          <View style={styles.passengerMain}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={colors.primary[600]} />
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
              <Text style={styles.detailText}>
                TC: {item.identityNumber || '-'}
              </Text>
              <Text style={styles.detailText}>
                Doğum: {formatDate(item.birthDay, item.birthMonth, item.birthYear)}
              </Text>
            </View>
          </View>

          {/* Mil Kart Göstergesi ve Aksiyonlar */}
          <View style={styles.passengerActions}>
            {item.hasMilCard && (
              <View style={styles.milCardIndicator}>
                <View style={styles.milCardDot} />
              </View>
            )}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEdit(item)}
              >
                <Ionicons name="create-outline" size={18} color={colors.primary[600]} />
              </TouchableOpacity>
              {!item.isAccountOwner && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Card>
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.title}>Giriş Yapın</Text>
          <Text style={styles.message}>
            Yolcuları görüntülemek için giriş yapmanız gerekiyor
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading && passengers.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (error && passengers.length === 0) {
    return (
      <View style={styles.container}>
        <ErrorDisplay error={error} onRetry={isAuthenticated ? loadPassengers : undefined} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Yolcularım</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAdd}
        >
          <Ionicons name="add" size={20} color={colors.background} />
          <Text style={styles.addButtonText}>Yeni Yolcu</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={sortedPassengers}
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
              style={styles.emptyAddButton}
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
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary[600],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
  listContent: {
    padding: 16,
  },
  passengerCard: {
    marginBottom: 12,
    padding: 16,
  },
  passengerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passengerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
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
    fontWeight: '500',
  },
  detailText: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  passengerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  milCardIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  milCardDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary[600],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.gray[50],
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
  emptyAddButton: {
    minWidth: 200,
  },
});
