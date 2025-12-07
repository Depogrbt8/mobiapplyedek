import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </Card>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            // Navigate to reservations history
            navigation.navigate('ReservationsHistory' as never);
          }}
        >
          <Text style={styles.menuItemText}>Rezervasyonlarım</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            // Navigate to settings
            navigation.navigate('Settings' as never);
          }}
        >
          <Text style={styles.menuItemText}>Ayarlar</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate('Help' as never);
          }}
        >
          <Text style={styles.menuItemText}>Yardım & Destek</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate('About' as never);
          }}
        >
          <Text style={styles.menuItemText}>Hakkımızda</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate('Passengers' as never);
          }}
        >
          <Text style={styles.menuItemText}>Yolcularım</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate('PNRQuery' as never);
          }}
        >
          <Text style={styles.menuItemText}>PNR Sorgula</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate('CheckIn' as never);
          }}
        >
          <Text style={styles.menuItemText}>Online Check-in</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate('CancelTicket' as never);
          }}
        >
          <Text style={styles.menuItemText}>Bilet İptal</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate('Favorites' as never);
          }}
        >
          <Text style={styles.menuItemText}>Favorilerim</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate('SearchHistory' as never);
          }}
        >
          <Text style={styles.menuItemText}>Aramalarım</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate('PriceAlerts' as never);
          }}
        >
          <Text style={styles.menuItemText}>Fiyat Alarmlarım</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate('BillingInfo' as never);
          }}
        >
          <Text style={styles.menuItemText}>Fatura Bilgilerim</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Çıkış Yap"
        onPress={handleLogout}
        variant="outline"
        fullWidth
        style={styles.logoutButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  profileCard: {
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.background,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  menu: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  menuItemArrow: {
    fontSize: 20,
    color: colors.text.secondary,
  },
  logoutButton: {
    marginTop: 8,
  },
});

