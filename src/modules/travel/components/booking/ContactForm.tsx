import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface ContactFormProps {
  userEmail?: string | null;
  userPhone?: string | null;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onCountryCodeChange: (value: string) => void;
  countryCode?: string;
  marketingConsent?: boolean;
  onMarketingConsentChange?: (value: boolean) => void;
}

const COUNTRY_CODES = [
  { value: '+90', label: '🇹🇷 +90' },
  { value: '+49', label: '🇩🇪 +49' },
  { value: '+33', label: '🇫🇷 +33' },
  { value: '+32', label: '🇧🇪 +32' },
  { value: '+31', label: '🇳🇱 +31' },
  { value: '+45', label: '🇩🇰 +45' },
  { value: '+44', label: '🇬🇧 +44' },
  { value: '+46', label: '🇸🇪 +46' },
  { value: '+41', label: '🇨🇭 +41' },
  { value: '+43', label: '🇦🇹 +43' },
];

export const ContactForm: React.FC<ContactFormProps> = ({
  userEmail,
  userPhone,
  onEmailChange,
  onPhoneChange,
  onCountryCodeChange,
  countryCode = '+90',
  marketingConsent = false,
  onMarketingConsentChange,
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="mail-outline" size={20} color={colors.text.primary} />
        <Text style={styles.title}>İletişim Bilgileri</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-posta adresiniz</Text>
          <TextInput
            style={styles.input}
            placeholder="ornek@eposta.com"
            placeholderTextColor={colors.text.secondary}
            value={userEmail || ''}
            onChangeText={onEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Cep Telefonunuz</Text>
          <View style={styles.phoneContainer}>
            <Select
              value={countryCode}
              options={COUNTRY_CODES.map(code => ({
                label: code.label,
                value: code.value,
              }))}
              onSelect={onCountryCodeChange}
              placeholder="+90"
              displayValue={COUNTRY_CODES.find(c => c.value === countryCode)?.label || '+90'}
              containerStyle={styles.selectContainerOverride}
              selectContainerStyle={styles.selectButtonStyle}
            />
            <TextInput
              style={styles.phoneInput}
              placeholder="5XX XXX XX XX"
              placeholderTextColor={colors.text.secondary}
              value={userPhone || ''}
              onChangeText={onPhoneChange}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Uçuş ve bilet bilgilerinizi e-posta ve ücretsiz SMS yoluyla ileteceğiz.
          </Text>
        </View>

        {onMarketingConsentChange && (
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => onMarketingConsentChange(!marketingConsent)}
            >
              {marketingConsent && (
                <Ionicons name="checkmark" size={16} color={colors.primary[600]} />
              )}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              Uçuş bilgilendirmeleri, fırsat ve kampanyalardan{' '}
              <Text style={styles.linkText}>Rıza Metni</Text> kapsamında haberdar olmak istiyorum.
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background,
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 0,
    alignItems: 'stretch',
  },
  selectContainerOverride: {
    marginBottom: 0,
    width: 110,
    flex: 0,
  },
  selectButtonStyle: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderLeftWidth: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background,
    minHeight: 44,
  },
  infoContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  linkText: {
    fontWeight: '700',
    color: colors.text.primary,
  },
});

