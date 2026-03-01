import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import type { Hotel } from '../types/hotel';
import { formatPrice, getScoreColor, getScoreText, formatDistance } from '../utils/hotelHelpers';
import { useHotelFavorite } from '../hooks/useHotelFavorite';
import { colors } from '@/constants/colors';

interface HotelCardProps {
  hotel: Hotel;
  checkIn?: string;
  checkOut?: string;
  guests?: { adults: number; children: number; rooms: number };
  onPress: () => void;
  /** Giriş yapmamış kullanıcı favoriye tıklarsa (opsiyonel) giriş ekranına yönlendir */
  onLoginRequired?: () => void;
}

// Amenity ikonları (Ionicons)
const getAmenityIcon = (amenity: string): string => {
  const iconMap: Record<string, string> = {
    'WiFi': 'wifi',
    'Parking': 'car',
    'Restaurant': 'restaurant',
    'Gym': 'barbell',
    'Pool': 'water',
    'Spa': 'spa',
    'Bar': 'wine',
    'Room Service': 'room-service',
  };
  return iconMap[amenity] || 'checkmark-circle';
};

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, onPress, onLoginRequired }) => {
  const hotelLocation = `${hotel.location.city}, ${hotel.location.country || 'Türkiye'}`;
  const {
    isFavorite,
    isLoading,
    toggleFavorite,
    error,
    clearError,
  } = useHotelFavorite(hotel.id, {
    name: hotel.name,
    location: hotelLocation,
    image: hotel.images?.[0],
  });

  useEffect(() => {
    if (error) {
      Alert.alert(
        'Favorilere Ekle',
        error,
        onLoginRequired
          ? [
              { text: 'Tamam', style: 'cancel', onPress: clearError },
              { text: 'Giriş Yap', onPress: () => { clearError(); onLoginRequired(); } },
            ]
          : [{ text: 'Tamam', style: 'cancel', onPress: clearError }]
      );
    }
  }, [error, onLoginRequired, clearError]);

  const handleFavoritePress = async (e: any) => {
    e.stopPropagation();
    await toggleFavorite();
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.container}>
          {/* Otel Görseli */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: hotel.images[0] || 'https://via.placeholder.com/400x300' }} 
              style={styles.image}
              resizeMode="cover"
            />
            {/* Yıldız rating badge */}
            <View style={styles.ratingBadge}>
              {Array.from({ length: hotel.rating }).map((_, i) => (
                <Ionicons key={i} name="star" size={12} color="#fbbf24" />
              ))}
            </View>
            
            {/* Favori butonu - API ile senkron (giriş yoksa uyarı) */}
            <TouchableOpacity
              style={[
                styles.favoriteButton,
                isFavorite && styles.favoriteButtonActive,
                isLoading && styles.favoriteButtonDisabled,
              ]}
              onPress={handleFavoritePress}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? colors.text.inverse : colors.text.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Otel Bilgileri */}
          <View style={styles.content}>
            {/* Üst kısım: İsim ve puan */}
            <View style={styles.header}>
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {hotel.name}
                </Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={14} color={colors.text.secondary} />
                  <Text style={styles.location}>
                    {hotel.location.city}, {hotel.location.country || 'Türkiye'}
                  </Text>
                  {hotel.location.distanceFromCenter && (
                    <Text style={styles.distance}>
                      • Merkeze {formatDistance(hotel.location.distanceFromCenter)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Review score */}
              {hotel.reviewScore && (
                <View style={styles.scoreContainer}>
                  <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(hotel.reviewScore) }]}>
                    <Text style={styles.scoreText}>
                      {hotel.reviewScore.toFixed(1)}
                    </Text>
                  </View>
                  <Text style={styles.scoreLabel}>
                    {getScoreText(hotel.reviewScore)}
                  </Text>
                  {hotel.reviewCount && (
                    <Text style={styles.reviewCount}>
                      {hotel.reviewCount.toLocaleString('tr-TR')} yorum
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Amenities */}
            <View style={styles.amenitiesContainer}>
              {hotel.amenities.slice(0, 4).map((amenity, index) => (
                <View key={index} style={styles.amenityBadge}>
                  <Ionicons 
                    name={getAmenityIcon(amenity) as any} 
                    size={14} 
                    color={colors.text.secondary} 
                  />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
              {hotel.amenities.length > 4 && (
                <View style={styles.amenityBadge}>
                  <Text style={styles.amenityTextMore}>
                    +{hotel.amenities.length - 4}
                  </Text>
                </View>
              )}
            </View>

            {/* Alt kısım: Fiyat */}
            <View style={styles.footer}>
              <View style={styles.chainContainer}>
                {hotel.hotelChain && (
                  <Text style={styles.chainText}>{hotel.hotelChain}</Text>
                )}
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Gecelik fiyat</Text>
                <Text style={styles.price}>
                  {formatPrice(hotel.priceRange.min, hotel.priceRange.currency)}
                </Text>
                <Text style={styles.priceSubtext}>vergiler dahil</Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  container: {
    flexDirection: 'column',
    backgroundColor: colors.background,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[200],
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    gap: 2,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: colors.primary[500],
  },
  favoriteButtonDisabled: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  distance: {
    fontSize: 12,
    color: colors.gray[400],
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 2,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  scoreLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 2,
  },
  reviewCount: {
    fontSize: 10,
    color: colors.gray[400],
    marginTop: 2,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  amenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  amenityText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  amenityTextMore: {
    fontSize: 11,
    color: colors.gray[500],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  chainContainer: {
    flex: 1,
  },
  chainText: {
    fontSize: 12,
    color: colors.gray[400],
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary[600],
  },
  priceSubtext: {
    fontSize: 10,
    color: colors.gray[400],
    marginTop: 2,
  },
});
