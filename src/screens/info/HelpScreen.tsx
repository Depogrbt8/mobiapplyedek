import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';

export const HelpScreen: React.FC = () => {
  const faqs = [
    {
      question: 'Uçak bileti nasıl rezerve edilir?',
      answer: 'Ana sayfadan uçuş arama formunu doldurarak uçuşları arayabilir, beğendiğiniz uçuşu seçerek rezervasyon yapabilirsiniz.',
    },
    {
      question: 'Rezervasyonumu nasıl iptal edebilirim?',
      answer: 'Rezervasyonlarım sayfasından veya PNR sorgulama ile rezervasyonunuzu bulup iptal edebilirsiniz.',
    },
    {
      question: 'PNR nedir?',
      answer: 'PNR (Passenger Name Record) rezervasyon kodunuzdur. Biletinizde ve e-posta onayınızda bulunur.',
    },
    {
      question: 'Online check-in nasıl yapılır?',
      answer: 'Uçuşunuzdan 24 saat önce check-in sayfasından rezervasyon referansınız ve soyadınız ile check-in yapabilirsiniz.',
    },
    {
      question: 'Ödeme güvenli mi?',
      answer: 'Tüm ödemeler 3D Secure ile korunmaktadır. Kart bilgileriniz saklanmaz.',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Yardım Merkezi</Text>
        <Text style={styles.subtitle}>Sık sorulan sorular ve yardım</Text>
      </View>

      <View style={styles.faqs}>
        {faqs.map((faq, index) => (
          <Card key={index} style={styles.faqCard}>
            <Text style={styles.question}>{faq.question}</Text>
            <Text style={styles.answer}>{faq.answer}</Text>
          </Card>
        ))}
      </View>

      <Card style={styles.contactCard}>
        <Text style={styles.contactTitle}>Daha Fazla Yardım?</Text>
        <Text style={styles.contactText}>
          Sorularınız için bize ulaşabilirsiniz:
        </Text>
        <Text style={styles.contactInfo}>E-posta: destek@gurbetbiz.app</Text>
        <Text style={styles.contactInfo}>Telefon: +90 XXX XXX XX XX</Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  faqs: {
    gap: 16,
    marginBottom: 24,
  },
  faqCard: {
    marginBottom: 0,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  contactCard: {
    marginTop: 8,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  contactInfo: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: '500',
    marginBottom: 4,
  },
});











