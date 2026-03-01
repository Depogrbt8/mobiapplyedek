import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { CarReservation } from '@/types/travel';

interface CarReservationCardProps {
  car: CarReservation;
}

export const CarReservationCard: React.FC<CarReservationCardProps> = ({ car }) => {
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
    if (car.officePhone) {
      Linking.openURL(`tel:${car.officePhone}`);
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
        <View style={styles.carInfo}>
          <Text style={styles.carName}>{car.car}</Text>
          <Text style={styles.carType}>{car.type}</Text>
          <Text style={styles.location}>
            Alış: {car.pickupLocation} ({car.pickupCity})
          </Text>
          <Text style={styles.dates}>
            {formatDate(car.pickupDate)} {car.pickupTime}
          </Text>
          <Text style={styles.location}>
            Bırakış: {car.dropoffLocation} ({car.dropoffCity})
          </Text>
          <Text style={styles.dates}>
            {formatDate(car.dropoffDate)} {car.dropoffTime}
          </Text>
          <Text style={styles.renter}>Kiralayan: {car.renter}</Text>
        </View>
        <View style={styles.priceSection}>
          <Text style={styles.price}>{car.price}</Text>
          <Text style={[styles.status, { color: getStatusColor(car.status) }]}>
            {car.status}
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
          <Text style={styles.sectionTitle}>Araç Bilgileri</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Araç:</Text>
              <Text style={styles.infoValue}>{car.car}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tip:</Text>
              <Text style={styles.infoValue}>{car.type}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Plaka:</Text>
              <Text style={styles.infoValue}>{car.plate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Alış Yeri:</Text>
              <Text style={styles.infoValue}>
                {car.pickupLocation} ({car.pickupCity})
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Alış Tarihi:</Text>
              <Text style={styles.infoValue}>
                {formatDate(car.pickupDate)} {car.pickupTime}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bırakış Yeri:</Text>
              <Text style={styles.infoValue}>
                {car.dropoffLocation} ({car.dropoffCity})
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bırakış Tarihi:</Text>
              <Text style={styles.infoValue}>
                {formatDate(car.dropoffDate)} {car.dropoffTime}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rezervasyon No:</Text>
              <Text style={styles.infoValue}>{car.reservationNo}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Durum:</Text>
              <Text style={[styles.infoValue, { color: getStatusColor(car.status) }]}>
                {car.status}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kiralayan:</Text>
              <Text style={styles.infoValue}>{car.renter}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fiyat:</Text>
              <Text style={styles.infoValue}>{car.price}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ödeme:</Text>
              <Text style={styles.infoValue}>{car.payment}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ofis Tel:</Text>
              <TouchableOpacity onPress={handleCall}>
                <Text style={[styles.infoValue, styles.phoneLink]}>{car.officePhone}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Ek Hizmetler */}
          <Text style={styles.sectionTitle}>Ek Hizmetler</Text>
          <View style={styles.servicesContainer}>
            {car.services.map((service, index) => (
              <View key={index} style={styles.serviceTag}>
                <Ionicons name="checkmark-circle" size={14} color="#f97316" />
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>

          {/* Kurallar */}
          <Text style={styles.sectionTitle}>Kurallar</Text>
          <Text style={styles.rulesText}>{car.rules}</Text>

          {/* Notlar */}
          {car.notes && (
            <>
              <Text style={styles.sectionTitle}>Notlar</Text>
              <Text style={styles.notesText}>{car.notes}</Text>
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
  carInfo: {
    flex: 1,
  },
  carName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#c2410c', // orange-700
    marginBottom: 4,
  },
  carType: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  dates: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  renter: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
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
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed', // orange-50
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  serviceText: {
    fontSize: 12,
    color: '#c2410c', // orange-700
  },
  rulesText: {
    fontSize: 12,
    color: colors.text.secondary,
    backgroundColor: colors.gray[50],
    padding: 12,
    borderRadius: 8,
    lineHeight: 18,
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









