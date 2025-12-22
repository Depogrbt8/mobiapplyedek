import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { useHomeStore } from '@/store/homeStore';
import { useAuthStore } from '@/store/authStore';

interface Service {
  id: string;
  name: string;
  icon: string;
  serviceType: 'home' | 'flight' | 'hotel' | 'car' | 'esim';
}

const services: Service[] = [
  { id: 'home', name: 'ANA SAYFA', icon: 'home', serviceType: 'home' },
  { id: 'flight', name: 'UÇAK', icon: 'airplane', serviceType: 'flight' },
  { id: 'hotel', name: 'OTEL', icon: 'business', serviceType: 'hotel' },
  { id: 'car', name: 'ARAÇ', icon: 'car', serviceType: 'car' },
  { id: 'esim', name: 'E SIM', icon: 'wifi', serviceType: 'esim' },
];

const ICON_SIZE = 64;
const ICON_IN_GREEN = ICON_SIZE * 0.7; // %70'i yeşil alanda

export const GlobalHeader: React.FC = () => {
  const homeStore = useHomeStore();
  const setSelectedService = homeStore?.setSelectedService;
  const selectedService = homeStore?.selectedService || 'home';
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  
  // Kullanıcı adını al - email'den çek
  const getUserDisplayName = () => {
    // Önce firstName kontrol et
    if (user?.firstName) {
      return user.firstName;
    }
    
    // Email'den isim çıkar (örn: armagan@hotmail.com -> armagan)
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      // İlk harfi büyük yap, geri kalanı küçük
      return emailName.charAt(0).toUpperCase() + emailName.slice(1).toLowerCase();
    }
    
    // Test için geçici olarak sabit değer göster
    return 'armagan';
  };
  
  const displayName = getUserDisplayName();
  const welcomeText = `Hoşgeldin ${displayName} !`;
  
  // Debug: user bilgisini kontrol et
  console.log('GlobalHeader - user:', user);
  console.log('GlobalHeader - displayName:', displayName);
  console.log('GlobalHeader - welcomeText:', welcomeText);

  const handleServicePress = (service: Service) => {
    if (setSelectedService && service?.serviceType) {
      setSelectedService(service.serviceType);
    }
  };

  if (!Array.isArray(services) || services.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Yeşil Header - Logo */}
      <LinearGradient
        colors={[colors.primary[400], colors.primary[500], colors.primary[600]]}
        locations={[0, 0.3, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top }]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            <Text style={styles.logoWhite}>gurbet</Text>
            <Text style={styles.logoBlack}>biz</Text>
          </Text>
          {/* Hoşgeldin yazısı */}
          <Text style={styles.welcomeText}>{welcomeText}</Text>
        </View>
      </LinearGradient>

      {/* İkonlar ve İsimler - %70 yeşil alanda, %30 + isimler beyaz alanda */}
      <View style={[styles.servicesWrapper, { marginTop: -ICON_IN_GREEN }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.servicesContainer}
          bounces={false}
        >
          {services.map((service) => {
            if (!service || !service.id) return null;
            const isActive = selectedService === service.serviceType;
            return (
              <TouchableOpacity
                key={service.id}
                style={[styles.serviceButton, isActive && styles.serviceButtonActive]}
                onPress={() => handleServicePress(service)}
                activeOpacity={0.7}
              >
                <View style={styles.serviceIconContainer}>
                  <Ionicons name={service.icon as any} size={28} color={colors.text.inverse} />
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingBottom: ICON_IN_GREEN, // İkonların %70'i yeşil alanda
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  logoWhite: {
    color: colors.text.inverse,
  },
  logoBlack: {
    color: colors.text.primary,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // Açıkça beyaz renk
    marginTop: 8,
    textAlign: 'center',
    opacity: 1,
  },
  servicesWrapper: {
    backgroundColor: 'transparent',
  },
  servicesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  serviceButton: {
    alignItems: 'center',
  },
  serviceButtonActive: {
    opacity: 0.8,
  },
  serviceIconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    borderWidth: 3,
    borderColor: colors.text.inverse,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    // Shadow for Android
    elevation: 6,
  },
  serviceName: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary[600],
    textAlign: 'center',
    marginTop: 6,
  },
});
