import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { formatPrice, formatDate, getNights } from '../../utils/hotelHelpers';
import { colors } from '@/constants/colors';

interface HotelPriceSummaryProps {
  hotelName: string;
  roomName: string;
  rateName: string;
  checkIn: string;
  checkOut: string;
  guests: { adults: number; children: number; rooms: number };
  totalPrice: number;
  currency: string;
  hotelImage?: string;
  hotelLocation?: string;
}

export const HotelPriceSummary: React.FC<HotelPriceSummaryProps> = ({
  hotelName,
  roomName,
  rateName,
  checkIn,
  checkOut,
  guests,
  totalPrice,
  currency,
  hotelImage,
  hotelLocation,
}) => {
  const nights = getNights(checkIn, checkOut);
  const pricePerNight = totalPrice / nights / guests.rooms;
  const totalGuests = guests.adults + guests.children;

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Rezervasyon Özeti</Text>

      {/* Otel bilgisi */}
      <View style={styles.hotelInfo}>
        {hotelImage ? (
          <Image 
            source={{ uri: hotelImage }} 
            style={styles.hotelImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.hotelIcon}>
            <Ionicons name="business" size={20} color={colors.primary[600]} />
          </View>
        )}
        <View style={styles.hotelDetails}>
          <Text style={styles.hotelName}>{hotelName}</Text>
          {hotelLocation && (
            <View style={styles.hotelLocationRow}>
              <Ionicons name="location" size={14} color={colors.text.secondary} />
              <Text style={styles.hotelLocationText}>{hotelLocation}</Text>
            </View>
          )}
          <Text style={styles.roomName}>
            <Text style={styles.roomLabel}>Oda: </Text>
            {roomName}
          </Text>
          <Text style={styles.rateName}>
            <Text style={styles.rateLabel}>Fiyat Seçeneği: </Text>
            {rateName}
          </Text>
        </View>
      </View>

      {/* Tarihler */}
      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={18} color={colors.text.secondary} />
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoText}>
            {formatDate(checkIn)} - {formatDate(checkOut)}
          </Text>
          <Text style={styles.infoSubtext}>{nights} gece</Text>
        </View>
      </View>

      {/* Misafirler */}
      <View style={styles.infoRow}>
        <Ionicons name="people-outline" size={18} color={colors.text.secondary} />
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoText}>
            {guests.rooms} oda, {totalGuests} misafir
          </Text>
          <Text style={styles.infoSubtext}>
            {guests.adults} yetişkin{guests.children > 0 ? `, ${guests.children} çocuk` : ''}
          </Text>
        </View>
      </View>

      {/* Fiyat detayları */}
      <View style={styles.priceDetails}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            Gecelik fiyat ({guests.rooms} oda)
          </Text>
          <Text style={styles.priceValue}>
            {formatPrice(pricePerNight * guests.rooms, currency)}
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            {nights} gece x {guests.rooms} oda
          </Text>
          <Text style={styles.priceValue}>
            {formatPrice(totalPrice, currency)}
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Vergiler ve ücretler</Text>
          <Text style={styles.priceIncluded}>Dahil</Text>
        </View>
      </View>

      {/* Toplam */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Toplam</Text>
        <Text style={styles.totalPrice}>
          {formatPrice(totalPrice, currency)}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  hotelInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    gap: 16,
  },
  hotelIcon: {
    width: 96,
    height: 96,
    borderRadius: 8,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  hotelImage: {
    width: 96,
    height: 96,
    borderRadius: 8,
    backgroundColor: colors.gray[200],
    marginRight: 16,
  },
  hotelLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  hotelLocationText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  hotelDetails: {
    flex: 1,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  roomName: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  roomLabel: {
    fontWeight: '500',
  },
  rateName: {
    fontSize: 12,
    color: colors.gray[500],
  },
  rateLabel: {
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  infoTextContainer: {
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  infoSubtext: {
    fontSize: 11,
    color: colors.gray[500],
  },
  priceDetails: {
    marginTop: 12,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.primary,
  },
  priceIncluded: {
    fontSize: 13,
    color: colors.primary[600],
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary[600],
  },
});

