import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { format, addDays, subDays, isSameDay, startOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { colors } from '@/constants/colors';

interface PriceDate {
  date: Date;
  price: number;
  currency: string;
}

interface PriceDateSelectorProps {
  origin: string;
  destination: string;
  departurePrices: PriceDate[];
  selectedDeparture: Date | null;
  onDateSelect: (date: Date) => void;
  loadingPrices: boolean;
  errorPrices: string | null;
  onOpenPriceAlert?: () => void;
  onToggleDirectOnly?: () => void;
  isDirectOnlyActive?: boolean;
  onOpenMobileFilter?: () => void;
  onOpenSort?: () => void;
}

export const PriceDateSelector: React.FC<PriceDateSelectorProps> = ({
  origin,
  destination,
  departurePrices,
  selectedDeparture,
  onDateSelect,
  loadingPrices,
  errorPrices,
  onOpenPriceAlert,
  onToggleDirectOnly,
  isDirectOnlyActive = false,
  onOpenMobileFilter,
  onOpenSort,
}) => {
  const [mobileStartDate, setMobileStartDate] = useState(() => {
    return selectedDeparture || new Date();
  });

  useEffect(() => {
    if (selectedDeparture) {
      setMobileStartDate(selectedDeparture);
    }
  }, [selectedDeparture]);

  const createMobileDateCards = () => {
    if (loadingPrices) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary[600]} />
        </View>
      );
    }

    if (errorPrices) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorPrices}</Text>
        </View>
      );
    }

    const days = Array.from({ length: 7 }, (_, i) => addDays(mobileStartDate, i));
    const today = new Date();

    return days.map((date, idx) => {
      const found = departurePrices.find((p) => isSameDay(p.date, date));
      const price = found ? found.price : null;
      const isSelected = selectedDeparture ? isSameDay(date, selectedDeparture) : false;
      const isToday = isSameDay(date, today);

      const dayNum = format(date, 'd', { locale: tr });
      const weekDay = format(date, 'EEE', { locale: tr });

      return (
        <TouchableOpacity
          key={date.toISOString()}
          style={[styles.dateCard, isSelected && styles.dateCardSelected]}
          onPress={() => onDateSelect(date)}
          activeOpacity={0.7}
        >
          <View style={[styles.priceBox, isSelected && styles.priceBoxSelected]}>
            <Text style={[styles.priceText, isSelected && styles.priceTextSelected]}>
              {price !== null ? `${price} €` : '-'}
            </Text>
          </View>
          <Text style={[styles.dayNum, isSelected && styles.dayNumSelected, isToday && !isSelected && styles.dayNumToday]}>
            {dayNum}
          </Text>
          <Text style={[styles.weekDay, isSelected && styles.weekDaySelected, isToday && !isSelected && styles.weekDayToday]}>
            {weekDay}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Mobil tarih seçici */}
      <View style={styles.mobileContainer}>
        <View style={styles.scrollContainer}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setMobileStartDate(subDays(mobileStartDate, 7))}
          >
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
          >
            {createMobileDateCards()}
          </ScrollView>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setMobileStartDate(addDays(mobileStartDate, 7))}
          >
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Ay adı */}
        <View style={styles.monthContainer}>
          <View style={styles.monthLine} />
          <Text style={styles.monthText}>
            {format(mobileStartDate, 'MMMM', { locale: tr })}
          </Text>
          <View style={styles.monthLine} />
        </View>

        {/* Aksiyon butonları */}
        {(onToggleDirectOnly || onOpenPriceAlert || onOpenMobileFilter || onOpenSort) && (
          <View style={styles.actionButtonsContainer}>
            {onToggleDirectOnly && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isDirectOnlyActive && styles.actionButtonActive
                ]}
                onPress={onToggleDirectOnly}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.actionButtonText,
                  isDirectOnlyActive && styles.actionButtonTextActive
                ]}>
                  Aktarmasız
                </Text>
              </TouchableOpacity>
            )}
            {onOpenPriceAlert && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onOpenPriceAlert}
                activeOpacity={0.7}
              >
                <Text style={styles.actionButtonText}>Alarm</Text>
              </TouchableOpacity>
            )}
            {onOpenMobileFilter && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onOpenMobileFilter}
                activeOpacity={0.7}
              >
                <Text style={styles.actionButtonText}>Filtreler</Text>
              </TouchableOpacity>
            )}
            {onOpenSort && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onOpenSort}
                activeOpacity={0.7}
              >
                <Text style={styles.actionButtonText}>Sırala</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingVertical: 8,
  },
  mobileContainer: {
    width: '100%',
  },
  scrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonText: {
    fontSize: 20,
    color: colors.primary[600],
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 8,
    gap: 8,
  },
  dateCard: {
    alignItems: 'center',
    minWidth: 48,
    paddingVertical: 4,
  },
  dateCardSelected: {
    // Selected state handled by child styles
  },
  priceBox: {
    width: '100%',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.primary[100],
    borderRadius: 4,
    marginBottom: 4,
  },
  priceBoxSelected: {
    backgroundColor: colors.primary[600],
  },
  priceText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.primary[700],
    textAlign: 'center',
  },
  priceTextSelected: {
    color: colors.text.inverse,
  },
  dayNum: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  dayNumSelected: {
    color: colors.primary[600],
    fontWeight: '700',
  },
  dayNumToday: {
    color: colors.info,
    fontWeight: '700',
  },
  weekDay: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  weekDaySelected: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  weekDayToday: {
    color: colors.info,
    fontWeight: '600',
  },
  monthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  monthLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[200],
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    paddingHorizontal: 12,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  actionButtonTextActive: {
    color: colors.text.inverse,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    textAlign: 'center',
  },
});








