import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { TabType } from '@/types/travel';

interface TripEmptyStateProps {
  type: TabType | 'default';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const TripEmptyState: React.FC<TripEmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  onAction,
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'ucak':
        return {
          icon: 'airplane' as const,
          iconColor: colors.primary[400],
          title: 'Henüz hiç bilet satın almadınız.',
          description: 'İşlem yaptıkça, satın aldığınız biletlere buradan ulaşabileceksiniz.',
          actionText: 'Uçuş Ara',
        };
      case 'otel':
        return {
          icon: 'business' as const,
          iconColor: colors.secondary[400],
          title: 'Henüz otel rezervasyonu yapmadınız.',
          description: 'İşlem yaptıkça, otel rezervasyonlarınıza buradan ulaşabileceksiniz.',
          actionText: 'Otel Ara',
        };
      case 'arac':
        return {
          icon: 'car' as const,
          iconColor: '#f97316',
          title: 'Henüz araç kiralamadınız.',
          description: 'İşlem yaptıkça, kiraladığınız araçlara buradan ulaşabileceksiniz.',
          actionText: 'Araç Ara',
        };
      case 'esim':
        return {
          icon: 'wifi' as const,
          iconColor: '#8b5cf6',
          title: 'Henüz E-sim satın almadınız.',
          description: 'İşlem yaptıkça, satın aldığınız E-sim\'lere buradan ulaşabileceksiniz.',
          actionText: 'E-sim Satın Al',
        };
      default:
        return {
          icon: 'document-text' as const,
          iconColor: colors.text.secondary,
          title: 'Bu bölüm henüz hazır değil.',
          description: 'Çok yakında hizmetinizde olacak.',
          actionText: '',
        };
    }
  };

  const content = getDefaultContent();
  const finalTitle = title || content.title;
  const finalDescription = description || content.description;
  const finalActionText = actionText || content.actionText;

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: `${content.iconColor}15` }]}>
        <Ionicons name={content.icon} size={48} color={content.iconColor} />
      </View>

      <Text style={styles.title}>{finalTitle}</Text>

      {finalDescription && (
        <Text style={styles.description}>{finalDescription}</Text>
      )}

      {finalActionText && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{finalActionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  actionButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

