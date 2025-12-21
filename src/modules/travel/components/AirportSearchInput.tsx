import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { flightService } from '../services/flightService';
import type { Airport } from '@/types/flight';
import { colors } from '@/constants/colors';

interface AirportSearchInputProps {
  label?: string;
  value: Airport | null;
  onSelect: (airport: Airport) => void;
  placeholder?: string;
  iconType?: 'departure' | 'arrival'; // Kalkış veya iniş ikonu
}

export const AirportSearchInput: React.FC<AirportSearchInputProps> = ({
  label,
  value,
  onSelect,
  placeholder = 'Havalimanı ara...',
  iconType = 'departure',
}) => {
  const [query, setQuery] = useState(value ? `${value.name} (${value.code})` : '');
  const [results, setResults] = useState<Airport[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (value) {
      setQuery(`${value.name} (${value.code})`);
    }
  }, [value]);

  useEffect(() => {
    if (query.length >= 2 && !value) {
      searchAirports();
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query]);

  const searchAirports = async () => {
    setIsSearching(true);
    try {
      const airports = await flightService.searchAirports(query);
      setResults(airports);
      setShowResults(true);
    } catch (error) {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (airport: Airport) => {
    setQuery(`${airport.name} (${airport.code})`);
    onSelect(airport);
    setShowResults(false);
  };

  const handleFocus = () => {
    if (query.length >= 2) {
      setShowResults(true);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <View style={[styles.iconContainer, iconType === 'arrival' && styles.iconContainerArrival]}>
          <Ionicons 
            name="airplane-outline" 
            size={18} 
            color={colors.text.primary} 
            style={styles.icon} 
          />
        </View>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[600]}
          onFocus={handleFocus}
        />
        {isSearching && (
          <ActivityIndicator size="small" color={colors.primary[600]} style={styles.loader} />
        )}
      </View>
      {showResults && results.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelect(item)}
              >
                <View>
                  <Text style={styles.airportName}>{item.name}</Text>
                  <Text style={styles.airportCode}>{item.code} • {item.city}</Text>
                </View>
              </TouchableOpacity>
            )}
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
    marginBottom: 4,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    paddingHorizontal: 10,
    paddingVertical: 12,
    height: 48,
    maxWidth: '100%',
    alignSelf: 'center',
    width: '99.5%',
  },
  iconContainer: {
    transform: [{ rotate: '-45deg' }], // Kalkış - yukarı-sağa yönlü
    marginRight: 12,
  },
  iconContainerArrival: {
    transform: [{ rotate: '135deg' }], // İniş - aşağı-sola yönlü
  },
  icon: {
    // İkon kendisi
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    padding: 0,
  },
  loader: {
    marginLeft: 8,
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    maxHeight: 200,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  resultsList: {
    maxHeight: 200,
  },
  resultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  airportName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  airportCode: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});
