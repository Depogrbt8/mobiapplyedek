import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { colors } from '@/constants/colors';

interface FlightResultsHeaderProps {
  origin: string;
  destination: string;
  departureDate: string;
  passengersCount: number;
  onEditPress: () => void;
}

export const FlightResultsHeader: React.FC<FlightResultsHeaderProps> = ({
  origin,
  destination,
  departureDate,
  passengersCount,
  onEditPress,
}) => {
  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = parseISO(dateStr);
      return format(d, 'dd MMM EEE', { locale: tr });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.infoContainer}>
          <Text style={styles.route}>{origin} - {destination}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaContainer}>
              <Text style={styles.metaText}>{formatShortDate(departureDate)}</Text>
              <View style={styles.passengerContainer}>
                <Ionicons name="people-outline" size={14} color={colors.text.secondary} />
                <Text style={styles.metaText}>{passengersCount}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={onEditPress}
              activeOpacity={0.7}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Text style={styles.editButtonText}>Düzenle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 10,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  route: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  passengerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary[600],
    textDecorationLine: 'underline',
  },
});

