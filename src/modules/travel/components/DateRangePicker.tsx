import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { format, isAfter, isBefore, startOfDay, eachDayOfInterval } from 'date-fns';
import { tr } from 'date-fns/locale';
import { colors } from '@/constants/colors';

interface DateRangePickerProps {
  checkIn: Date | null;
  checkOut: Date | null;
  onCheckInChange: (date: Date) => void;
  onCheckOutChange: (date: Date) => void;
  minimumDate?: Date;
  placeholder?: string;
  disabled?: boolean;
}

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

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  minimumDate = new Date(),
  placeholder = 'Tarih seçin',
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempCheckIn, setTempCheckIn] = useState<Date | null>(checkIn);
  const [tempCheckOut, setTempCheckOut] = useState<Date | null>(checkOut);
  const [selectingCheckIn, setSelectingCheckIn] = useState(true);

  // Tarih aralığını hesapla
  const dateRange = useMemo(() => {
    if (!tempCheckIn || !tempCheckOut) return [];
    if (isAfter(tempCheckIn, tempCheckOut)) return [];
    
    const start = startOfDay(tempCheckIn);
    const end = startOfDay(tempCheckOut);
    return eachDayOfInterval({ start, end });
  }, [tempCheckIn, tempCheckOut]);

  // Marked dates - aralık için açık yeşil belirteç
  const markedDates = useMemo(() => {
    const marked: any = {};
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 12);

    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, 'yyyy-MM-dd');
      const date = startOfDay(d);
      
      const isInRange = dateRange.some(rangeDate => 
        format(rangeDate, 'yyyy-MM-dd') === dateStr
      );
      const isCheckIn = tempCheckIn && format(tempCheckIn, 'yyyy-MM-dd') === dateStr;
      const isCheckOut = tempCheckOut && format(tempCheckOut, 'yyyy-MM-dd') === dateStr;
      const isStartOfRange = isInRange && dateRange[0] && format(dateRange[0], 'yyyy-MM-dd') === dateStr;
      const isEndOfRange = isInRange && dateRange[dateRange.length - 1] && format(dateRange[dateRange.length - 1], 'yyyy-MM-dd') === dateStr;

      marked[dateStr] = {
        customStyles: {
          container: {
            backgroundColor: isInRange ? colors.primary[50] : 'transparent',
            borderRadius: isStartOfRange ? 8 : isEndOfRange ? 8 : 0,
            borderTopLeftRadius: isStartOfRange ? 8 : 0,
            borderBottomLeftRadius: isStartOfRange ? 8 : 0,
            borderTopRightRadius: isEndOfRange ? 8 : 0,
            borderBottomRightRadius: isEndOfRange ? 8 : 0,
          },
          text: {
            color: colors.text.primary,
            fontWeight: (isCheckIn || isCheckOut) ? '600' : '400',
          },
        },
      };

      if (isCheckIn || isCheckOut) {
        marked[dateStr].customStyles.container.backgroundColor = colors.primary[600];
        marked[dateStr].customStyles.container.borderWidth = 2;
        marked[dateStr].customStyles.container.borderColor = colors.primary[700];
        marked[dateStr].customStyles.text.color = colors.text.inverse;
      }
    }

    return marked;
  }, [tempCheckIn, tempCheckOut, dateRange]);

  const handleDayPress = (day: any) => {
    const selectedDate = new Date(day.dateString);
    
    if (selectingCheckIn) {
      // Giriş tarihi seçiliyor
      setTempCheckIn(selectedDate);
      setTempCheckOut(null);
      setSelectingCheckIn(false);
    } else {
      // Çıkış tarihi seçiliyor
      if (tempCheckIn && isBefore(selectedDate, tempCheckIn)) {
        // Eğer seçilen tarih giriş tarihinden önceyse, yeni giriş tarihi olarak ayarla
        setTempCheckIn(selectedDate);
        setTempCheckOut(null);
        setSelectingCheckIn(false);
      } else {
        // Çıkış tarihi seçildi
        setTempCheckOut(selectedDate);
        onCheckInChange(tempCheckIn);
        onCheckOutChange(selectedDate);
        // Çıkış tarihi seçilince popup'ı kapat
        setShowPicker(false);
        setSelectingCheckIn(true);
      }
    }
  };

  const handleOpenPicker = () => {
    if (disabled) return;
    setTempCheckIn(checkIn);
    setTempCheckOut(checkOut);
    setSelectingCheckIn(true);
    setShowPicker(true);
  };

  const handleClosePicker = () => {
    setShowPicker(false);
    setTempCheckIn(checkIn);
    setTempCheckOut(checkOut);
    setSelectingCheckIn(true);
  };

  const checkInDisplay = checkIn ? format(checkIn, 'dd MMM yyyy', { locale: tr }) : '';
  const checkOutDisplay = checkOut ? format(checkOut, 'dd MMM yyyy', { locale: tr }) : '';

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        {/* Giriş Tarihi */}
        <TouchableOpacity
          onPress={handleOpenPicker}
          disabled={disabled}
          style={[styles.inputContainer, disabled && styles.inputContainerDisabled]}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.gray[600]} style={styles.icon} />
          <Text style={[styles.inputText, !checkIn && styles.placeholder, disabled && styles.inputTextDisabled]} numberOfLines={1}>
            {checkInDisplay || 'Giriş tarihi'}
          </Text>
        </TouchableOpacity>

        {/* Çıkış Tarihi */}
        <TouchableOpacity
          onPress={handleOpenPicker}
          disabled={disabled}
          style={[styles.inputContainer, disabled && styles.inputContainerDisabled]}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.gray[600]} style={styles.icon} />
          <Text style={[styles.inputText, !checkOut && styles.placeholder, disabled && styles.inputTextDisabled]} numberOfLines={1}>
            {checkOutDisplay || 'Çıkış tarihi'}
          </Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={handleClosePicker}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleClosePicker}>
                  <Text style={styles.cancelText}>İptal</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {selectingCheckIn ? 'Giriş tarihi seçin' : 'Çıkış tarihi seçin'}
                </Text>
                <View style={styles.placeholderRight} />
              </View>
              <ScrollView 
                style={styles.calendarContainer} 
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((monthOffset, index) => {
                  const monthDate = new Date();
                  monthDate.setMonth(monthDate.getMonth() + monthOffset);
                  const monthKey = `calendar-month-${index}-${format(monthDate, 'yyyy-MM')}`;
                  
                  return (
                    <View key={monthKey} style={styles.monthContainer}>
                      <Text style={styles.monthTitle}>
                        {format(monthDate, 'MMMM yyyy', { locale: tr })}
                      </Text>
                      <Calendar
                        key={`calendar-${monthKey}`}
                        current={format(monthDate, 'yyyy-MM-01')}
                        minDate={format(minimumDate, 'yyyy-MM-dd')}
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
                          selectedDayBackgroundColor: colors.primary[600],
                          selectedDayTextColor: colors.text.inverse,
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
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    paddingLeft: 0,
    paddingRight: 8,
    paddingVertical: 0,
    height: 40,
    position: 'relative',
    justifyContent: 'flex-start',
  },
  inputContainerDisabled: {
    backgroundColor: colors.gray[100],
    opacity: 0.5,
  },
  icon: {
    position: 'absolute',
    left: 10,
    top: 10,
    zIndex: 1,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
    textAlign: 'center',
    paddingLeft: 26,
    marginLeft: 0,
    width: '100%',
  },
  placeholder: {
    color: colors.text.primary,
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
  placeholderRight: {
    width: 50,
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
});

