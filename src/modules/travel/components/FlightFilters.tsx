import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CustomSlider } from './CustomSlider';
import { colors } from '@/constants/colors';
import type { Flight } from '@/types/flight';

interface FlightFiltersProps {
  flights: Flight[];
  selectedAirlines: string[];
  onAirlinesChange: (airlines: string[]) => void;
  maxPrice: number;
  onMaxPriceChange: (price: number) => void;
  priceRange: [number, number];
  departureHourRange: [number, number];
  onDepartureHourRangeChange: (range: [number, number]) => void;
  arrivalHourRange: [number, number];
  onArrivalHourRangeChange: (range: [number, number]) => void;
  flightDurationRange: [number, number];
  onFlightDurationRangeChange: (range: [number, number]) => void;
  maxStops: number;
  onMaxStopsChange: (stops: number) => void;
  selectedCabinClass: string;
  onCabinClassChange: (cabinClass: string) => void;
  onApply: () => void;
  onReset: () => void;
}

export const FlightFilters: React.FC<FlightFiltersProps> = ({
  flights,
  selectedAirlines,
  onAirlinesChange,
  maxPrice,
  onMaxPriceChange,
  priceRange,
  departureHourRange,
  onDepartureHourRangeChange,
  arrivalHourRange,
  onArrivalHourRangeChange,
  flightDurationRange,
  onFlightDurationRangeChange,
  maxStops,
  onMaxStopsChange,
  selectedCabinClass,
  onCabinClassChange,
  onApply,
  onReset,
}) => {
  // Tüm havayollarını bul
  const allAirlines = Array.from(new Set(flights.map((f) => f.airlineName))).sort();

  const handleAirlineToggle = (airline: string) => {
    if (selectedAirlines.includes(airline)) {
      onAirlinesChange(selectedAirlines.filter((a) => a !== airline));
    } else {
      onAirlinesChange([...selectedAirlines, airline]);
    }
  };

  const formatHour = (hour: number) => {
    return `${Math.floor(hour)}:${String((hour % 1) * 60).padStart(2, '0')}`;
  };

  const formatDuration = (hours: number) => {
    return `${Math.floor(hours)}s`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Havayolu filtresi */}
      {allAirlines.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Havayolu</Text>
          <View style={styles.checkboxContainer}>
            {allAirlines.map((airline) => (
              <TouchableOpacity
                key={airline}
                style={styles.checkboxRow}
                onPress={() => handleAirlineToggle(airline)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, selectedAirlines.includes(airline) && styles.checkboxChecked]}>
                  {selectedAirlines.includes(airline) && (
                    <Ionicons name="checkmark" size={16} color={colors.text.inverse} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{airline}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Bilet Fiyatı Filtresi */}
      {flights.length > 0 && (
        <View style={styles.section}>
          <CustomSlider
            label="Maksimum Fiyat"
            min={priceRange[0]}
            max={priceRange[1]}
            value={maxPrice}
            onChange={(value) => onMaxPriceChange(value as number)}
            step={1}
            leftLabel={`${priceRange[0]} EUR`}
            rightLabel={`${maxPrice} EUR`}
          />
        </View>
      )}

      {/* Kalkış Saati Filtresi */}
      {flights.length > 0 && (
        <View style={styles.section}>
          <CustomSlider
            label="Kalkış Saati"
            min={0}
            max={24}
            value={departureHourRange}
            onChange={(value) => onDepartureHourRangeChange(value as [number, number])}
            range={true}
            step={1}
            leftLabel={`${departureHourRange[0]}:00`}
            rightLabel={`${departureHourRange[1]}:00`}
          />
        </View>
      )}

      {/* Varış Saati Filtresi */}
      {flights.length > 0 && (
        <View style={styles.section}>
          <CustomSlider
            label="Varış Saati"
            min={0}
            max={24}
            value={arrivalHourRange}
            onChange={(value) => onArrivalHourRangeChange(value as [number, number])}
            range={true}
            step={1}
            leftLabel={`${arrivalHourRange[0]}:00`}
            rightLabel={`${arrivalHourRange[1]}:00`}
          />
        </View>
      )}

      {/* Uçuş Süresi Filtresi */}
      {flights.length > 0 && (
        <View style={styles.section}>
          <CustomSlider
            label="Uçuş Süresi (Saat)"
            min={0}
            max={24}
            value={flightDurationRange}
            onChange={(value) => onFlightDurationRangeChange(value as [number, number])}
            range={true}
            step={1}
            leftLabel={`${flightDurationRange[0]}s`}
            rightLabel={`${flightDurationRange[1]}s`}
          />
        </View>
      )}

      {/* Aktarma Sayısı Filtresi */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Maksimum Aktarma</Text>
        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => onMaxStopsChange(0)}
            activeOpacity={0.7}
          >
            <View style={[styles.radio, maxStops === 0 && styles.radioSelected]}>
              {maxStops === 0 && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>Direkt uçuşlar (0 aktarma)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => onMaxStopsChange(1)}
            activeOpacity={0.7}
          >
            <View style={[styles.radio, maxStops === 1 && styles.radioSelected]}>
              {maxStops === 1 && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>En fazla 1 aktarma</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => onMaxStopsChange(2)}
            activeOpacity={0.7}
          >
            <View style={[styles.radio, maxStops === 2 && styles.radioSelected]}>
              {maxStops === 2 && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>En fazla 2 aktarma</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Kabin Sınıfı Filtresi */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kabin Sınıfı</Text>
        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => onCabinClassChange('economy')}
            activeOpacity={0.7}
          >
            <View style={[styles.radio, selectedCabinClass === 'economy' && styles.radioSelected]}>
              {selectedCabinClass === 'economy' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>Ekonomi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => onCabinClassChange('business')}
            activeOpacity={0.7}
          >
            <View style={[styles.radio, selectedCabinClass === 'business' && styles.radioSelected]}>
              {selectedCabinClass === 'business' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>Business</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => onCabinClassChange('first')}
            activeOpacity={0.7}
          >
            <View style={[styles.radio, selectedCabinClass === 'first' && styles.radioSelected]}>
              {selectedCabinClass === 'first' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>First Class</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Butonlar */}
      <View style={styles.buttonContainer}>
        <Button
          title="Sıfırla"
          variant="outline"
          onPress={onReset}
          style={styles.resetButton}
        />
        <Button
          title="Uygula"
          onPress={onApply}
          style={styles.applyButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  checkboxContainer: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text.primary,
  },
  radioContainer: {
    gap: 12,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: colors.primary[600],
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary[600],
  },
  radioLabel: {
    fontSize: 14,
    color: colors.text.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
});
