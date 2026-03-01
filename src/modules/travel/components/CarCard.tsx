// Araç Kartı - Desktop (grbt8) mobil tasarımı birebir React Native'e uyarlandı
// Kompakt layout: sol resim + sağ bilgiler + alt gri bar (fiyat + iptal + tedarikçi)

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import type { Car } from '../types/car';
import {
  CAR_CATEGORY_LABELS,
  TRANSMISSION_LABELS,
  MILEAGE_TYPE_LABELS,
  CANCELLATION_TYPE_LABELS,
} from '../types/car';
import { formatCarPrice } from '../utils/carHelpers';
import { colors } from '@/constants/colors';

interface CarCardProps {
  car: Car;
  onPress: () => void;
}

export const CarCard: React.FC<CarCardProps> = ({ car, onPress }) => {
  const [imgError, setImgError] = useState(false);
  const categoryLabel = CAR_CATEGORY_LABELS[car.category] || car.category;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        {/* Üst kısım: Resim sol + bilgi sağ */}
        <View style={styles.topRow}>
          {/* Sol: Araç görseli */}
          <View style={styles.imageContainer}>
            {!imgError && car.imageUrl ? (
              <Image
                source={{ uri: car.imageUrl }}
                style={styles.image}
                resizeMode="cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>🚗</Text>
              </View>
            )}
          </View>

          {/* Sağ: Bilgiler */}
          <View style={styles.infoContainer}>
            <Text style={styles.carName} numberOfLines={1}>
              {car.name}
            </Text>
            <Text style={styles.categoryText}>
              veya benzeri · {categoryLabel}
            </Text>

            {/* Koltuk, Bavul, Kapı */}
            <View style={styles.specsRow}>
              <View style={styles.specItem}>
                <Ionicons name="people-outline" size={14} color={colors.gray[400]} />
                <Text style={styles.specText}>{car.seats}</Text>
              </View>
              <View style={styles.specItem}>
                <Ionicons name="briefcase-outline" size={14} color={colors.gray[400]} />
                <Text style={styles.specText}>
                  {car.largeBags}B+{car.smallBags}K
                </Text>
              </View>
              <View style={styles.specItem}>
                <Ionicons name="car-outline" size={14} color={colors.gray[400]} />
                <Text style={styles.specText}>{car.doors}</Text>
              </View>
            </View>

            {/* Vites, KM, Klima */}
            <View style={styles.tagsRow}>
              <Text style={styles.tagText}>
                {TRANSMISSION_LABELS[car.transmission]}
              </Text>
              <Text style={styles.tagDot}>·</Text>
              <Text style={styles.tagText}>
                {MILEAGE_TYPE_LABELS[car.mileage.type]} KM
              </Text>
              {car.airConditioning && (
                <>
                  <Text style={styles.tagDot}>·</Text>
                  <Text style={styles.tagText}>Klimalı</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Alt bar: Bilgi + Fiyat */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomLeft}>
            {/* Tedarikçi puanı */}
            {car.supplierRating != null && (
              <View style={styles.ratingRow}>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>
                    {car.supplierRating.toFixed(1)}
                  </Text>
                </View>
                <Text style={styles.ratingLabel}>Teklif mükemmel</Text>
              </View>
            )}

            {/* İptal politikası */}
            <View style={styles.infoRow}>
              <Ionicons
                name="information-circle-outline"
                size={13}
                color={colors.gray[500]}
              />
              <Text style={styles.infoText}>
                {CANCELLATION_TYPE_LABELS[car.cancellation.type]}
              </Text>
            </View>

            {/* Depozito */}
            {car.depositAmount != null && (
              <Text style={styles.depositText}>
                Depozito: {car.depositAmount} {car.currency}
              </Text>
            )}

            {/* Tedarikçi adı */}
            <Text style={styles.supplierText}>{car.supplierName}</Text>
          </View>

          {/* Fiyat */}
          <View style={styles.bottomRight}>
            <Text style={styles.priceLabel}>Toplam fiyat</Text>
            <Text style={styles.price}>
              {formatCarPrice(car.totalPrice, car.currency)}
            </Text>
            <Text style={styles.pricePerDay}>
              ({formatCarPrice(car.pricePerDay, car.currency)}/gün)
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  // Üst kısım
  topRow: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: 112,
    height: 96,
    backgroundColor: colors.gray[100],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 28,
  },
  infoContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  carName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 11,
    color: colors.gray[500],
    marginBottom: 6,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  specText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    color: colors.gray[500],
  },
  tagDot: {
    fontSize: 11,
    color: colors.gray[400],
  },
  // Alt bar
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.gray[50],
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  bottomLeft: {
    flex: 1,
    gap: 3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  ratingBadge: {
    backgroundColor: colors.gray[800],
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  ratingLabel: {
    fontSize: 11,
    color: colors.gray[600],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  infoText: {
    fontSize: 11,
    color: colors.gray[600],
  },
  depositText: {
    fontSize: 10,
    color: colors.gray[500],
  },
  supplierText: {
    fontSize: 11,
    color: colors.gray[500],
  },
  // Fiyat
  bottomRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  priceLabel: {
    fontSize: 10,
    color: colors.gray[500],
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary[600],
  },
  pricePerDay: {
    fontSize: 10,
    color: colors.gray[400],
  },
});
