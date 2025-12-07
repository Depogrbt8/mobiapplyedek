import React, { useRef } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { homeScreenStyles } from '@/screens/home/styles/homeScreenStyles';
import { useHomeStore } from '@/store/homeStore';

interface Service {
  id: string;
  name: string;
  icon: string;
  serviceType: 'home' | 'flight' | 'hotel' | 'car' | 'esim';
}

const services: Service[] = [
  {
    id: 'home',
    name: 'ANA SAYFA',
    icon: 'home',
    serviceType: 'home',
  },
  {
    id: 'flight',
    name: 'UÇAK',
    icon: 'airplane',
    serviceType: 'flight',
  },
  {
    id: 'hotel',
    name: 'OTEL',
    icon: 'business',
    serviceType: 'hotel',
  },
  {
    id: 'car',
    name: 'ARAÇ',
    icon: 'car',
    serviceType: 'car',
  },
  {
    id: 'esim',
    name: 'E SIM',
    icon: 'wifi',
    serviceType: 'esim',
  },
];

export const GlobalHeader: React.FC = () => {
  const { setSelectedService, selectedService } = useHomeStore();
  const servicesScrollViewRef = useRef<ScrollView>(null);

  const handleServicePress = (service: Service) => {
    setSelectedService(service.serviceType);
  };

  return (
    <View style={{ zIndex: 1000, elevation: 1000 }}>
      {/* Yeşil Header - Logo - Gradient arka plan */}
      <LinearGradient
        colors={[colors.primary[400], colors.primary[500], colors.primary[600]]}
        locations={[0, 0.3, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={homeScreenStyles.headerWrapper}
      >
        <SafeAreaView style={homeScreenStyles.header} edges={['top']}>
          <View style={homeScreenStyles.logoContainer}>
            <Text style={homeScreenStyles.logoText}>
              <Text style={homeScreenStyles.logoWhite}>gurbet</Text>
              <Text style={homeScreenStyles.logoBlack}>biz</Text>
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Servis İkonları - Logo'nun altında, yeşil alanın üstünde, kaydırılabilir */}
      <View
        style={homeScreenStyles.servicesContent}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={(evt, gestureState) => {
          // Sadece yatay hareket varsa true döndür
          return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        }}
      >
        <ScrollView
          ref={servicesScrollViewRef}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={homeScreenStyles.servicesContainer}
          style={homeScreenStyles.servicesScrollView}
          bounces={false}
          alwaysBounceVertical={false}
          alwaysBounceHorizontal={false}
          directionalLockEnabled={true}
          scrollEnabled={true}
          nestedScrollEnabled={false}
          scrollEventThrottle={16}
          decelerationRate="fast"
          pagingEnabled={false}
          snapToInterval={0}
          scrollsToTop={false}
          onScroll={(e) => {
            // Y ekseninde scroll varsa sıfırla
            if (e.nativeEvent.contentOffset.y !== 0) {
              servicesScrollViewRef.current?.scrollTo({ y: 0, animated: false });
            }
          }}
        >
          {services.map((service) => {
            const isActive = selectedService === service.serviceType;
            return (
              <TouchableOpacity
                key={service.id}
                style={[
                  homeScreenStyles.serviceButton,
                  isActive && { opacity: 0.8 }, // Aktif olan biraz farklı görünsün
                ]}
                onPress={() => handleServicePress(service)}
                activeOpacity={0.8}
              >
              <View style={homeScreenStyles.serviceIconWrapper}>
                <LinearGradient
                  colors={[colors.primary[400], colors.primary[500], colors.primary[600]]}
                  locations={[0, 0.3, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={homeScreenStyles.serviceIconContainer}
                >
                  <Ionicons name={service.icon as any} size={28} color={colors.text.inverse} />
                </LinearGradient>
              </View>
              <Text style={homeScreenStyles.serviceName}>{service.name}</Text>
            </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

