import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Modal, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '../components/DatePicker';
import { DateRangePicker } from '../components/DateRangePicker';
import { searchLocations } from '../services/hotelService';
import type { LocationSuggestion } from '../types/hotel';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';

type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/HotelSearch'>;

interface HotelSearchScreenProps {
  onNavigateToResults?: (searchParams: any) => void;
  initialLocation?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: number;
  initialChildren?: number;
  initialRooms?: number;
  isModal?: boolean;
}

export const HotelSearchScreen: React.FC<HotelSearchScreenProps> = ({ 
  onNavigateToResults,
  initialLocation = '',
  initialCheckIn,
  initialCheckOut,
  initialAdults = 2,
  initialChildren = 0,
  initialRooms = 1,
  isModal = false,
}) => {
  const navigation = useNavigation<any>();
  const [location, setLocation] = useState(initialLocation);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | null>(
    initialCheckIn ? new Date(initialCheckIn) : null
  );
  const [checkOut, setCheckOut] = useState<Date | null>(
    initialCheckOut ? new Date(initialCheckOut) : null
  );
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [rooms, setRooms] = useState(initialRooms);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const locationInputRef = useRef<TextInput>(null);

  // Initial değerler değiştiğinde state'i güncelle
  useEffect(() => {
    if (initialLocation) setLocation(initialLocation);
    if (initialCheckIn) setCheckIn(new Date(initialCheckIn));
    if (initialCheckOut) setCheckOut(new Date(initialCheckOut));
    if (initialAdults) setAdults(initialAdults);
    if (initialChildren !== undefined) setChildren(initialChildren);
    if (initialRooms) setRooms(initialRooms);
  }, [initialLocation, initialCheckIn, initialCheckOut, initialAdults, initialChildren, initialRooms]);

  // Konum arama
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (location.length >= 2) {
        const suggestions = await searchLocations(location);
        setLocationSuggestions(suggestions);
        setShowLocationSuggestions(true);
      } else {
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [location]);

  // Konum seç
  const handleSelectLocation = (suggestion: LocationSuggestion) => {
    setLocation(suggestion.name);
    setShowLocationSuggestions(false);
  };

  const handleSearch = () => {
    if (!location || !checkIn || !checkOut) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    const searchParams = {
      location,
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      guests: {
        adults,
        children,
        rooms,
      },
      children,
      rooms,
      childAges: childAges.slice(0, children),
    };

    // HotelResults'a navigate et
    // Eğer onNavigateToResults callback'i varsa (HomeScreen'den çağrılıyorsa), onu kullan
    if (onNavigateToResults) {
      onNavigateToResults(searchParams);
    } else {
      // TravelStack içindeysek direkt navigate et
      navigation.navigate('Travel/HotelResults', { searchParams });
    }
  };

  const isFormValid = location && checkIn && checkOut;

  // Misafir özeti (mobil için - ana sitedeki gibi)
  const guestSummaryMobile = () => {
    return `${adults} Yetişkin, ${rooms} Oda`;
  };


  return (
    <View style={[styles.contentContainer, isModal && styles.contentContainerModal]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={[styles.content, isModal && styles.contentModal]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Ana sitedeki mobil görünüm - Container */}
          <View style={styles.formContainer}>
            {/* Konum Input - Ana sitedeki gibi */}
            <View style={styles.locationContainer}>
              <View style={styles.locationInputWrapper}>
                <Ionicons name="location" size={20} color={colors.gray[600]} style={styles.locationIcon} />
                <TextInput
                  ref={locationInputRef}
                  style={styles.locationInput}
                  placeholder="Şehir veya otel adı"
                  placeholderTextColor={colors.gray[600]}
                  value={location}
                  onChangeText={setLocation}
                  onFocus={() => {
                    if (location.length >= 2) {
                      setShowLocationSuggestions(true);
                    }
                  }}
                />
                {location && (
                  <TouchableOpacity
                    onPress={() => {
                      setLocation('');
                      setShowLocationSuggestions(false);
                    }}
                    style={styles.clearButton}
                  >
                    <Ionicons name="close" size={16} color={colors.gray[400]} />
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Konum önerileri */}
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {locationSuggestions.map(suggestion => (
                    <TouchableOpacity
                      key={suggestion.id}
                      style={styles.suggestionItem}
                      onPress={() => handleSelectLocation(suggestion)}
                    >
                      <Text style={styles.suggestionName}>{suggestion.name}</Text>
                      <Text style={styles.suggestionSubtext}>
                        {suggestion.country} • {suggestion.hotelCount || 0} otel
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Tarih Kutuları - Range Picker ile */}
            <View style={styles.dateRow}>
              <DateRangePicker
                checkIn={checkIn}
                checkOut={checkOut}
                onCheckInChange={(date) => {
                  setCheckIn(date);
                  if (date && checkOut && date >= checkOut) {
                    const newCheckOut = new Date(date);
                    newCheckOut.setDate(newCheckOut.getDate() + 2);
                    setCheckOut(newCheckOut);
                  }
                }}
                onCheckOutChange={(date) => {
                  setCheckOut(date);
                  if (date && checkIn && date <= checkIn) {
                    const newCheckIn = new Date(date);
                    newCheckIn.setDate(newCheckIn.getDate() - 2);
                    setCheckIn(newCheckIn);
                  }
                }}
                minimumDate={new Date()}
              />
            </View>

            {/* Misafir seçimi - Ana sitedeki gibi */}
            <View style={styles.guestSelectorContainer}>
              <View style={styles.guestSelectorWrapper}>
                <Text style={styles.guestSummaryText}>{guestSummaryMobile()}</Text>
                <TouchableOpacity
                  style={styles.addGuestButton}
                  onPress={() => setShowGuestSelector(true)}
                >
                  <Ionicons name="add" size={20} color={colors.gray[800]} />
                  <Text style={styles.addGuestText}>Konuk Ekle</Text>
                </TouchableOpacity>
              </View>
            </View>

        {/* Misafir Seçimi Modal */}
        <Modal
          visible={showGuestSelector}
          transparent
          animationType="slide"
          onRequestClose={() => setShowGuestSelector(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowGuestSelector(false)}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Misafir ve Oda</Text>
                <TouchableOpacity onPress={() => setShowGuestSelector(false)}>
                  <Ionicons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {/* Odalar */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Oda</Text>
                  <View style={styles.counterRow}>
                    <TouchableOpacity
                      style={[styles.counterButton, rooms <= 1 && styles.counterButtonDisabled]}
                      onPress={() => setRooms(Math.max(1, rooms - 1))}
                      disabled={rooms <= 1}
                    >
                      <Ionicons name="remove" size={20} color={rooms <= 1 ? colors.gray[400] : colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{rooms}</Text>
                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={() => setRooms(rooms + 1)}
                    >
                      <Ionicons name="add" size={20} color={colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Yetişkinler */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Yetişkin</Text>
                  <View style={styles.counterRow}>
                    <TouchableOpacity
                      style={[styles.counterButton, adults <= 1 && styles.counterButtonDisabled]}
                      onPress={() => setAdults(Math.max(1, adults - 1))}
                      disabled={adults <= 1}
                    >
                      <Ionicons name="remove" size={20} color={adults <= 1 ? colors.gray[400] : colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{adults}</Text>
                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={() => setAdults(adults + 1)}
                    >
                      <Ionicons name="add" size={20} color={colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Çocuklar */}
                <View style={styles.modalSection}>
                  <View>
                    <Text style={styles.modalSectionTitle}>Çocuk</Text>
                    <Text style={styles.modalSectionSubtitle}>0-17 yaş</Text>
                  </View>
                  <View style={styles.counterRow}>
                    <TouchableOpacity
                      style={[styles.counterButton, children <= 0 && styles.counterButtonDisabled]}
                      onPress={() => {
                        setChildren(Math.max(0, children - 1));
                        setChildAges((prev) => prev.slice(0, Math.max(0, children - 1)));
                      }}
                      disabled={children <= 0}
                    >
                      <Ionicons name="remove" size={20} color={children <= 0 ? colors.gray[400] : colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{children}</Text>
                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={() => {
                        setChildren(children + 1);
                        setChildAges((prev) => [...prev, 7]);
                      }}
                    >
                      <Ionicons name="add" size={20} color={colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Çocuk yaşları */}
                {children > 0 && (
                  <View style={styles.childAgesContainer}>
                    {Array.from({ length: children }).map((_, idx) => (
                      <View key={idx} style={styles.childAgeRow}>
                        <Text style={styles.childAgeLabel}>Çocuk {idx + 1} Yaşı</Text>
                        <View style={styles.ageSelector}>
                          <Text style={styles.ageValue}>{childAges[idx] || 7}</Text>
                          <View style={styles.ageButtons}>
                            <TouchableOpacity
                              style={styles.ageButton}
                              onPress={() => {
                                const newAges = [...childAges];
                                newAges[idx] = Math.max(0, (newAges[idx] || 7) - 1);
                                setChildAges(newAges);
                              }}
                            >
                              <Ionicons name="chevron-down" size={16} color={colors.text.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.ageButton}
                              onPress={() => {
                                const newAges = [...childAges];
                                newAges[idx] = Math.min(17, (newAges[idx] || 7) + 1);
                                setChildAges(newAges);
                              }}
                            >
                              <Ionicons name="chevron-up" size={16} color={colors.text.primary} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button
                  title="Tamam"
                  onPress={() => setShowGuestSelector(false)}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </Modal>

            {/* Otel Ara Butonu - Ana sitedeki gibi */}
            <TouchableOpacity
              style={[styles.searchButton, !isFormValid && styles.searchButtonDisabled]}
              onPress={handleSearch}
              disabled={!isFormValid}
            >
              <Text style={styles.searchButtonText}>Otel Ara</Text>
            </TouchableOpacity>
          </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainerModal: {
    flex: 0,
  },
  contentModal: {
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 20,
  },
  // Ana sitedeki mobil görünüm - Container
  formContainer: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  // Konum Input - Ana sitedeki gibi
  locationContainer: {
    marginBottom: 8,
    zIndex: 1000,
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: colors.background,
  },
  locationIcon: {
    marginRight: 4,
  },
  locationInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
    padding: 0,
    minWidth: 0,
  },
  clearButton: {
    marginLeft: 4,
    padding: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    maxHeight: 192,
    zIndex: 2000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  suggestionSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  // Tarih Kutuları - Ana sitedeki gibi
  dateRow: {
    marginBottom: 8,
  },
  // Misafir seçimi - Ana sitedeki gibi
  guestSelectorContainer: {
    marginBottom: 12,
  },
  guestSelectorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: colors.background,
  },
  guestSummaryText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray[800],
  },
  addGuestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addGuestText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray[800],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  modalBody: {
    padding: 16,
  },
  modalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  modalSectionSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  counterButtonDisabled: {
    opacity: 0.5,
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    minWidth: 32,
    textAlign: 'center',
  },
  childAgesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  childAgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  childAgeLabel: {
    fontSize: 14,
    color: colors.text.primary,
  },
  ageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ageValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    minWidth: 24,
    textAlign: 'center',
    marginRight: 8,
  },
  ageButtons: {
    flexDirection: 'column',
  },
  ageButton: {
    padding: 2,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  // Otel Ara Butonu - Ana sitedeki gibi
  searchButton: {
    width: '100%',
    backgroundColor: colors.primary[500],
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});

