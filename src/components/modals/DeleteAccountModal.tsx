import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/core/api/client';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuthStore();

  const handleSubmit = async () => {
    if (!isConfirmed) {
      Alert.alert('Hata', 'Lütfen şartları kabul edin');
      return;
    }

    setIsLoading(true);
    try {
      // Hesap silme API'si - backend'de henüz yoksa simüle edilmiş olabilir
      const response = await apiClient.delete('/api/user/delete');

      if (response.status === 200 || response.status === 204) {
        Alert.alert('Başarılı', 'Hesabınız başarıyla silindi', [
          {
            text: 'Tamam',
            onPress: async () => {
              await logout();
              onClose();
            },
          },
        ]);
      } else {
        throw new Error('Hesap silme işlemi başarısız oldu');
      }
    } catch (error: any) {
      // API henüz yoksa simüle edilmiş işlem
      if (error.response?.status === 404 || error.code === 'ECONNREFUSED') {
        Alert.alert(
          'Bilgi',
          'Hesap silme özelliği yakında eklenecek. Şimdilik hesabınızı silmek için lütfen destek ekibiyle iletişime geçin.',
          [
            {
              text: 'Tamam',
              onPress: onClose,
            },
          ]
        );
      } else {
        Alert.alert('Hata', error.response?.data?.error || error.message || 'Hesap silme işlemi başarısız oldu');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Hesabı Sil</Text>

          <View style={styles.content}>
            <Text style={styles.text}>
              Kaydettiğiniz tüm bilgiler kalıcı olarak silinecektir. Bu, her bilet alımında kişisel bilgilerinizi tekrar girmeniz gerektiği anlamına gelir.
            </Text>
            <Text style={styles.text}>
              Planlanmış veya gerçekleştirilmiş seyahatlerinizle birlikte mevcut rezervasyonlarınıza kolayca ulaşamayacaksınız.
            </Text>
            <Text style={styles.text}>
              gurbetbiz.app'den genel bildirimler almaya devam etseniz de, üyelerimize özel promosyonlar ve kampanyalardan haberdar olma fırsatını kaçıracaksınız.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setIsConfirmed(!isConfirmed)}
          >
            <View style={[styles.checkbox, isConfirmed && styles.checkboxChecked]}>
              {isConfirmed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Yukarıdaki şartları kabul ediyorum.
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <Button
              title="Vazgeç"
              onPress={onClose}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="Hesabı Sil"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={!isConfirmed}
              style={[
                styles.deleteButton,
                !isConfirmed && styles.deleteButtonDisabled,
              ]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 20,
  },
  content: {
    gap: 12,
    marginBottom: 20,
  },
  text: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  checkmark: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: colors.error,
  },
  deleteButtonDisabled: {
    backgroundColor: colors.gray[400],
    opacity: 0.6,
  },
});


