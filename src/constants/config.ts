import Constants from 'expo-constants';

type Environment = 'development' | 'staging' | 'production';

const ENV: Environment = (Constants.expoConfig?.extra?.environment as Environment) || 'development';

// API URLs per environment
// Development için: Bilgisayarın IP adresini kullan (mobil cihazdan erişim için)
// Örnek: 'http://10.39.95.186:3000/api' (kendi IP adresinizi kullanın)
// Veya staging/production URL'ini kullanabilirsiniz
const API_URLS: Record<Environment, string> = {
  development: process.env.EXPO_PUBLIC_API_URL || 'https://gurbetbiz.app/api', // Localhost yerine production URL kullan
  staging: 'https://staging.gurbetbiz.app/api',
  production: 'https://gurbetbiz.app/api',
};

// Socket URLs for games
const SOCKET_URLS: Record<Environment, string> = {
  development: 'ws://localhost:3001',
  staging: 'wss://staging-game.gurbetbiz.app',
  production: 'wss://game.gurbetbiz.app',
};

export const config = {
  ENV,
  API_URL: API_URLS[ENV],
  SOCKET_URL: SOCKET_URLS[ENV],
  
  // Feature flags
  features: {
    moneyTransfer: ENV === 'production',
    games: true,
    biometricAuth: true,
  },
  
  // Timeouts
  timeouts: {
    api: 30000,
    socket: 10000,
  },
};










