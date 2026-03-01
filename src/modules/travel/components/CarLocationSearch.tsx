// Araç Lokasyon Arama Input - Desktop (grbt8) birebir React Native
// Debounced autocomplete ile havalimanı/şehir arama

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchLocations, getPopularLocations } from '../services/car/api';
import type { LocationSearchResult } from '../types/car';
import { colors } from '@/constants/colors';

interface CarLocationSearchProps {
  label: string;
  value: LocationSearchResult | null;
  onSelect: (location: LocationSearchResult) => void;
  placeholder?: string;
}

export const CarLocationSearch: React.FC<CarLocationSearchProps> = ({
  label,
  value,
  onSelect,
  placeholder = 'Havalimanı veya şehir',
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const [popularLocs, setPopularLocs] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Popüler lokasyonları yükle
  useEffect(() => {
    const loadPopular = async () => {
      try {
        const locs = await getPopularLocations('TR');
        setPopularLocs(locs);
      } catch (err) {
        // silent
      }
    };
    loadPopular();
  }, []);

  // Debounced arama
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocations(query);
        setSuggestions(results);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback(
    (location: LocationSearchResult) => {
      onSelect(location);
      setModalVisible(false);
      setQuery('');
      setSuggestions([]);
    },
    [onSelect]
  );

  const openModal = () => {
    setQuery('');
    setSuggestions([]);
    setModalVisible(true);
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'airport':
        return 'airplane';
      case 'city':
        return 'business';
      default:
        return 'location';
    }
  };

  const renderLocationItem = ({ item }: { item: LocationSearchResult }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <Ionicons
        name={getLocationIcon(item.type) as any}
        size={20}
        color={colors.gray[400]}
        style={styles.suggestionIcon}
      />
      <View style={styles.suggestionInfo}>
        <Text style={styles.suggestionName}>{item.name}</Text>
        <Text style={styles.suggestionDetail}>
          {item.city}, {item.country}
          {item.airport && (
            <Text style={styles.airportCode}> ({item.airport})</Text>
          )}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const displayList = query.length >= 2 ? suggestions : popularLocs;
  const showPopularHeader = query.length < 2 && popularLocs.length > 0;

  return (
    <View style={styles.container}>
      {/* Desktop mobile: label gizli, placeholder'da gösterilir */}
      <TouchableOpacity style={styles.inputContainer} onPress={openModal} activeOpacity={0.7}>
        <Ionicons name="location-outline" size={18} color={colors.gray[400]} />
        <Text
          style={[styles.inputText, !value && styles.placeholderText]}
          numberOfLines={1}
        >
          {value ? value.name : placeholder}
        </Text>
      </TouchableOpacity>

      {/* Full screen search modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Search header */}
          <View style={styles.searchHeader}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={18} color={colors.gray[400]} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder={placeholder}
                placeholderTextColor={colors.gray[400]}
                autoFocus
                autoCorrect={false}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.gray[400]} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Results */}
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary[600]} />
            </View>
          ) : (
            <FlatList
              data={displayList}
              keyExtractor={(item) => item.id}
              renderItem={renderLocationItem}
              ListHeaderComponent={
                showPopularHeader ? (
                  <Text style={styles.sectionTitle}>Popüler Lokasyonlar</Text>
                ) : null
              }
              ListEmptyComponent={
                query.length >= 2 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Sonuç bulunamadı</Text>
                  </View>
                ) : null
              }
              contentContainerStyle={styles.listContent}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Desktop mobile: label hidden, h-12, border gray-300, rounded-xl, MapPin left-3
  container: {
    marginBottom: 0, // gap-2 formFields'den gelecek
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.gray[300], // border-gray-300
    borderRadius: 12, // rounded-xl
    paddingHorizontal: 12,
    height: 48, // h-12
  },
  inputText: {
    flex: 1,
    fontSize: 16, // text-base
    fontWeight: '500', // font-medium
    color: colors.text.primary, // text-gray-900
  },
  placeholderText: {
    color: colors.gray[700], // placeholder-gray-700 (desktop'ta koyu placeholder)
    fontWeight: '500',
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    gap: 8,
  },
  backButton: {
    padding: 4,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[500],
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 2,
  },
  suggestionDetail: {
    fontSize: 13,
    color: colors.gray[500],
  },
  airportCode: {
    color: colors.info,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[500],
  },
});
