import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { HotelFilters as HotelFiltersType } from '../types/hotel';
import { AMENITY_LABELS, formatPrice } from '../utils/hotelHelpers';
import { colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';

interface HotelFiltersProps {
  filters: HotelFiltersType;
  availableFilters?: {
    availableAmenities: string[];
    priceRange: { min: number; max: number };
    availableChains: string[];
  };
  onFiltersChange: (filters: HotelFiltersType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const HotelFilters: React.FC<HotelFiltersProps> = ({
  filters,
  availableFilters,
  onFiltersChange,
  isOpen,
  onClose
}) => {
  const [priceMin, setPriceMin] = useState<string>(
    filters.priceRange?.min?.toString() || availableFilters?.priceRange.min.toString() || ''
  );
  const [priceMax, setPriceMax] = useState<string>(
    filters.priceRange?.max?.toString() || availableFilters?.priceRange.max.toString() || ''
  );

  // Rating toggle
  const handleRatingToggle = (rating: number) => {
    const currentRatings = filters.rating || [];
    const newRatings = currentRatings.includes(rating)
      ? currentRatings.filter(r => r !== rating)
      : [...currentRatings, rating];
    
    onFiltersChange({
      ...filters,
      rating: newRatings.length > 0 ? newRatings : undefined
    });
  };

  // Amenity toggle
  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    onFiltersChange({
      ...filters,
      amenities: newAmenities.length > 0 ? newAmenities : undefined
    });
  };

  // Fiyat aralığı uygula
  const applyPriceRange = () => {
    const min = priceMin ? parseInt(priceMin, 10) : availableFilters?.priceRange.min || 0;
    const max = priceMax ? parseInt(priceMax, 10) : availableFilters?.priceRange.max || 1000;
    
    onFiltersChange({
      ...filters,
      priceRange: { min, max }
    });
  };

  // Filtreleri temizle
  const clearAllFilters = () => {
    setPriceMin(availableFilters?.priceRange.min.toString() || '');
    setPriceMax(availableFilters?.priceRange.max.toString() || '');
    onFiltersChange({
      sortBy: filters.sortBy // Sıralamayı koru
    });
  };

  // Aktif filtre sayısı
  const activeFilterCount = 
    (filters.rating?.length || 0) +
    (filters.amenities?.length || 0) +
    (filters.priceRange ? 1 : 0);

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="options" size={20} color={colors.text.primary} />
              <Text style={styles.headerTitle}>Filtreler</Text>
              {activeFilterCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Yıldız rating */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Otel Sınıfı</Text>
              <View style={styles.ratingContainer}>
                {[5, 4, 3, 2, 1].map(rating => {
                  const isSelected = filters.rating?.includes(rating) || false;
                  return (
                    <TouchableOpacity
                      key={rating}
                      onPress={() => handleRatingToggle(rating)}
                      style={[
                        styles.ratingButton,
                        isSelected && styles.ratingButtonSelected
                      ]}
                    >
                      <Text style={[
                        styles.ratingText,
                        isSelected && styles.ratingTextSelected
                      ]}>
                        {rating}
                      </Text>
                      <Ionicons 
                        name="star" 
                        size={16} 
                        color={isSelected ? '#fbbf24' : colors.text.secondary} 
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Fiyat Aralığı */}
            {availableFilters?.priceRange && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Fiyat Aralığı</Text>
                <View style={styles.priceContainer}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Min"
                    value={priceMin}
                    onChangeText={setPriceMin}
                    keyboardType="numeric"
                    placeholderTextColor={colors.text.disabled}
                  />
                  <Text style={styles.priceSeparator}>-</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Max"
                    value={priceMax}
                    onChangeText={setPriceMax}
                    keyboardType="numeric"
                    placeholderTextColor={colors.text.disabled}
                  />
                </View>
                <Text style={styles.priceHint}>
                  {formatPrice(availableFilters.priceRange.min)} - {formatPrice(availableFilters.priceRange.max)}
                </Text>
                <TouchableOpacity
                  style={styles.applyPriceButton}
                  onPress={applyPriceRange}
                >
                  <Text style={styles.applyPriceText}>Uygula</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Amenities */}
            {availableFilters?.availableAmenities && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Otel Özellikleri</Text>
                <View style={styles.amenitiesContainer}>
                  {availableFilters.availableAmenities.slice(0, 12).map(amenity => {
                    const isSelected = filters.amenities?.includes(amenity) || false;
                    return (
                      <TouchableOpacity
                        key={amenity}
                        onPress={() => handleAmenityToggle(amenity)}
                        style={[
                          styles.amenityButton,
                          isSelected && styles.amenityButtonSelected
                        ]}
                      >
                        <Text style={[
                          styles.amenityText,
                          isSelected && styles.amenityTextSelected
                        ]}>
                          {AMENITY_LABELS[amenity] || amenity}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearAllFilters}
            >
              <Text style={styles.clearButtonText}>Temizle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={onClose}
            >
              <Text style={styles.applyButtonText}>Uygula</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  badge: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.background,
  },
  ratingButtonSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600],
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  ratingTextSelected: {
    color: colors.primary[600],
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text.primary,
    backgroundColor: colors.background,
  },
  priceSeparator: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  priceHint: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  applyPriceButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary[600],
    borderRadius: 8,
  },
  applyPriceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.background,
  },
  amenityButtonSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600],
  },
  amenityText: {
    fontSize: 13,
    color: colors.text.primary,
  },
  amenityTextSelected: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

