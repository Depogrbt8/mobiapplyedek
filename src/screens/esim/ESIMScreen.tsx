import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

export const ESIMScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="wifi" size={48} color={colors.primary[600]} />
        </View>
      </View>

      <Text style={styles.title}>E-SIM Hizmeti</Text>
      <Text style={styles.subtitle}>Yakında Sizlerle!</Text>

      <View style={styles.featureCard}>
        <Text style={styles.cardTitle}>🌍 Sınırsız Bağlantı</Text>
        <Text style={styles.cardText}>
          Dünya genelinde 100+ ülkede internet erişimi
        </Text>
      </View>

      <View style={styles.featureCard}>
        <Text style={styles.cardTitle}>⚡ Anında Aktivasyon</Text>
        <Text style={styles.cardText}>
          QR kod ile saniyeler içinde aktif E-SIM
        </Text>
      </View>

      <View style={styles.featureCard}>
        <Text style={styles.cardTitle}>💰 Uygun Fiyatlar</Text>
        <Text style={styles.cardText}>
          Roaming ücretlerine son! Uygun paket seçenekleri
        </Text>
      </View>

      <View style={styles.notifyContainer}>
        <Ionicons name="notifications-outline" size={24} color={colors.primary[600]} />
        <Text style={styles.notifyText}>
          Hizmet aktif olduğunda bildirim almak için bildirimleri açık tutun
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    marginTop: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary[200],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.primary[600],
    fontWeight: '600',
    marginBottom: 32,
  },
  featureCard: {
    width: '100%',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  notifyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  notifyText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

