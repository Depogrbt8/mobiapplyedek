import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card } from '@/components/ui/Card';
import type { Hotel } from '../services/hotelService';
import { formatCurrency } from '@/utils/format';
import { colors } from '@/constants/colors';

interface HotelCardProps {
  hotel: Hotel;
  onPress: () => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        {hotel.image && (
          <Image source={{ uri: hotel.image }} style={styles.image} />
        )}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.info}>
              <Text style={styles.name}>{hotel.name}</Text>
              <Text style={styles.location}>{hotel.location}</Text>
              {hotel.rating && (
                <View style={styles.rating}>
                  <Text style={styles.ratingText}>⭐ {hotel.rating}</Text>
                </View>
              )}
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {formatCurrency(hotel.price, hotel.currency)}
              </Text>
              <Text style={styles.priceLabel}>/gece</Text>
            </View>
          </View>
          {hotel.amenities && hotel.amenities.length > 0 && (
            <View style={styles.amenities}>
              {hotel.amenities.slice(0, 3).map((amenity, index) => (
                <View key={index} style={styles.amenityBadge}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: colors.gray[200],
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  rating: {
    alignSelf: 'flex-start',
  },
  ratingText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary[600],
  },
  priceLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityBadge: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  amenityText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
});



