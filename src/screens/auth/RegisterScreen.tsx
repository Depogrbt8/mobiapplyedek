import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CountryDropdown } from '@/components/ui/CountryDropdown';
import { authService } from '@/core/auth';
import type { AuthStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';
import { formatErrorMessage } from '@/utils/error';
import { userSchema } from '@/utils/validation';
import { Country, defaultCountry } from '@/data/countries';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

type RegisterFormData = z.infer<typeof userSchema.register>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(userSchema.register),
    defaultValues: {
      countryCode: defaultCountry.phoneCode,
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        countryCode: selectedCountry.phoneCode,
        phone: data.phone,
      });
      setSuccess(true);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (err: any) {
      setError(formatErrorMessage(err, 'register'));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle" size={64} color={colors.success} />
        <Text style={styles.successTitle}>Kayıt Başarılı!</Text>
        <Text style={styles.successText}>Giriş sayfasına yönlendiriliyorsunuz...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      enabled={false}
    >
      <ScrollView 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Üye Ol</Text>
          <Text style={styles.subtitle}>Yeni hesap oluşturun</Text>
        </View>

        <View style={styles.form}>
          {/* Adı ve Soyadı - Yan yana */}
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Input
                label="Adı"
                placeholder="Adınız"
                control={control}
                name="firstName"
                autoCapitalize="words"
                error={errors.firstName?.message}
              />
            </View>
            <View style={styles.nameField}>
              <Input
                label="Soyadı"
                placeholder="Soyadınız"
                control={control}
                name="lastName"
                autoCapitalize="words"
                error={errors.lastName?.message}
              />
            </View>
          </View>

          {/* E-Posta */}
          <Input
            label="E-Posta Adresi"
            placeholder="ornek@email.com"
            control={control}
            name="email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email?.message}
          />

          {/* Cep Telefonu */}
          <View style={styles.phoneContainer}>
            <Text style={styles.phoneLabel}>Cep Telefonu</Text>
            <View style={styles.phoneRow}>
              <CountryDropdown
                selectedCountry={selectedCountry}
                onCountryChange={(country) => {
                  setSelectedCountry(country);
                  setValue('countryCode', country.phoneCode);
                }}
                style={styles.countryDropdown}
              />
              <View style={styles.phoneInputContainer}>
                <Input
                  placeholder="Telefon numaranız"
                  control={control}
                  name="phone"
                  keyboardType="phone-pad"
                  error={errors.phone?.message}
                  containerStyle={styles.phoneInput}
                />
              </View>
            </View>
          </View>

          {/* Şifre */}
          <Input
            label="Şifre"
            placeholder="En az 8 karakter"
            control={control}
            name="password"
            secureTextEntry={!showPassword}
            error={errors.password?.message}
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.gray[400]}
                />
              </TouchableOpacity>
            }
          />

          {/* Şifre Tekrar */}
          <Input
            label="Şifre Tekrar"
            placeholder="Şifrenizi tekrar girin"
            control={control}
            name="confirmPassword"
            secureTextEntry={!showConfirmPassword}
            error={errors.confirmPassword?.message}
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.gray[400]}
                />
              </TouchableOpacity>
            }
          />

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            title="Kayıt Ol"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            style={styles.registerButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Zaten üye misin? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  form: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },
  nameField: {
    flex: 1,
  },
  phoneContainer: {
    marginBottom: 16,
  },
  phoneLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  countryDropdown: {
    width: 100,
  },
  phoneInputContainer: {
    flex: 1,
  },
  phoneInput: {
    marginBottom: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  registerButton: {
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  loginLink: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 24,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});






