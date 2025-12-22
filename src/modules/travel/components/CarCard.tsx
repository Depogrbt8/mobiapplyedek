import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card } from '@/components/ui/Card';
import type { Car } from '../services/carService';
import { formatCurrency } from '@/utils/format';
import { colors } from '@/constants/colors';

interface CarCardProps {
  car: Car;
  onPress: () => void;
}

export const CarCard: React.FC<CarCardProps> = ({ car, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        {car.image && (
          <Image source={{ uri: car.image }} style={styles.image} />
        )}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.info}>
              <Text style={styles.name}>{car.name}</Text>
              <Text style={styles.brand}>{car.brand} - {car.type}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {formatCurrency(car.price, car.currency)}
              </Text>
              <Text style={styles.priceLabel}>/gün</Text>
            </View>
          </View>
          {car.features && car.features.length > 0 && (
            <View style={styles.features}>
              {car.features.slice(0, 3).map((feature, index) => (
                <View key={index} style={styles.featureBadge}>
                  <Text style={styles.featureText}>{feature}</Text>
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
  brand: {
    fontSize: 14,
    color: colors.text.secondary,
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
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureBadge: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featureText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
});



