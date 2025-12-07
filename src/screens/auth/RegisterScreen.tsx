import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/core/auth';
import type { AuthStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';
import { formatErrorMessage } from '@/utils/error';
import { userSchema } from '@/utils/validation';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

type RegisterFormData = z.infer<typeof userSchema.register>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(userSchema.register),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (err: any) {
      setError(formatErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successTitle}>Kayıt Başarılı!</Text>
        <Text style={styles.successText}>Giriş sayfasına yönlendiriliyorsunuz...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Kayıt Ol</Text>
          <Text style={styles.subtitle}>Yeni hesap oluşturun</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Ad Soyad"
            placeholder="Adınız ve soyadınız"
            control={control}
            name="name"
            autoCapitalize="words"
            error={errors.name?.message}
          />

          <Input
            label="E-posta"
            placeholder="ornek@email.com"
            control={control}
            name="email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email?.message}
          />

          <Input
            label="Şifre"
            placeholder="En az 8 karakter"
            control={control}
            name="password"
            secureTextEntry
            error={errors.password?.message}
          />

          <Input
            label="Şifre Tekrar"
            placeholder="Şifrenizi tekrar girin"
            control={control}
            name="confirmPassword"
            secureTextEntry
            error={errors.confirmPassword?.message}
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
            <Text style={styles.loginText}>Zaten hesabınız var mı? </Text>
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
  errorContainer: {
    backgroundColor: colors.error + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
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
  successIcon: {
    fontSize: 64,
    color: colors.success,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

