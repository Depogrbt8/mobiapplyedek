import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { colors } from '@/constants/colors';
import type { ProfileStackParamList } from '@/core/navigation/types';

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList>;

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
}

// Ana sitedeki menü sırasına göre
const menuItems: MenuItem[] = [
  { icon: 'person-outline', label: 'Hesap Bilgileri', route: 'AccountInfo' },
  { icon: 'airplane-outline', label: 'Seyahatlerim', route: 'MyTrips' },
  { icon: 'people-outline', label: 'Yolcularım', route: 'Passengers' },
  { icon: 'receipt-outline', label: 'Fatura Bilgilerim', route: 'BillingInfo' },
  { icon: 'search-outline', label: 'Aramalarım', route: 'SearchHistory' },
  { icon: 'notifications-outline', label: 'Fiyat Alarmlarım', route: 'PriceAlerts' },
  { icon: 'heart-outline', label: 'Favorilerim', route: 'Favorites' },
];

const secondaryMenuItems: MenuItem[] = [
  { icon: 'settings-outline', label: 'Ayarlar', route: 'Settings' },
  { icon: 'help-circle-outline', label: 'Yardım & Destek', route: 'Help' },
  { icon: 'information-circle-outline', label: 'Hakkımızda', route: 'About' },
];

export const ProfileScreen: React.FC = () => {
  // Profile stack navigation
  const navigation = useNavigation<ProfileNav>();
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  // Eğer kullanıcı giriş yapmamışsa, mevcut LoginScreen'i göster
  if (!isAuthenticated || !user) {
    return <LoginScreen />;
  }

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.route}
      style={styles.menuItem}
      onPress={() => {
        // Profile stack içinde ilgili ekrana git
        navigation.navigate(item.route as keyof ProfileStackParamList);
      }}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={item.icon} size={22} color={colors.primary[600]} />
        <Text style={styles.menuItemText}>{item.label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Kullanıcı Bilgileri */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]?.toUpperCase() || ''}
              {user?.lastName?.[0]?.toUpperCase() || ''}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>
              Merhaba, {user?.firstName?.toLowerCase() || 'Kullanıcı'}!
            </Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
        </View>
      </Card>

      {/* Ana Menü */}
      <View style={styles.menuSection}>
        {menuItems.map(renderMenuItem)}
      </View>

      {/* İkincil Menü */}
      <View style={styles.menuSection}>
        {secondaryMenuItems.map(renderMenuItem)}
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
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
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
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  menuSection: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  logoutButton: {
    marginTop: 8,
  },
});
