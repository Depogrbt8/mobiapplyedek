import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { apiClient } from '@/core/api/client';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Basit doğrulama
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Yeni şifreler eşleşmiyor');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      } else {
        throw new Error('Şifre değiştirme başarısız');
      }
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.error || error.message || 'Şifre değiştirme başarısız');
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
          <Text style={styles.title}>Şifre Değiştir</Text>

          <View style={styles.form}>
            <Input
              label="Mevcut Şifre"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Mevcut şifrenizi girin"
              secureTextEntry
            />

            <Input
              label="Yeni Şifre"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Yeni şifrenizi girin"
              secureTextEntry
            />

            <Input
              label="Yeni Şifre (Tekrar)"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Yeni şifrenizi tekrar girin"
              secureTextEntry
            />
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="İptal"
              onPress={onClose}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="Değiştir"
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitButton}
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 20,
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary[600],
  },
});










