import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { FlightReservation } from '@/types/travel';

interface FlightReservationCardProps {
  flight: FlightReservation;
  airRules?: any[];
  airRulesLoading?: boolean;
  airRulesError?: string | null;
  onOpenDetail?: (flight: FlightReservation) => void;
}

export const FlightReservationCard: React.FC<FlightReservationCardProps> = ({
  flight,
  airRules,
  airRulesLoading,
  airRulesError,
  onOpenDetail,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleToggleDetail = () => {
    setIsOpen(!isOpen);
    if (!isOpen && onOpenDetail) {
      onOpenDetail(flight);
    }
  };

  const handleCheckIn = () => {
    // Havayolu check-in URL'leri
    const checkInUrls: { [key: string]: string } = {
      'Turkish Airlines': 'https://www.turkishairlines.com/tr-int/online-services/online-check-in/',
      'Pegasus': 'https://www.flypgs.com/online-check-in',
      'SunExpress': 'https://www.sunexpress.com/tr/online-check-in/',
      'AnadoluJet': 'https://www.anadolujet.com/tr/online-check-in',
    };

    const url = checkInUrls[flight.airline];
    if (url) {
      Linking.openURL(url);
    } else {
      Alert.alert('Bilgi', 'Bu havayolu için otomatik yönlendirme bulunmuyor.');
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
        <View style={styles.routeInfo}>
          <Text style={styles.route}>
            {flight.from} → {flight.to}
          </Text>
          <Text style={styles.dateTime}>
            {formatDate(flight.date)} • {flight.time}
            {flight.arrivalTime ? ` - ${flight.arrivalTime}` : ''} • {flight.airline}
          </Text>
          <Text style={styles.pnr}>PNR: {flight.pnr}</Text>
          <Text style={styles.passengers}>
            Yolcu: {Array.isArray(flight.passengers) && flight.passengers.length > 0
              ? flight.passengers.map((p) => p?.name || 'Yolcu').join(', ')
              : 'Yolcu bilgisi yok'}
          </Text>
        </View>
        <View style={styles.priceSection}>
          <Text style={styles.price}>{flight.price}</Text>
          <Text style={[styles.status, { color: getStatusColor(flight.status) }]}>
            {flight.status}
          </Text>
          <TouchableOpacity style={styles.detailButton} onPress={handleToggleDetail}>
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
          {/* Yolcular Tablosu */}
          <Text style={styles.sectionTitle}>Yolcular</Text>
          {Array.isArray(flight.passengers) && flight.passengers.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Ad Soyad</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Koltuk</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Bagaj</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Bilet</Text>
              </View>
              {flight.passengers.map((passenger, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{passenger?.name || 'Yolcu'}</Text>
                  <Text style={styles.tableCell}>{passenger?.seat || '-'}</Text>
                  <Text style={styles.tableCell}>{passenger?.baggage || '-'}</Text>
                  <Text style={styles.tableCell}>{passenger?.ticketType || '-'}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.loadingText}>Yolcu bilgisi bulunamadı</Text>
          )}

          {/* Uçuş Bilgileri */}
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>PNR:</Text>
              <Text style={styles.infoValue}>{flight.pnr}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Havayolu:</Text>
              <Text style={styles.infoValue}>{flight.airline}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gidiş Tarihi:</Text>
              <Text style={styles.infoValue}>{formatDate(flight.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gidiş Saati:</Text>
              <Text style={styles.infoValue}>
                {flight.time}
                {flight.arrivalTime ? ` - ${flight.arrivalTime}` : ''}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Durum:</Text>
              <Text style={[styles.infoValue, { color: getStatusColor(flight.status) }]}>
                {flight.status}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fiyat:</Text>
              <Text style={styles.infoValue}>{flight.price}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ödeme:</Text>
              <Text style={styles.infoValue}>{flight.details.payment}</Text>
            </View>
          </View>

          {/* Bilet Kuralları */}
          <Text style={styles.sectionTitle}>Bilet Kuralları</Text>
          {airRulesLoading ? (
            <Text style={styles.loadingText}>Kurallar yükleniyor...</Text>
          ) : airRulesError ? (
            <Text style={styles.errorText}>{airRulesError}</Text>
          ) : airRules && airRules.length > 0 ? (
            <View style={styles.rulesContainer}>
              {airRules.map((rule, idx) => (
                <View key={idx} style={styles.ruleItem}>
                  <Text style={styles.ruleTitle}>{rule.title}:</Text>
                  <Text style={styles.ruleDetail}>{rule.detail}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.rulesText}>{flight.details.rules}</Text>
          )}

          {/* Aksiyonlar */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.checkInButton} onPress={handleCheckIn}>
              <Ionicons name="checkbox-outline" size={16} color="#fff" />
              <Text style={styles.checkInButtonText}>Online Check-in</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.serviceButton} disabled>
              <Ionicons name="briefcase-outline" size={16} color={colors.text.disabled} />
              <Text style={styles.serviceButtonText}>Ek Hizmet</Text>
            </TouchableOpacity>
          </View>
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
  routeInfo: {
    flex: 1,
  },
  route: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  pnr: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  passengers: {
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
    backgroundColor: colors.gray[200],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  detailButtonText: {
    fontSize: 12,
    color: colors.text.secondary,
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
    marginTop: 8,
  },
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tableHeaderText: {
    fontWeight: '600',
    color: colors.text.secondary,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: colors.text.primary,
  },
  infoGrid: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    width: 100,
  },
  infoValue: {
    fontSize: 12,
    color: colors.text.primary,
    flex: 1,
  },
  loadingText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
  },
  rulesContainer: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderRadius: 8,
    padding: 12,
  },
  ruleItem: {
    marginBottom: 6,
  },
  ruleTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary[700],
  },
  ruleDetail: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  rulesText: {
    fontSize: 12,
    color: colors.text.secondary,
    backgroundColor: colors.gray[50],
    padding: 12,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary[500],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  checkInButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  serviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  serviceButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.disabled,
  },
});

