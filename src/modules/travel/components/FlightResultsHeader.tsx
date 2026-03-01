import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { colors } from '@/constants/colors';
import { flightService } from '../services/flightService';
import type { Airport } from '@/types/flight';

// Bilinen havaalanları için fallback mapping
const KNOWN_AIRPORTS: Record<string, Airport> = {
  IST: { code: 'IST', name: 'İstanbul Havalimanı', city: 'İstanbul' },
  SAW: { code: 'SAW', name: 'Sabiha Gökçen Havalimanı', city: 'İstanbul' },
  ADB: { code: 'ADB', name: 'Adnan Menderes Havalimanı', city: 'İzmir' },
  AYT: { code: 'AYT', name: 'Antalya Havalimanı', city: 'Antalya' },
  ESB: { code: 'ESB', name: 'Esenboğa Havalimanı', city: 'Ankara' },
  DLM: { code: 'DLM', name: 'Dalaman Havalimanı', city: 'Dalaman' },
  BOD: { code: 'BOD', name: 'Bordeaux Havalimanı', city: 'Bordeaux' },
  CDG: { code: 'CDG', name: 'Charles de Gaulle Havalimanı', city: 'Paris' },
  FRA: { code: 'FRA', name: 'Frankfurt Havalimanı', city: 'Frankfurt' },
  MUC: { code: 'MUC', name: 'Münih Havalimanı', city: 'Münih' },
  AMS: { code: 'AMS', name: 'Schiphol Havalimanı', city: 'Amsterdam' },
  LHR: { code: 'LHR', name: 'Heathrow Havalimanı', city: 'Londra' },
};

interface FlightResultsHeaderProps {
  origin: string;
  destination: string;
  departureDate: string;
  passengersCount: number;
  onEditPress: () => void;
  originAirport?: Airport; // Seçilen havaalanı bilgisi
  destinationAirport?: Airport; // Seçilen havaalanı bilgisi
}

export const FlightResultsHeader: React.FC<FlightResultsHeaderProps> = ({
  origin,
  destination,
  departureDate,
  passengersCount,
  onEditPress,
  originAirport: propOriginAirport,
  destinationAirport: propDestinationAirport,
}) => {
  const [fetchedOriginAirport, setFetchedOriginAirport] = useState<Airport | null>(null);
  const [fetchedDestinationAirport, setFetchedDestinationAirport] = useState<Airport | null>(null);

  // Eğer prop'tan havaalanı bilgisi gelmediyse, önce bilinen havaalanlarından kontrol et, sonra API'den çek
  useEffect(() => {
    if (!propOriginAirport && origin) {
      // Önce bilinen havaalanlarından kontrol et
      if (KNOWN_AIRPORTS[origin]) {
        setFetchedOriginAirport(KNOWN_AIRPORTS[origin]);
        return;
      }
      
      // Bilinen havaalanlarında yoksa API'den çek
      const fetchOrigin = async () => {
        try {
          const results = await flightService.searchAirports(origin);
          if (results.length > 0) {
            const found = results.find(a => a.code === origin);
            if (found) {
              setFetchedOriginAirport(found);
            } else {
              setFetchedOriginAirport(results[0]);
            }
          }
        } catch (error) {
          // Hata durumunda sessizce devam et
        }
      };
      fetchOrigin();
    }
  }, [propOriginAirport, origin]);

  useEffect(() => {
    if (!propDestinationAirport && destination) {
      // Önce bilinen havaalanlarından kontrol et
      if (KNOWN_AIRPORTS[destination]) {
        setFetchedDestinationAirport(KNOWN_AIRPORTS[destination]);
        return;
      }
      
      // Bilinen havaalanlarında yoksa API'den çek
      const fetchDestination = async () => {
        try {
          const results = await flightService.searchAirports(destination);
          if (results.length > 0) {
            const found = results.find(a => a.code === destination);
            if (found) {
              setFetchedDestinationAirport(found);
            } else {
              setFetchedDestinationAirport(results[0]);
            }
          }
        } catch (error) {
          // Hata durumunda sessizce devam et
        }
      };
      fetchDestination();
    }
  }, [propDestinationAirport, destination]);

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = parseISO(dateStr);
      return format(d, 'dd MMM EEE', { locale: tr });
    } catch {
      return dateStr;
    }
  };

  // Önce prop'tan gelen bilgiyi kullan, yoksa API'den çekileni kullan, yoksa sadece kod
  const originAirport = propOriginAirport || fetchedOriginAirport;
  const destinationAirport = propDestinationAirport || fetchedDestinationAirport;

  // Şehir ve kod formatı: "İstanbul IST" veya sadece kod (eğer havaalanı bilgisi yoksa)
  const formatRoute = () => {
    const originText = originAirport 
      ? `${originAirport.city} ${originAirport.code}`
      : origin;
    const destinationText = destinationAirport 
      ? `${destinationAirport.city} ${destinationAirport.code}`
      : destination;
    return `${originText} - ${destinationText}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.infoContainer}>
          <Text style={styles.route}>{formatRoute()}</Text>
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
    backgroundColor: colors.gray[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    fontSize: 14,
    fontWeight: '400',
    color: colors.text.primary,
    marginBottom: 2,
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

