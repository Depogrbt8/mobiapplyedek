// Araç Filtreleri - Desktop (grbt8) birebir React Native Modal
// Kategori, Vites, KM, Koltuk, Özellikler, Tedarikçi, Fiyat

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CarFiltersType, CarCategory, CarFilterOptions } from '../types/car';
import {
  CAR_CATEGORY_LABELS,
  TRANSMISSION_LABELS,
  MILEAGE_TYPE_LABELS,
} from '../types/car';
import { getActiveFilterCount } from '../utils/carHelpers';
import { colors } from '@/constants/colors';

interface CarFiltersProps {
  visible: boolean;
  onClose: () => void;
  filters: CarFiltersType;
  onFiltersChange: (filters: CarFiltersType) => void;
  filterOptions?: CarFilterOptions | null;
}

export const CarFilters: React.FC<CarFiltersProps> = ({
  visible,
  onClose,
  filters,
  onFiltersChange,
  filterOptions,
}) => {
  const [localFilters, setLocalFilters] = useState<CarFiltersType>(filters);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    transmission: true,
  });

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleCategoryToggle = (category: CarCategory) => {
    const current = localFilters.carCategories || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    setLocalFilters({ ...localFilters, carCategories: updated });
  };

  const handleTransmissionChange = (type: 'automatic' | 'manual' | undefined) => {
    setLocalFilters({ ...localFilters, transmissionType: type });
  };

  const handleMileageChange = (type: 'unlimited' | 'limited' | undefined) => {
    setLocalFilters({ ...localFilters, mileageType: type });
  };

  const handleSeatsChange = (seats: number | undefined) => {
    setLocalFilters({ ...localFilters, numberOfSeats: seats });
  };

  const handleAirConditioningChange = (value: boolean | undefined) => {
    setLocalFilters({ ...localFilters, airConditioning: value });
  };

  const handleSupplierToggle = (supplierId: number) => {
    const current = localFilters.supplierIds || [];
    const updated = current.includes(supplierId)
      ? current.filter((id) => id !== supplierId)
      : [...current, supplierId];
    setLocalFilters({ ...localFilters, supplierIds: updated });
  };

  const clearFilters = () => {
    setLocalFilters({});
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const activeCount = getActiveFilterCount(localFilters);

  // Checkbox component
  const Checkbox = ({
    checked,
    onPress,
    label,
  }: {
    checked: boolean;
    onPress: () => void;
    label: string;
  }) => (
    <TouchableOpacity style={styles.checkboxRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  // Radio component
  const Radio = ({
    selected,
    onPress,
    label,
  }: {
    selected: boolean;
    onPress: () => void;
    label: string;
  }) => (
    <TouchableOpacity style={styles.checkboxRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  // Section header
  const SectionHeader = ({ title, sectionKey }: { title: string; sectionKey: string }) => (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={() => toggleSection(sectionKey)}
      activeOpacity={0.7}
    >
      <Text style={styles.sectionTitle}>{title}</Text>
      <Ionicons
        name={openSections[sectionKey] ? 'chevron-up' : 'chevron-down'}
        size={20}
        color={colors.gray[500]}
      />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Filtreler</Text>
            {activeCount > 0 && (
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearText}>Temizle</Text>
              </TouchableOpacity>
            )}
            {activeCount === 0 && <View style={{ width: 50 }} />}
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Araç Kategorisi */}
            <View style={styles.section}>
              <SectionHeader title="Araç Kategorisi" sectionKey="category" />
              {openSections.category && (
                <View style={styles.sectionContent}>
                  {(Object.keys(CAR_CATEGORY_LABELS) as CarCategory[]).map((category) => {
                    const opt = filterOptions?.categories.find((c) => c.value === category);
                    return (
                      <Checkbox
                        key={category}
                        checked={localFilters.carCategories?.includes(category) || false}
                        onPress={() => handleCategoryToggle(category)}
                        label={`${CAR_CATEGORY_LABELS[category]}${opt ? ` (${opt.count})` : ''}`}
                      />
                    );
                  })}
                </View>
              )}
            </View>

            {/* Vites Tipi */}
            <View style={styles.section}>
              <SectionHeader title="Vites Tipi" sectionKey="transmission" />
              {openSections.transmission && (
                <View style={styles.sectionContent}>
                  <Radio
                    selected={!localFilters.transmissionType}
                    onPress={() => handleTransmissionChange(undefined)}
                    label="Tümü"
                  />
                  <Radio
                    selected={localFilters.transmissionType === 'automatic'}
                    onPress={() => handleTransmissionChange('automatic')}
                    label={TRANSMISSION_LABELS.automatic}
                  />
                  <Radio
                    selected={localFilters.transmissionType === 'manual'}
                    onPress={() => handleTransmissionChange('manual')}
                    label={TRANSMISSION_LABELS.manual}
                  />
                </View>
              )}
            </View>

            {/* Kilometre */}
            <View style={styles.section}>
              <SectionHeader title="Kilometre" sectionKey="mileage" />
              {openSections.mileage && (
                <View style={styles.sectionContent}>
                  <Radio
                    selected={!localFilters.mileageType}
                    onPress={() => handleMileageChange(undefined)}
                    label="Tümü"
                  />
                  <Radio
                    selected={localFilters.mileageType === 'unlimited'}
                    onPress={() => handleMileageChange('unlimited')}
                    label={MILEAGE_TYPE_LABELS.unlimited}
                  />
                  <Radio
                    selected={localFilters.mileageType === 'limited'}
                    onPress={() => handleMileageChange('limited')}
                    label={MILEAGE_TYPE_LABELS.limited}
                  />
                </View>
              )}
            </View>

            {/* Minimum Koltuk */}
            <View style={styles.section}>
              <SectionHeader title="Minimum Koltuk" sectionKey="seats" />
              {openSections.seats && (
                <View style={styles.sectionContent}>
                  {[undefined, 5, 7, 9].map((seats) => (
                    <Radio
                      key={seats || 'all'}
                      selected={localFilters.numberOfSeats === seats}
                      onPress={() => handleSeatsChange(seats)}
                      label={seats ? `${seats}+ Kişi` : 'Tümü'}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Özellikler */}
            <View style={styles.section}>
              <SectionHeader title="Özellikler" sectionKey="features" />
              {openSections.features && (
                <View style={styles.sectionContent}>
                  <Checkbox
                    checked={localFilters.airConditioning === true}
                    onPress={() =>
                      handleAirConditioningChange(
                        localFilters.airConditioning === true ? undefined : true
                      )
                    }
                    label="Klimalı"
                  />
                </View>
              )}
            </View>

            {/* Tedarikçiler */}
            {filterOptions && filterOptions.suppliers.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Tedarikçi" sectionKey="suppliers" />
                {openSections.suppliers && (
                  <View style={styles.sectionContent}>
                    {filterOptions.suppliers.map((supplier) => (
                      <Checkbox
                        key={supplier.id}
                        checked={localFilters.supplierIds?.includes(supplier.id) || false}
                        onPress={() => handleSupplierToggle(supplier.id)}
                        label={`${supplier.name} (${supplier.count})`}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Alt buton */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters} activeOpacity={0.8}>
              <Text style={styles.applyButtonText}>
                Filtreleri Uygula{activeCount > 0 ? ` (${activeCount})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  clearText: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    paddingBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  sectionContent: {
    paddingBottom: 8,
    gap: 8,
  },
  // Checkbox
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
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
    fontSize: 14,
    color: colors.gray[700],
  },
  // Radio
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: colors.primary[600],
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary[600],
  },
  // Footer
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  applyButton: {
    backgroundColor: colors.primary[600],
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
