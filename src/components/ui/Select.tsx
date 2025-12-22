import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { colors } from '@/constants/colors';

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  label?: string;
  value?: string | number;
  options: SelectOption[];
  onSelect: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  displayValue?: string; // Özel görüntüleme değeri (kapalıyken gösterilecek)
  containerStyle?: any; // Container View için özel stil
  selectContainerStyle?: any; // Select container için özel stil
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Seçiniz',
  disabled = false,
  error,
  displayValue,
  containerStyle,
  selectContainerStyle,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  // displayValue varsa onu kullan, yoksa selectedOption.label kullan
  const displayText = displayValue || (selectedOption ? selectedOption.label : placeholder);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[
          styles.selectContainer,
          selectContainerStyle,
          disabled && styles.selectContainerDisabled,
          error && styles.selectContainerError,
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
      >
        <Text style={[styles.selectText, !selectedOption && !displayValue && styles.placeholderText]}>
          {displayText}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Seçim Yapın'}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.modalClose}>Kapat</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    value === item.value && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setIsOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === item.value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {value === item.value && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.gray[50],
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectContainerDisabled: {
    opacity: 0.5,
    backgroundColor: colors.gray[100],
  },
  selectContainerError: {
    borderColor: colors.error,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  placeholderText: {
    color: colors.text.disabled,
  },
  arrow: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  modalClose: {
    fontSize: 16,
    color: colors.primary[600],
    fontWeight: '600',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  optionItemSelected: {
    backgroundColor: colors.primary[50],
  },
  optionText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  optionTextSelected: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: colors.primary[600],
    fontWeight: 'bold',
  },
});

