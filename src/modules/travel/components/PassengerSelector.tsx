import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

interface PassengerSelectorProps {
  adultCount: number;
  childCount: number;
  infantCount: number;
  onAdultCountChange: (count: number) => void;
  onChildCountChange: (count: number) => void;
  onInfantCountChange: (count: number) => void;
}

export const PassengerSelector: React.FC<PassengerSelectorProps> = ({
  adultCount,
  childCount,
  infantCount,
  onAdultCountChange,
  onChildCountChange,
  onInfantCountChange,
}) => {
  const [showModal, setShowModal] = useState(false);

  const totalPassengers = adultCount + childCount + infantCount;

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.buttonText}>{totalPassengers} Yolcu</Text>
        <Ionicons name="chevron-down" size={20} color={colors.text.primary} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yolcu Seçimi</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.passengerList}>
              {/* Yetişkin */}
              <View style={styles.passengerItem}>
                <View>
                  <Text style={styles.passengerLabel}>
                    Yetişkin <Text style={styles.passengerSubLabel}>(12 yaş ve üstü)</Text>
                  </Text>
                </View>
                <View style={styles.counter}>
                  <TouchableOpacity
                    style={[styles.counterButton, adultCount === 1 && styles.counterButtonDisabled]}
                    onPress={() => onAdultCountChange(Math.max(1, adultCount - 1))}
                    disabled={adultCount === 1}
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{adultCount}</Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => onAdultCountChange(adultCount + 1)}
                  >
                    <Text style={[styles.counterButtonText, styles.counterButtonTextPlus]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Çocuk */}
              <View style={styles.passengerItem}>
                <View>
                  <Text style={styles.passengerLabel}>
                    Çocuk <Text style={styles.passengerSubLabel}>(2-12 yaş)</Text>
                  </Text>
                </View>
                <View style={styles.counter}>
                  <TouchableOpacity
                    style={[styles.counterButton, childCount === 0 && styles.counterButtonDisabled]}
                    onPress={() => onChildCountChange(Math.max(0, childCount - 1))}
                    disabled={childCount === 0}
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{childCount}</Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => onChildCountChange(childCount + 1)}
                  >
                    <Text style={[styles.counterButtonText, styles.counterButtonTextPlus]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bebek */}
              <View style={styles.passengerItem}>
                <View style={styles.passengerLabelContainer}>
                  <Text style={styles.passengerLabel}>
                    Bebek <Text style={styles.passengerSubLabel}>(0-2 yaş)</Text>
                  </Text>
                  <Ionicons name="information-circle-outline" size={16} color={colors.text.secondary} />
                </View>
                <View style={styles.counter}>
                  <TouchableOpacity
                    style={[styles.counterButton, infantCount === 0 && styles.counterButtonDisabled]}
                    onPress={() => onInfantCountChange(Math.max(0, infantCount - 1))}
                    disabled={infantCount === 0}
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{infantCount}</Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => onInfantCountChange(infantCount + 1)}
                  >
                    <Text style={[styles.counterButtonText, styles.counterButtonTextPlus]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.doneButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
    minHeight: 'auto',
    maxWidth: '100%',
    alignSelf: 'center',
    width: 'auto',
    gap: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text.primary,
    textDecorationLine: 'underline',
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
    padding: 24,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  passengerList: {
    gap: 24,
    marginBottom: 32,
  },
  passengerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passengerLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  passengerLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  passengerSubLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text.secondary,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  counterButtonDisabled: {
    opacity: 0.4,
  },
  counterButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  counterButtonTextPlus: {
    color: colors.primary[600],
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    minWidth: 32,
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: colors.primary[600],
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});



