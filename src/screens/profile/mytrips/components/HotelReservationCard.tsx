import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { HotelReservation } from '@/types/travel';

interface HotelReservationCardProps {
  hotel: HotelReservation;
}

export const HotelReservationCard: React.FC<HotelReservationCardProps> = ({ hotel }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleCall = () => {
    if (hotel.phone) {
      Linking.openURL(`tel:${hotel.phone}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'onaylandı':
      case 'confirmed':
        return colors.primary[600];
      case 'beklemede':
      case 'pending':
        return colors.secondary[500];
      case 'iptal':
      case 'cancelled':
        return '#ef4444';
      default:
        return colors.text.secondary;
    }
  };

  return (
    <View style={styles.container}>
      {/* Özet Bilgi */}
      <View style={styles.header}>
        <View style={styles.hotelInfo}>
          <Text style={styles.hotelName}>{hotel.hotelName}</Text>
          <Text style={styles.location}>{hotel.location}</Text>
          <Text style={styles.dates}>
            Giriş: {formatDate(hotel.checkIn)} {hotel.checkInTime}
          </Text>
          <Text style={styles.dates}>
            Çıkış: {formatDate(hotel.checkOut)} {hotel.checkOutTime}
          </Text>
          <Text style={styles.room}>Oda: {hotel.roomType}</Text>
          <Text style={styles.guests}>
            Konuklar: {hotel.guests.map((g) => g.name).join(', ')}
          </Text>
        </View>
        <View style={styles.priceSection}>
          <Text style={styles.price}>{hotel.price}</Text>
          <Text style={[styles.status, { color: getStatusColor(hotel.status) }]}>
            {hotel.status}
          </Text>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => setIsOpen(!isOpen)}
          >
            <Text style={styles.detailButtonText}>Detay</Text>
            <Ionicons
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Detay Alanı */}
      {isOpen && (
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Otel Bilgileri</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Otel:</Text>
              <Text style={styles.infoValue}>{hotel.hotelName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Adres:</Text>
              <Text style={styles.infoValue}>{hotel.address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Telefon:</Text>
              <TouchableOpacity onPress={handleCall}>
                <Text style={[styles.infoValue, styles.phoneLink]}>{hotel.phone}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Giriş:</Text>
              <Text style={styles.infoValue}>
                {formatDate(hotel.checkIn)} {hotel.checkInTime}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Çıkış:</Text>
              <Text style={styles.infoValue}>
                {formatDate(hotel.checkOut)} {hotel.checkOutTime}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Oda Tipi:</Text>
              <Text style={styles.infoValue}>{hotel.roomType}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Konuklar:</Text>
              <Text style={styles.infoValue}>
                {hotel.guests.map((g) => `${g.name} (${g.type})`).join(', ')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rezervasyon No:</Text>
              <Text style={styles.infoValue}>{hotel.reservationNo}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Durum:</Text>
              <Text style={[styles.infoValue, { color: getStatusColor(hotel.status) }]}>
                {hotel.status}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fiyat:</Text>
              <Text style={styles.infoValue}>{hotel.price}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ödeme:</Text>
              <Text style={styles.infoValue}>{hotel.payment}</Text>
            </View>
          </View>

          {/* Kurallar */}
          <Text style={styles.sectionTitle}>Kurallar</Text>
          <Text style={styles.rulesText}>{hotel.rules}</Text>

          {/* Ek Hizmetler */}
          <Text style={styles.sectionTitle}>Ek Hizmetler</Text>
          <View style={styles.servicesContainer}>
            {hotel.services.map((service, index) => (
              <View key={index} style={styles.serviceTag}>
                <Ionicons name="checkmark-circle" size={14} color={colors.primary[600]} />
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>

          {/* Notlar */}
          {hotel.notes && (
            <>
              <Text style={styles.sectionTitle}>Notlar</Text>
              <Text style={styles.notesText}>{hotel.notes}</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary[600],
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  dates: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  room: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  guests: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  detailButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  detailSection: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    padding: 16,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
    marginTop: 12,
  },
  infoGrid: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    width: 110,
  },
  infoValue: {
    fontSize: 12,
    color: colors.text.primary,
    flex: 1,
  },
  phoneLink: {
    color: colors.secondary[600],
    textDecorationLine: 'underline',
  },
  rulesText: {
    fontSize: 12,
    color: colors.text.secondary,
    backgroundColor: colors.gray[50],
    padding: 12,
    borderRadius: 8,
    lineHeight: 18,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  serviceText: {
    fontSize: 12,
    color: colors.primary[700],
  },
  notesText: {
    fontSize: 12,
    color: colors.text.secondary,
    backgroundColor: colors.gray[50],
    padding: 12,
    borderRadius: 8,
    fontStyle: 'italic',
  },
});

