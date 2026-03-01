// Araç Arama Ekranı - Desktop (grbt8) MOBILE tasarımı birebir React Native
// lg:hidden bölümü satır satır uyarlandı:
// - Beyaz kart (rounded-2xl, border, shadow)
// - "Farklı yerde teslim" sağ üst köşede checkbox
// - Lokasyon: h-12, rounded-xl, MapPin icon, font-medium
// - Tarih+Saat aynı satırda: Tarih flex-1, Saat flex-1 (dar)
// - Tarih: h-10, rounded-lg, Calendar icon + formatlı tarih (font-semibold)
// - Saat: h-10, rounded-lg, Clock icon + saat (font-semibold)
// - Gap-2 (8px) her yerde
// - Araç Ara: h-12, bg-green-500, rounded-xl, Search icon

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { DatePicker } from '../components/DatePicker';
import { CarLocationSearch } from '../components/CarLocationSearch';
import type { LocationSearchResult, SimpleCarSearchParams } from '../types/car';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';

type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/CarSearch'>;

// Saat seçenekleri (desktop ile birebir: 00:00 - 23:30, 30 dk aralık)
const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`);
}

export const CarSearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [pickupLocation, setPickupLocation] = useState<LocationSearchResult | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<LocationSearchResult | null>(null);
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState('10:00');
  const [dropoffDate, setDropoffDate] = useState<Date | null>(null);
  const [dropoffTime, setDropoffTime] = useState('10:00');
  const [sameLocation, setSameLocation] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Saat seçici modal state
  const [showTimePicker, setShowTimePicker] = useState<'pickup' | 'dropoff' | null>(null);

  const handleSearch = useCallback(async () => {
    if (!pickupLocation) {
      Alert.alert('Hata', 'Lütfen alış lokasyonu seçin');
      return;
    }
    if (!sameLocation && !dropoffLocation) {
      Alert.alert('Hata', 'Lütfen teslim lokasyonu seçin');
      return;
    }
    if (!pickupDate || !dropoffDate) {
      Alert.alert('Hata', 'Lütfen tarih seçin');
      return;
    }

    setIsSearching(true);

    const effectiveDropoff = sameLocation ? pickupLocation : dropoffLocation!;

    const searchParams: SimpleCarSearchParams = {
      pickupLocationId: pickupLocation.id,
      pickupLocationName: pickupLocation.name,
      dropoffLocationId: effectiveDropoff.id,
      dropoffLocationName: effectiveDropoff.name,
      pickupDate: format(pickupDate, 'yyyy-MM-dd'),
      pickupTime,
      dropoffDate: format(dropoffDate, 'yyyy-MM-dd'),
      dropoffTime,
      driverAge: 30,
    };

    navigation.navigate('Travel/CarResults', { searchParams });
    setIsSearching(false);
  }, [
    pickupLocation, dropoffLocation, sameLocation,
    pickupDate, pickupTime, dropoffDate, dropoffTime, navigation,
  ]);

  const isFormValid = pickupLocation && pickupDate && dropoffDate && (sameLocation || dropoffLocation);

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ============ ANA KART (desktop: bg-white rounded-2xl border shadow p-4) ============ */}
          <View style={styles.card}>
            {/* Sağ üst: "Farklı yerde teslim" checkbox (desktop: absolute right-4 top-4) */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => {
                const newVal = !sameLocation;
                setSameLocation(newVal);
                if (newVal && pickupLocation) {
                  setDropoffLocation(pickupLocation);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, !sameLocation && styles.checkboxChecked]}>
                {!sameLocation && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              <Text style={styles.checkboxLabel}>Farklı yerde teslim</Text>
            </TouchableOpacity>

            {/* ============ FORM ALANLARI (desktop: flex-col gap-2 pt-6) ============ */}
            <View style={styles.formFields}>
              {/* ALIŞ LOKASYONU (desktop mobile: h-12, rounded-xl, MapPin, placeholder='Alış Lokasyonu') */}
              <CarLocationSearch
                label="Alış Lokasyonu"
                value={pickupLocation}
                onSelect={(loc) => {
                  setPickupLocation(loc);
                  if (sameLocation) setDropoffLocation(loc);
                }}
                placeholder="Alış Lokasyonu"
              />

              {/* TESLİM LOKASYONU (desktop mobile: sadece !sameLocation ise, placeholder='Teslim Lokasyonu') */}
              {!sameLocation && (
                <CarLocationSearch
                  label="Teslim Lokasyonu"
                  value={dropoffLocation}
                  onSelect={setDropoffLocation}
                  placeholder="Teslim Lokasyonu"
                />
              )}

              {/* ===== ALIŞ TARİHİ + SAAT (desktop mobile: flex-row flex-wrap gap-2) ===== */}
              <View style={styles.dateTimeRow}>
                {/* Alış Tarihi (desktop: flex-1 min-w-[150px], h-10, rounded-lg, Calendar + d MMM) */}
                <View style={styles.dateField}>
                  <DatePicker
                    value={pickupDate}
                    onChange={setPickupDate}
                    minimumDate={new Date()}
                    placeholder="Alış Tarihi"
                    dateFormat="d MMM"
                    iconSize={16}
                    iconColor={colors.gray[400]}
                    textStyle={{ fontWeight: '600', textAlign: 'left' }}
                    containerStyle={{ marginBottom: 0 }}
                  />
                </View>

                {/* Alış Saati (desktop: flex-1 min-w-[110px], h-10, rounded-lg, Clock + saat) */}
                <View style={styles.timeField}>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowTimePicker('pickup')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="time-outline" size={16} color={colors.gray[400]} />
                    <Text style={styles.timeText}>{pickupTime || '10:00'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ===== TESLİM TARİHİ + SAAT (desktop mobile: flex-row flex-wrap gap-2) ===== */}
              <View style={styles.dateTimeRow}>
                {/* Teslim Tarihi */}
                <View style={styles.dateField}>
                  <DatePicker
                    value={dropoffDate}
                    onChange={setDropoffDate}
                    minimumDate={pickupDate || new Date()}
                    placeholder="Teslim Tarihi"
                    dateFormat="d MMM"
                    iconSize={16}
                    iconColor={colors.gray[400]}
                    textStyle={{ fontWeight: '600', textAlign: 'left' }}
                    containerStyle={{ marginBottom: 0 }}
                  />
                </View>

                {/* Teslim Saati */}
                <View style={styles.timeField}>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowTimePicker('dropoff')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="time-outline" size={16} color={colors.gray[400]} />
                    <Text style={styles.timeText}>{dropoffTime || '10:00'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ===== ARAÇ ARA BUTONU (desktop: h-12, bg-green-500, rounded-xl, shadow-md) ===== */}
              <TouchableOpacity
                style={[
                  styles.searchButton,
                  (!isFormValid || isSearching) && styles.searchButtonDisabled,
                ]}
                onPress={handleSearch}
                disabled={!isFormValid || isSearching}
                activeOpacity={0.8}
              >
                {isSearching ? (
                  <>
                    <Ionicons name="reload" size={20} color="#fff" />
                    <Text style={styles.searchButtonText}>Aranıyor...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="search" size={20} color="#fff" />
                    <Text style={styles.searchButtonText}>Araç Ara</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ============ SAAT SEÇİCİ MODAL (desktop: TimeInput popup) ============ */}
      <Modal
        visible={showTimePicker !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(null)}
      >
        <View style={styles.timeModalOverlay}>
          <SafeAreaView style={styles.timeModalContainer}>
            <View style={styles.timeModalHeader}>
              <TouchableOpacity onPress={() => setShowTimePicker(null)}>
                <Text style={styles.timeModalCancel}>İptal</Text>
              </TouchableOpacity>
              <Text style={styles.timeModalTitle}>
                {showTimePicker === 'pickup' ? 'Alış Saati' : 'Teslim Saati'}
              </Text>
              <TouchableOpacity onPress={() => setShowTimePicker(null)}>
                <Text style={styles.timeModalDone}>Tamam</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.timeModalList}
              showsVerticalScrollIndicator={false}
            >
              {TIME_OPTIONS.map((time) => {
                const currentTime = showTimePicker === 'pickup' ? pickupTime : dropoffTime;
                const isSelected = currentTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    style={[styles.timeOption, isSelected && styles.timeOptionSelected]}
                    onPress={() => {
                      if (showTimePicker === 'pickup') {
                        setPickupTime(time);
                      } else {
                        setDropoffTime(time);
                      }
                      setShowTimePicker(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        isSelected && styles.timeOptionTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface, // Arka plan (desktop: sayfa bg)
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },

  // ===== ANA KART (desktop: bg-white rounded-2xl border border-gray-200 shadow-sm p-4) =====
  card: {
    backgroundColor: '#fff',
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  // ===== SAĞ ÜST CHECKBOX (desktop: absolute right-4 top-4) =====
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    marginBottom: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  checkboxLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.primary,
  },

  // ===== FORM ALANLARI (desktop: flex-col gap-2) =====
  formFields: {
    gap: 8, // gap-2
  },

  // ===== TARİH + SAAT SATIRI (desktop: flex-row flex-wrap gap-2) =====
  dateTimeRow: {
    flexDirection: 'row',
    gap: 8, // gap-2
  },
  dateField: {
    flex: 1, // flex-1 min-w-[150px]
  },
  timeField: {
    width: 110, // min-w-[110px] ama sabit genişlik
    justifyContent: 'flex-end', // tarih ile aynı hizaya
  },

  // ===== SAAT BUTONU (desktop: h-10, border gray-300, rounded-lg, Clock icon) =====
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40, // h-10
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8, // rounded-lg
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },

  // ===== ARAÇ ARA BUTONU (desktop: h-12, bg-green-500, rounded-xl, shadow-md) =====
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48, // h-12
    backgroundColor: colors.primary[500], // bg-green-500
    borderRadius: 12, // rounded-xl
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 4,
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchButtonText: {
    fontSize: 18, // text-lg
    fontWeight: '600', // font-semibold
    color: '#fff',
  },

  // ===== SAAT SEÇİCİ MODAL (desktop: TimeInput portal popup) =====
  timeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  timeModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '50%',
    paddingBottom: 20,
  },
  timeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  timeModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  timeModalCancel: {
    fontSize: 15,
    color: colors.text.secondary,
  },
  timeModalDone: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary[600],
  },
  timeModalList: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeOption: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 1,
  },
  timeOptionSelected: {
    backgroundColor: colors.primary[50],
  },
  timeOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[700],
  },
  timeOptionTextSelected: {
    color: colors.primary[700],
    fontWeight: '600',
  },
});
