import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';

export const AboutScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Hakkımızda</Text>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Misyonumuz</Text>
        <Text style={styles.sectionText}>
          Avrupa'da yaşayan Türk gurbetçiler için özel olarak tasarlanmış seyahat platformuyuz.
          Uçak bileti, otel rezervasyonu ve araç kiralama hizmetleri sunarak seyahat ihtiyaçlarınızı
          tek bir yerden karşılamanızı sağlıyoruz.
        </Text>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Vizyonumuz</Text>
        <Text style={styles.sectionText}>
          Gurbetçilerin seyahat deneyimini kolaylaştırmak ve en iyi fiyatları sunmak için
          sürekli gelişiyoruz. Teknoloji ve müşteri memnuniyeti odaklı yaklaşımımızla
          seyahat sektöründe öncü olmayı hedefliyoruz.
        </Text>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Hizmetlerimiz</Text>
        <View style={styles.servicesList}>
          <Text style={styles.serviceItem}>• Uçak bileti rezervasyonu</Text>
          <Text style={styles.serviceItem}>• Otel rezervasyonu</Text>
          <Text style={styles.serviceItem}>• Araç kiralama</Text>
          <Text style={styles.serviceItem}>• Online check-in</Text>
          <Text style={styles.serviceItem}>• PNR sorgulama</Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>İletişim</Text>
        <Text style={styles.contactText}>E-posta: info@gurbetbiz.app</Text>
        <Text style={styles.contactText}>Web: www.gurbetbiz.app</Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  servicesList: {
    gap: 8,
  },
  serviceItem: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  contactText: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: '500',
    marginBottom: 8,
  },
});



