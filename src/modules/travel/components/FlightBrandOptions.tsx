import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Flight, FlightBrand } from '@/types/flight';
import { colors } from '@/constants/colors';

interface FlightBrandOptionsProps {
  flight: Flight;
  visible: boolean;
  onClose: () => void;
  onSelectBrand: (brand: FlightBrand) => void;
}

export const FlightBrandOptions: React.FC<FlightBrandOptionsProps> = ({
  flight,
  visible,
  onClose,
  onSelectBrand,
}) => {
  const [brands, setBrands] = useState<FlightBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && flight) {
      fetchBrands();
    } else {
      // Modal kapandığında state'i sıfırla
      setBrands([]);
      setLoading(true);
      setError(null);
    }
  }, [visible, flight?.id]);

  const fetchBrands = async () => {
    if (!flight) return;
    
    setLoading(true);
    setError(null);
    try {
      // Demo: Paketleri oluştur (gerçek API entegrasyonu için hazır)
      setTimeout(() => {
        const basePrice = flight.price || 100;
        const demoBrands: FlightBrand[] = [
          {
            id: 'ecofly',
            name: 'EcoFly',
            price: basePrice,
            baggage: '15 kg',
            rules: 'İade edilemez, değişiklik ücretli',
            description: 'En uygun fiyatlı paket. Bagaj hakkı 15 kg.',
          },
          {
            id: 'extrafly',
            name: 'ExtraFly',
            price: basePrice + 20,
            baggage: '20 kg',
            rules: 'İade edilemez, değişiklik ücretsiz',
            description: 'Daha fazla bagaj ve esnek değişiklik hakkı.',
          },
          {
            id: 'primefly',
            name: 'PrimeFly',
            price: basePrice + 40,
            baggage: '30 kg',
            rules: 'İade ve değişiklik ücretsiz',
            description: 'En yüksek bagaj ve tam esneklik.',
          },
        ];
        setBrands(demoBrands);
        setLoading(false);
      }, 300);
    } catch (e) {
      setError('Paketler yüklenemedi');
      setLoading(false);
    }
  };

  const getBrandGradient = (brandId: string) => {
    switch (brandId) {
      case 'ecofly':
        return ['#ffe259', '#ffa751'];
      case 'extrafly':
        return ['#43cea2', '#185a9d'];
      case 'primefly':
        return ['#ff1e56', '#ffac41'];
      default:
        return [colors.primary[500], colors.primary[700]];
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.modalContent} 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Paket Seçenekleri</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={styles.loadingText}>Paketler yükleniyor...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : brands.length === 0 ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Paket bulunamadı</Text>
              </View>
            ) : (
              <View style={styles.brandsContainer}>
                {brands.map((brand) => (
                  <TouchableOpacity
                    key={brand.id}
                    style={styles.brandCard}
                    onPress={() => onSelectBrand(brand)}
                    activeOpacity={0.7}
                  >
                    {/* Renkli şerit */}
                    <LinearGradient
                      colors={getBrandGradient(brand.id)}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.brandStripe}
                    />

                    {/* Brand içeriği */}
                    <View style={styles.brandContent}>
                      <Text style={styles.brandName}>{brand.name}</Text>
                      <Text style={styles.brandDescription}>{brand.description}</Text>
                      
                      <View style={styles.brandDetails}>
                        <Text style={styles.brandDetailText}>Bagaj: {brand.baggage}</Text>
                        <Text style={styles.brandDetailText}>Kurallar: {brand.rules}</Text>
                      </View>

                      <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>{brand.price} EUR</Text>
                      </View>

                      <View style={styles.selectButton}>
                        <Text style={styles.selectButtonText}>Bu Paketi Seç</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingTop: 20,
    height: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    color: colors.text.secondary,
    lineHeight: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.text.secondary,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
  },
  brandsContainer: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  brandCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  brandStripe: {
    height: 6,
    width: '100%',
  },
  brandContent: {
    padding: 16,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  brandDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  brandDetails: {
    gap: 4,
    marginBottom: 12,
  },
  brandDetailText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  priceContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary[600],
  },
  selectButton: {
    backgroundColor: colors.primary[600],
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});

