import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/core/navigation/types';

import { LoginScreen, RegisterScreen, ForgotPasswordScreen } from '@/screens/auth';

const Stack = createNativeStackNavigator<AuthStackParamList>();

// Placeholder for ResetPassword (will be implemented later)
const ResetPasswordScreen = () => {
  return null;
};

export const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#16a34a', // primary-600
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Giriş Yap', headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Kayıt Ol', headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: 'Şifremi Unuttum', headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ title: 'Şifre Sıfırla' }}
      />
    </Stack.Navigator>
  );
};

