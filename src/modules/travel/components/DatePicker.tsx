import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Platform } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { colors } from '@/constants/colors';
import { flightService } from '../services/flightService';

interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
  disabled?: boolean;
  origin?: string;
  destination?: string;
}

// Demo fiyat verisi (gerçek kullanımda API'den alınacak)
const getDemoPrice = (date: Date): number => {
  // Demo: Tarihe göre dinamik fiyat hesaplama
  const dayOfMonth = date.getDate();
  const month = date.getMonth();
  return Math.floor(100 + (dayOfMonth * 7 + month * 3) % 100);
};

// Türkçe locale ayarları
LocaleConfig.locales['tr'] = {
  monthNames: [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ],
  monthNamesShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  dayNamesShort: ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'],
  today: 'Bugün',
};
LocaleConfig.defaultLocale = 'tr';

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  placeholder = 'Tarih seçin',
  disabled = false,
  origin,
  destination,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    value ? format(value, 'yyyy-MM-dd') : null
  );

  // Marked dates with prices
  const markedDates = useMemo(() => {
    const marked: any = {};
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 12); // 12 ay ileri

    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, 'yyyy-MM-dd');
      const price = getDemoPrice(d);
      
      marked[dateStr] = {
        customStyles: {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: colors.text.primary,
            fontWeight: '400',
          },
        },
        price,
      };

      if (selectedDate === dateStr) {
        marked[dateStr].customStyles.container.backgroundColor = colors.gray[200];
        marked[dateStr].customStyles.container.borderWidth = 1;
        marked[dateStr].customStyles.container.borderColor = colors.gray[500];
        marked[dateStr].customStyles.text.color = colors.text.primary;
        marked[dateStr].customStyles.text.fontWeight = '600';
      }
    }

    return marked;
  }, [selectedDate]);

  const handleDayPress = (day: any) => {
    const selected = new Date(day.dateString);
    setSelectedDate(day.dateString);
    onChange(selected);
    if (Platform.OS === 'ios') {
      // iOS'ta hemen kapat
      setShowPicker(false);
    }
  };

  const handleConfirm = () => {
    if (selectedDate) {
      const selected = new Date(selectedDate);
      onChange(selected);
    }
    setShowPicker(false);
  };

  const displayValue = value ? format(value, 'dd MMM yyyy', { locale: tr }) : '';

  // Custom day component with price
  const renderDay = (day: any) => {
    const dateStr = day.dateString;
    const marked = markedDates[dateStr];
    const price = marked?.price || getDemoPrice(new Date(dateStr));
    const isSelected = selectedDate === dateStr;

    return (
      <View
        style={[
          styles.dayContainer,
          isSelected && styles.dayContainerSelected,
        ]}
      >
        <Text
          style={[
            styles.dayText,
            isSelected && styles.dayTextSelected,
          ]}
        >
          {day.day}
        </Text>
        <Text style={styles.priceText}>{price} €</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>}
      <TouchableOpacity
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
        style={[styles.inputContainer, disabled && styles.inputContainerDisabled]}
      >
        <Ionicons name="calendar-outline" size={18} color={colors.text.primary} style={styles.icon} />
        <Text style={[styles.inputText, !value && styles.placeholder, disabled && styles.inputTextDisabled]}>
          {displayValue || placeholder}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.cancelText}>İptal</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{label || placeholder}</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.doneText}>Tamam</Text>
                </TouchableOpacity>
              </View>
              <ScrollView 
                style={styles.calendarContainer} 
                showsVerticalScrollIndicator={false}
                onScroll={(event) => {
                  // Scroll ile yeni aylar yüklenebilir (gelecekte API entegrasyonu için)
                }}
                scrollEventThrottle={16}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((monthOffset) => {
                  const monthDate = new Date();
                  monthDate.setMonth(monthDate.getMonth() + monthOffset);
                  const monthKey = format(monthDate, 'yyyy-MM');
                  
                  return (
                    <View key={monthKey} style={styles.monthContainer}>
                      <Text style={styles.monthTitle}>
                        {format(monthDate, 'MMMM yyyy', { locale: tr })}
                      </Text>
                      <Calendar
                        current={format(monthDate, 'yyyy-MM-01')}
                        minDate={minimumDate ? format(minimumDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                        maxDate={maximumDate ? format(maximumDate, 'yyyy-MM-dd') : undefined}
                        onDayPress={handleDayPress}
                        markedDates={markedDates}
                        markingType="custom"
                        monthFormat=""
                        hideExtraDays
                        firstDay={1}
                        hideArrows={true}
                        disableMonthChange={true}
                        theme={{
                          backgroundColor: colors.background,
                          calendarBackground: colors.background,
                          textSectionTitleColor: colors.text.secondary,
                          selectedDayBackgroundColor: colors.gray[200],
                          selectedDayTextColor: colors.text.primary,
                          todayTextColor: colors.primary[600],
                          dayTextColor: colors.text.primary,
                          textDisabledColor: colors.text.disabled,
                          dotColor: colors.primary[600],
                          selectedDotColor: colors.primary[600],
                          arrowColor: 'transparent',
                          monthTextColor: 'transparent',
                          textDayFontWeight: '400',
                          textMonthFontWeight: '600',
                          textDayHeaderFontWeight: '500',
                          textDayFontSize: 14,
                          textMonthFontSize: 16,
                          textDayHeaderFontSize: 12,
                        }}
                        renderDay={(day, item) => {
                          if (!day) return <View style={styles.emptyDay} />;
                          return renderDay(day);
                        }}
                      />
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
    marginBottom: 4,
    marginLeft: 4,
  },
  labelDisabled: {
    color: colors.text.disabled,
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
  inputContainerDisabled: {
    backgroundColor: colors.gray[100],
    opacity: 0.5,
  },
  icon: {
    marginRight: 12,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  placeholder: {
    color: colors.gray[600],
  },
  inputTextDisabled: {
    color: colors.text.disabled,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
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
  cancelText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[600],
  },
  calendarContainer: {
    padding: 16,
    maxHeight: '70%',
  },
  monthContainer: {
    marginBottom: 32,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
    borderRadius: 8,
    paddingVertical: 4,
  },
  dayContainerSelected: {
    backgroundColor: colors.gray[200],
    borderWidth: 1,
    borderColor: colors.gray[500],
  },
  dayText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text.primary,
    marginBottom: 2,
  },
  dayTextSelected: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.primary[600],
  },
  emptyDay: {
    minHeight: 44,
    minWidth: 44,
  },
});
