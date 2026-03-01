import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { formatErrorMessage } from '@/utils/error';

interface ErrorDisplayProps {
  error: unknown;
  message?: string;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  message,
  onRetry,
}) => {
  const errorMessage = message || formatErrorMessage(error);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>Bir Hata Oluştu</Text>
      <Text style={styles.message}>{errorMessage}</Text>
      {onRetry && (
        <Text style={styles.retryText} onPress={onRetry}>
          Tekrar Dene
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    fontSize: 16,
    color: colors.primary[600],
    fontWeight: '600',
    marginTop: 8,
  },
});











