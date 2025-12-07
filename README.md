# 📱 Gurbetbiz Mobile App

React Native + Expo ile geliştirilen Gurbetbiz mobil uygulaması.

## 🚀 Başlangıç

```bash
# Paketleri yükle
npm install

# Development server'ı başlat
npm start

# iOS simulator'da çalıştır
npm run ios

# Android emulator'da çalıştır
npm run android
```

## 📁 Proje Yapısı

```
src/
├── components/     # UI components
├── screens/        # Screen components
├── navigation/     # Navigation config
├── services/       # API services
├── store/          # Zustand stores
├── hooks/          # Custom hooks
├── types/          # TypeScript types
├── utils/          # Utility functions
└── constants/      # App constants
```

## 📚 Dokümantasyon

Detaylı geliştirme rehberi: [`MOBIL_APP_REHBERI.md`](./MOBIL_APP_REHBERI.md)

Bu rehber:
- Proje mimarisi
- Teknoloji seçimleri
- API entegrasyonu
- Authentication
- Güvenlik checklist
- Migration guide
- Test strategy

## 🛠️ Teknolojiler

- React Native + Expo
- TypeScript
- React Navigation
- Zustand (State Management)
- Axios + React Query
- React Hook Form + Zod
- NativeWind (Tailwind CSS)

## 📝 Notlar

- Node.js versiyonu uyarıları normal (Node 18 kullanılıyor, bazı paketler Node 20+ istiyor ama çalışıyor)
- Path aliases `@/*` ile kullanılıyor
- Güvenlik için `expo-secure-store` kullanılıyor

