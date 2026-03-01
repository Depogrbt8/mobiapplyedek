import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { RoomType, Rate } from '../types/hotel';
import { 
  formatPrice, 
  getMealPlanLabel, 
  getCancellationLabel, 
  getNights,
  AMENITY_LABELS 
} from '../utils/hotelHelpers';
import { colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';

interface RoomSelectorProps {
  rooms: RoomType[];
  checkIn: string;
  checkOut: string;
  guests: { adults: number; children: number; rooms: number };
  onSelect: (roomId: string, rateId: string) => void;
}

export const RoomSelector: React.FC<RoomSelectorProps> = ({
  rooms,
  checkIn,
  checkOut,
  guests,
  onSelect
}) => {
  const nights = getNights(checkIn, checkOut);

  return (
    <View style={styles.container}>
      {rooms.map(room => (
        <View key={room.id} style={styles.roomCard}>
          <View style={styles.roomContent}>
            {/* Oda Görseli */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: room.images[0] || 'https://via.placeholder.com/400x300' }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>

            {/* Oda Bilgileri */}
            <View style={styles.infoContainer}>
              <Text style={styles.roomName}>{room.name}</Text>
              
              {/* Oda özellikleri */}
              <View style={styles.featuresRow}>
                <View style={styles.featureItem}>
                  <Ionicons name="people" size={14} color={colors.text.secondary} />
                  <Text style={styles.featureText}>Max {room.maxOccupancy} kişi</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="bed" size={14} color={colors.text.secondary} />
                  <Text style={styles.featureText}>{room.bedType}</Text>
                </View>
                {room.size && (
                  <View style={styles.featureItem}>
                    <Ionicons name="expand" size={14} color={colors.text.secondary} />
                    <Text style={styles.featureText}>{room.size} m²</Text>
                  </View>
                )}
              </View>

              <Text style={styles.description} numberOfLines={2}>
                {room.description}
              </Text>

              {/* Oda amenity'leri */}
              <View style={styles.amenitiesRow}>
                {room.amenities.slice(0, 5).map((amenity, index) => (
                  <View key={index} style={styles.amenityBadge}>
                    <Text style={styles.amenityText}>
                      {AMENITY_LABELS[amenity] || amenity}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Rate seçenekleri */}
              <View style={styles.ratesContainer}>
                {room.rates.map(rate => (
                  <RateOption
                    key={rate.id}
                    rate={rate}
                    nights={nights}
                    roomsNeeded={guests.rooms}
                    onSelect={() => onSelect(room.id, rate.id)}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

// Rate Option Component
interface RateOptionProps {
  rate: Rate;
  nights: number;
  roomsNeeded: number;
  onSelect: () => void;
}

const RateOption: React.FC<RateOptionProps> = ({ rate, nights, roomsNeeded, onSelect }) => {
  const totalPrice = rate.price * nights * roomsNeeded;
  const isLowAvailability = rate.roomsLeft && rate.roomsLeft <= 3;

  return (
    <View style={styles.rateCard}>
      <View style={styles.rateInfo}>
        <View style={styles.rateHeader}>
          <Text style={styles.rateName}>{rate.name}</Text>
          <View style={styles.mealPlanBadge}>
            <Text style={styles.mealPlanText}>
              {getMealPlanLabel(rate.mealPlan)}
            </Text>
          </View>
        </View>
        <View style={styles.rateDetails}>
          <Text style={styles.cancellationText}>
            {getCancellationLabel(rate.cancellationPolicy)}
          </Text>
          {isLowAvailability && (
            <Text style={styles.availabilityWarning}>
              Son {rate.roomsLeft} oda!
            </Text>
          )}
        </View>
      </View>

      <View style={styles.ratePriceContainer}>
        <View style={styles.priceInfo}>
          {rate.originalPrice && rate.originalPrice > rate.price && (
            <Text style={styles.originalPrice}>
              {formatPrice(rate.originalPrice * nights * roomsNeeded, rate.currency)}
            </Text>
          )}
          <Text style={styles.totalPrice}>
            {formatPrice(totalPrice, rate.currency)}
          </Text>
          <Text style={styles.priceDetails}>
            {nights} gece, {roomsNeeded} oda
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.selectButton,
            !rate.availability && styles.selectButtonDisabled
          ]}
          onPress={onSelect}
          disabled={!rate.availability}
        >
          <Text style={[
            styles.selectButtonText,
            !rate.availability && styles.selectButtonTextDisabled
          ]}>
            {rate.availability ? 'Seç' : 'Müsait Değil'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  roomCard: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  roomContent: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: 120,
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[200],
  },
  infoContainer: {
    flex: 1,
    padding: 12,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  description: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  amenityBadge: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  amenityText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  ratesContainer: {
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  rateCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  rateInfo: {
    flex: 1,
  },
  rateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  rateName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  mealPlanBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mealPlanText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e40af',
  },
  rateDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  cancellationText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  availabilityWarning: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ea580c',
  },
  ratePriceContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 12,
    color: colors.gray[400],
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary[600],
  },
  priceDetails: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  selectButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary[600],
    minWidth: 80,
    alignItems: 'center',
  },
  selectButtonDisabled: {
    backgroundColor: colors.gray[200],
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  selectButtonTextDisabled: {
    color: colors.text.disabled,
  },
});

