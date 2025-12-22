import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '@/constants/colors';

interface BirthDatePickerProps {
  label?: string;
  day?: string;
  month?: string;
  year?: string;
  onSelect: (day: string, month: string, year: string) => void;
  placeholder?: string;
}

const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

export const BirthDatePicker: React.FC<BirthDatePickerProps> = ({
  label,
  day,
  month,
  year,
  onSelect,
  placeholder = 'Doğum Tarihi',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (day && month && year) {
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum)) {
        return new Date(yearNum, monthNum - 1, dayNum);
      }
    }
    // Varsayılan: 25 yıl öncesi
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 25);
    return defaultDate;
  });

  // Prop değiştiğinde date'i güncelle
  useEffect(() => {
    if (day && month && year) {
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum)) {
        setSelectedDate(new Date(yearNum, monthNum - 1, dayNum));
      }
    }
  }, [day, month, year]);

  const formatDisplayDate = () => {
    if (!day || !month || !year) return placeholder;
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return placeholder;
    return `${dayNum} ${monthNames[monthNum - 1]} ${yearNum}`;
  };

  // Android için: Native picker'ın kendi butonları var
  const handleAndroidDateChange = (event: any, date?: Date) => {
    // Android'de picker her zaman kapanır (set veya dismissed)
    setIsOpen(false);
    
    if (event.type === 'set' && date) {
      setSelectedDate(date);
      const dayStr = String(date.getDate()).padStart(2, '0');
      const monthStr = String(date.getMonth() + 1).padStart(2, '0');
      const yearStr = String(date.getFullYear());
      onSelect(dayStr, monthStr, yearStr);
    }
    // dismissed ise sadece kapat, bir şey yapma
  };

  // iOS için: Sadece state güncelle, butonlarla kapatılacak
  const handleIOSDateChange = (event: any, date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleConfirm = () => {
    const dayStr = String(selectedDate.getDate()).padStart(2, '0');
    const monthStr = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const yearStr = String(selectedDate.getFullYear());
    onSelect(dayStr, monthStr, yearStr);
    setIsOpen(false);
  };

  const handleCancel = () => {
    // Orijinal değerlere geri dön
    if (day && month && year) {
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum)) {
        setSelectedDate(new Date(yearNum, monthNum - 1, dayNum));
      }
    }
    setIsOpen(false);
  };

  // Minimum ve maksimum tarihler
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 100);
  const maxDate = new Date();

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.inputText, (!day || !month || !year) && styles.placeholderText]}>
          {formatDisplayDate()}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      {/* Android: Sadece native picker (Modal YOK - native picker kendi dialog'unu açıyor) */}
      {Platform.OS === 'android' && isOpen && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="spinner"
          onChange={handleAndroidDateChange}
          minimumDate={minDate}
          maximumDate={maxDate}
        />
      )}

      {/* iOS: Modal içinde spinner */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={isOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.backdrop}
              activeOpacity={1}
              onPress={handleCancel}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel} style={styles.cancelButtonHeader}>
                  <Text style={styles.cancelButtonHeaderText}>İptal</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Doğum Tarihi</Text>
                <TouchableOpacity onPress={handleConfirm} style={styles.confirmButtonHeader}>
                  <Text style={styles.confirmButtonHeaderText}>Tamam</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleIOSDateChange}
                  minimumDate={minDate}
                  maximumDate={maxDate}
                  locale="tr_TR"
                  textColor={colors.text.primary}
                  themeVariant="light"
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  inputContainer: {
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
  inputText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  cancelButtonHeader: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonHeaderText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  confirmButtonHeader: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  confirmButtonHeaderText: {
    fontSize: 16,
    color: colors.primary[600],
    fontWeight: '600',
  },
  pickerContainer: {
    paddingVertical: 20,
  },
});
