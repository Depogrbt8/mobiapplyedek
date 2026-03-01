import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { HotelDetails as HotelDetailsType } from '../types/hotel';
import { 
  formatPrice,
  getScoreColor,
  getScoreText,
  AMENITY_LABELS 
} from '../utils/hotelHelpers';
import { RoomSelector } from './RoomSelector';
import { useHotelFavorite } from '../hooks/useHotelFavorite';
import { colors } from '@/constants/colors';
import { Card } from '@/components/ui/Card';

// Amenity ikonları
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

interface HotelDetailsProps {
  hotel: HotelDetailsType;
  checkIn: string;
  checkOut: string;
  guests: { adults: number; children: number; rooms: number };
  onRoomSelect: (roomId: string, rateId: string) => void;
  onLoginRequired?: () => void;
}

export const HotelDetails: React.FC<HotelDetailsProps> = ({
  hotel,
  checkIn,
  checkOut,
  guests,
  onRoomSelect,
  onLoginRequired,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const hotelLocation = `${hotel.location.city}, ${hotel.location.country || 'Türkiye'}`;
  const { isFavorite, isLoading, toggleFavorite, error, clearError } = useHotelFavorite(hotel.id, {
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

  // Görsel navigasyonu
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === hotel.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? hotel.images.length - 1 : prev - 1
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Görsel Galerisi */}
      <Card style={styles.imageCard}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: hotel.images[currentImageIndex] || 'https://via.placeholder.com/400x300' }}
            style={styles.image}
            resizeMode="cover"
          />
          
          {/* Navigasyon okları */}
          {hotel.images.length > 1 && (
            <>
              <TouchableOpacity
                style={styles.navButton}
                onPress={prevImage}
              >
                <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonRight]}
                onPress={nextImage}
              >
                <Ionicons name="chevron-forward" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </>
          )}

          {/* Görsel sayacı */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1} / {hotel.images.length}
            </Text>
          </View>

          {/* Favori butonu */}
          <TouchableOpacity
            style={[
              styles.favoriteButton,
              isFavorite && styles.favoriteButtonActive,
              isLoading && styles.favoriteButtonDisabled,
            ]}
            onPress={() => toggleFavorite()}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? colors.text.inverse : colors.text.primary}
            />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Otel Bilgileri */}
      <Card style={styles.infoCard}>
        {/* Başlık ve Puan */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.hotelName}>{hotel.name}</Text>
            
            {/* Konum */}
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.text.secondary} />
              <Text style={styles.location}>
                {hotel.location.address}, {hotel.location.city}
              </Text>
            </View>

            {/* Yıldızlar ve zincir */}
            <View style={styles.ratingRow}>
              <View style={styles.stars}>
                {Array.from({ length: hotel.rating }).map((_, i) => (
                  <Ionicons key={i} name="star" size={14} color="#fbbf24" />
                ))}
              </View>
              {hotel.hotelChain && (
                <Text style={styles.chainText}>{hotel.hotelChain}</Text>
              )}
            </View>
          </View>

          {/* Puan kutusu */}
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

        {/* Açıklama */}
        {hotel.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{hotel.description}</Text>
          </View>
        )}

        {/* Otel Özellikleri */}
        <View style={styles.amenitiesSection}>
          <Text style={styles.sectionTitle}>Otel Özellikleri</Text>
          <View style={styles.amenitiesContainer}>
            {hotel.amenities.slice(0, showAllAmenities ? undefined : 8).map((amenity, index) => (
              <View key={index} style={styles.amenityBadge}>
                <Ionicons 
                  name={getAmenityIcon(amenity) as any} 
                  size={14} 
                  color={colors.text.secondary} 
                />
                <Text style={styles.amenityText}>
                  {AMENITY_LABELS[amenity] || amenity}
                </Text>
              </View>
            ))}
            {hotel.amenities.length > 8 && !showAllAmenities && (
              <TouchableOpacity
                style={styles.amenityBadge}
                onPress={() => setShowAllAmenities(true)}
              >
                <Text style={styles.amenityTextMore}>
                  +{hotel.amenities.length - 8} daha
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {showAllAmenities && hotel.amenities.length > 8 && (
            <TouchableOpacity
              onPress={() => setShowAllAmenities(false)}
              style={styles.showMoreButton}
            >
              <Text style={styles.showMoreText}>Daha az göster</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Otel Politikaları */}
        <View style={styles.policiesSection}>
          <Text style={styles.sectionTitle}>Otel Kuralları</Text>
          <View style={styles.policiesGrid}>
            <View style={styles.policyItem}>
              <Text style={styles.policyLabel}>Giriş</Text>
              <Text style={styles.policyValue}>{hotel.policies.checkIn}</Text>
            </View>
            <View style={styles.policyItem}>
              <Text style={styles.policyLabel}>Çıkış</Text>
              <Text style={styles.policyValue}>{hotel.policies.checkOut}</Text>
            </View>
            <View style={styles.policyItem}>
              <Text style={styles.policyLabel}>Evcil Hayvan</Text>
              <Text style={styles.policyValue}>
                {hotel.policies.petsAllowed ? 'Kabul edilir' : 'Kabul edilmez'}
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Text style={styles.policyLabel}>Sigara</Text>
              <Text style={styles.policyValue}>
                {hotel.policies.smokingAllowed ? 'Serbest' : 'Yasak'}
              </Text>
            </View>
          </View>
          {hotel.policies.cancellation && (
            <View style={styles.cancellationContainer}>
              <Text style={styles.cancellationTitle}>İptal Politikası</Text>
              <Text style={styles.cancellationText}>{hotel.policies.cancellation}</Text>
            </View>
          )}
        </View>
      </Card>

      {/* Oda Seçimi */}
      <Card style={styles.roomsCard}>
        <Text style={styles.sectionTitle}>Oda Seçin</Text>
        <RoomSelector
          rooms={hotel.rooms}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          onSelect={onRoomSelect}
        />
      </Card>

      {/* Yorumlar */}
      {hotel.reviews && hotel.reviews.length > 0 && (
        <Card style={styles.reviewsCard}>
          <Text style={styles.sectionTitle}>Misafir Yorumları</Text>
          <View style={styles.reviewsContainer}>
            {hotel.reviews.slice(0, 5).map(review => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAuthorContainer}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>
                        {review.author.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.reviewAuthorInfo}>
                      <Text style={styles.reviewAuthorName}>{review.author}</Text>
                      <Text style={styles.reviewDate}>
                        {new Date(review.date).toLocaleDateString('tr-TR')}
                        {review.verified && ' • Doğrulanmış'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.reviewScoreBadge, { backgroundColor: getScoreColor(review.rating) }]}>
                    <Text style={styles.reviewScoreText}>{review.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageCard: {
    marginBottom: 12,
    overflow: 'hidden',
    borderRadius: 12,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[200],
  },
  navButton: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navButtonRight: {
    left: 'auto',
    right: 16,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
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
  infoCard: {
    marginBottom: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  hotelName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  location: {
    fontSize: 13,
    color: colors.text.secondary,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  chainText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 2,
  },
  reviewCount: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  descriptionContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  amenitiesSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 6,
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
  showMoreButton: {
    marginTop: 12,
  },
  showMoreText: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: '500',
  },
  policiesSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  policiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  policyItem: {
    flex: 1,
    minWidth: '45%',
  },
  policyLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  policyValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.primary,
  },
  cancellationContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  cancellationTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 4,
  },
  cancellationText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  roomsCard: {
    marginBottom: 12,
    padding: 16,
  },
  reviewsCard: {
    marginBottom: 12,
    padding: 16,
  },
  reviewsContainer: {
    gap: 12,
  },
  reviewItem: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewAuthorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  reviewAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary[700],
  },
  reviewAuthorInfo: {
    flex: 1,
  },
  reviewAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  reviewScoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reviewScoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  reviewComment: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});

