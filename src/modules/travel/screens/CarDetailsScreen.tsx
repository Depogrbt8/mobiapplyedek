// Araç Detay Ekranı - Desktop (grbt8) birebir React Native
// Galeri, özellikler, sigorta seçenekleri, ekstra hizmetler, fiyat özeti, politikalar

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCarDetails } from '../hooks/useCarDetails';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { SimpleCarSearchParams, InsuranceOption, ExtraService } from '../types/car';
import {
  CAR_CATEGORY_LABELS,
  TRANSMISSION_LABELS,
  FUEL_TYPE_LABELS,
  MILEAGE_TYPE_LABELS,
  CANCELLATION_TYPE_LABELS,
} from '../types/car';
import { formatCarPrice, formatCarDateTime, calculateDays } from '../utils/carHelpers';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';

type CarDetailsRouteProp = RouteProp<TravelStackParamList, 'Travel/CarDetails'>;
type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/CarDetails'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const CarDetailsScreen: React.FC = () => {
  const route = useRoute<CarDetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { carId, searchToken, searchParams } = route.params as {
    carId: string;
    searchToken: string;
    searchParams: SimpleCarSearchParams;
  };

  const { car, loading, error } = useCarDetails(carId, searchToken);
  const [selectedInsurance, setSelectedInsurance] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const days = calculateDays(searchParams.pickupDate, searchParams.dropoffDate);

  const toggleExtra = (serviceId: string) => {
    setSelectedExtras((prev) => {
      const current = prev[serviceId] || 0;
      if (current > 0) {
        const next = { ...prev };
        delete next[serviceId];
        return next;
      }
      return { ...prev, [serviceId]: 1 };
    });
  };

  const handleBooking = () => {
    if (!car) return;

    navigation.navigate('Travel/CarBooking', {
      car,
      searchParams,
      searchToken,
      selectedInsurance,
      selectedExtras,
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  if (error || !car) {
    return (
      <ErrorDisplay
        error={error || 'Araç detayları yüklenemedi'}
        onRetry={() => navigation.goBack()}
      />
    );
  }

  // Fiyat hesaplama
  const baseTotal = car.pricePerDay * days;
  const insuranceOption = car.insuranceOptions.find((i) => i.id === selectedInsurance);
  const insuranceCost =
    insuranceOption && !insuranceOption.included ? insuranceOption.price * days : 0;
  const extrasCost = Object.entries(selectedExtras).reduce((sum, [id, qty]) => {
    const service = car.extraServices.find((s) => s.id === id);
    if (!service) return sum;
    return sum + (service.unit === 'per_day' ? service.price * days : service.price) * qty;
  }, 0);
  const estimatedTotal = baseTotal + insuranceCost + extrasCost;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.gallery}>
          <FlatList
            data={car.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIndex(index);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.galleryImage}
                resizeMode="cover"
              />
            )}
            keyExtractor={(_, i) => i.toString()}
          />
          <View style={styles.galleryDots}>
            {car.images.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeImageIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* Araç Başlık */}
        <View style={styles.headerSection}>
          <Text style={styles.carName}>{car.name}</Text>
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {CAR_CATEGORY_LABELS[car.category]}
              </Text>
            </View>
            <Text style={styles.supplierText}>
              {car.supplier.name}
              {car.supplier.rating && ` ⭐ ${car.supplier.rating.toFixed(1)}`}
            </Text>
          </View>
          <Text style={styles.descriptionText}>{car.description}</Text>
        </View>

        {/* Teknik Özellikler */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Araç Özellikleri</Text>
          <View style={styles.specsGrid}>
            <SpecItem icon="people" label="Koltuk" value={`${car.seats} Kişi`} />
            <SpecItem icon="briefcase" label="Bavul" value={`${car.largeBags}B + ${car.smallBags}K`} />
            <SpecItem icon="cog" label="Vites" value={TRANSMISSION_LABELS[car.transmission]} />
            <SpecItem icon="flame" label="Yakıt" value={FUEL_TYPE_LABELS[car.fuelType]} />
            <SpecItem icon="speedometer" label="KM" value={MILEAGE_TYPE_LABELS[car.mileage.type]} />
            <SpecItem icon="car" label="Kapı" value={`${car.doors} Kapı`} />
            {car.airConditioning && (
              <SpecItem icon="snow" label="Klima" value="Var" />
            )}
          </View>
        </Card>

        {/* Sigorta Seçenekleri */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Sigorta Seçenekleri</Text>
          {car.insuranceOptions.map((insurance) => (
            <TouchableOpacity
              key={insurance.id}
              style={[
                styles.insuranceCard,
                (selectedInsurance === insurance.id || insurance.included) &&
                  styles.insuranceCardSelected,
              ]}
              onPress={() => {
                if (!insurance.included) {
                  setSelectedInsurance(
                    selectedInsurance === insurance.id ? null : insurance.id
                  );
                }
              }}
              activeOpacity={insurance.included ? 1 : 0.7}
            >
              <View style={styles.insuranceHeader}>
                <View style={styles.insuranceInfo}>
                  <Text style={styles.insuranceName}>{insurance.name}</Text>
                  {insurance.recommended && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>Önerilen</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.insurancePrice}>
                  {insurance.included
                    ? 'Dahil'
                    : `${formatCarPrice(insurance.price, insurance.currency)}/gün`}
                </Text>
              </View>
              <Text style={styles.insuranceDesc}>{insurance.description}</Text>
              <View style={styles.coverageList}>
                {insurance.coverage.map((item, idx) => (
                  <View key={idx} style={styles.coverageItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={colors.primary[600]}
                    />
                    <Text style={styles.coverageText}>{item}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Ekstra Hizmetler */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Ekstra Hizmetler</Text>
          {car.extraServices.map((service) => {
            const isSelected = (selectedExtras[service.id] || 0) > 0;
            return (
              <TouchableOpacity
                key={service.id}
                style={[styles.extraCard, isSelected && styles.extraCardSelected]}
                onPress={() => toggleExtra(service.id)}
                activeOpacity={0.7}
              >
                <View style={styles.extraInfo}>
                  <Text style={styles.extraName}>{service.name}</Text>
                  <Text style={styles.extraDesc}>{service.description}</Text>
                </View>
                <View style={styles.extraRight}>
                  <Text style={styles.extraPrice}>
                    {formatCarPrice(service.price, service.currency)}
                    <Text style={styles.extraUnit}>
                      /{service.unit === 'per_day' ? 'gün' : 'kiralama'}
                    </Text>
                  </Text>
                  <View style={[styles.extraCheckbox, isSelected && styles.extraCheckboxChecked]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* Kiralama Koşulları */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Kiralama Koşulları</Text>
          <View style={styles.conditionsList}>
            <ConditionItem
              label="Minimum Yaş"
              value={`${car.rentalConditions.minimumAge} yaş`}
            />
            <ConditionItem
              label="Minimum Ehliyet"
              value={`${car.rentalConditions.minimumLicenseAge} yıl`}
            />
            <ConditionItem
              label="İptal Politikası"
              value={CANCELLATION_TYPE_LABELS[car.cancellation.type]}
            />
            <ConditionItem
              label="Yakıt Politikası"
              value={car.fuelPolicy === 'full_to_full' ? 'Dolu-Dolu' : 'Aynı-Aynı'}
            />
            {car.depositAmount != null && (
              <ConditionItem
                label="Depozito"
                value={formatCarPrice(car.depositAmount, car.currency)}
              />
            )}
            {car.excessAmount != null && (
              <ConditionItem
                label="Hasar Muafiyeti"
                value={formatCarPrice(car.excessAmount, car.currency)}
              />
            )}
          </View>
        </Card>

        {/* Politikalar */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Politikalar</Text>
          {Object.entries(car.policies).map(([key, value]) => {
            const labels: Record<string, string> = {
              cancellation: 'İptal',
              amendment: 'Değişiklik',
              lateReturn: 'Geç Teslim',
              earlyReturn: 'Erken Teslim',
              damage: 'Hasar',
              theft: 'Çalınma',
            };
            return (
              <View key={key} style={styles.policyItem}>
                <Text style={styles.policyLabel}>{labels[key] || key}</Text>
                <Text style={styles.policyText}>{value}</Text>
              </View>
            );
          })}
        </Card>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sabit alt fiyat bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPriceLabel}>{days} gün toplam (tahmini)</Text>
          <Text style={styles.bottomPrice}>
            {formatCarPrice(estimatedTotal, car.currency)}
          </Text>
        </View>
        <Button
          title="Rezervasyon Yap"
          onPress={handleBooking}
          style={styles.bookButton}
        />
      </View>
    </View>
  );
};

// Özellik item component
const SpecItem = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View style={styles.specItem}>
    <Ionicons name={icon as any} size={20} color={colors.gray[500]} />
    <Text style={styles.specLabel}>{label}</Text>
    <Text style={styles.specValue}>{value}</Text>
  </View>
);

// Koşul item component
const ConditionItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.conditionItem}>
    <Text style={styles.conditionLabel}>{label}</Text>
    <Text style={styles.conditionValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  // Gallery
  gallery: {
    position: 'relative',
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: 220,
    backgroundColor: colors.gray[200],
  },
  galleryDots: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 16,
  },
  // Header
  headerSection: {
    backgroundColor: colors.background,
    padding: 16,
    marginBottom: 8,
  },
  carName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[600],
  },
  supplierText: {
    fontSize: 13,
    color: colors.gray[500],
  },
  descriptionText: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
  // Section
  section: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 14,
  },
  // Specs grid
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  specItem: {
    width: '30%',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  specLabel: {
    fontSize: 11,
    color: colors.gray[500],
  },
  specValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  // Insurance
  insuranceCard: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  insuranceCardSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  insuranceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  insuranceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insuranceName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  recommendedBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary[700],
  },
  insurancePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
  },
  insuranceDesc: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 8,
  },
  coverageList: {
    gap: 4,
  },
  coverageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coverageText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  // Extras
  extraCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  extraCardSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  extraInfo: {
    flex: 1,
    marginRight: 12,
  },
  extraName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  extraDesc: {
    fontSize: 12,
    color: colors.gray[500],
  },
  extraRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  extraPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
  },
  extraUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.gray[500],
  },
  extraCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraCheckboxChecked: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  // Conditions
  conditionsList: {
    gap: 8,
  },
  conditionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  conditionLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  conditionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  // Policies
  policyItem: {
    marginBottom: 12,
  },
  policyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 3,
  },
  policyText: {
    fontSize: 13,
    color: colors.gray[600],
    lineHeight: 18,
  },
  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: colors.gray[500],
  },
  bottomPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary[600],
  },
  bookButton: {
    paddingHorizontal: 24,
  },
});
