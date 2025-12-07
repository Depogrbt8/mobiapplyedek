# 📱 GURBETBİZ MOBİL UYGULAMA REHBERİ

> **Tarih:** Aralık 2024  
> **Amaç:** Web sitesindeki hataları tekrarlamamak için baştan doğru mimari kararlar

---

## 📋 İçindekiler

1. [Proje Vizyonu](#proje-vizyonu)
2. [Sistem Mimarisi](#sistem-mimarisi)
3. [Super App Mimarisi](#super-app-mimarisi)
4. [Teknoloji Seçimleri](#teknoloji-seçimleri)
5. [Tasarım & UI](#tasarım--ui)
6. [🚀 Hızlı Başlangıç (Yeni Asistanlar İçin)](#-hızlı-başlangıç-yeni-asistanlar-için)
7. [Proje Kurulumu](#proje-kurulumu)
8. [Klasör Yapısı](#klasör-yapısı)
9. [State Management (Modüler)](#state-management-modüler)
10. [Navigation (Modüler)](#navigation-modüler)
11. [Web Sitesinden Kullanılacaklar](#web-sitesinden-kullanılacaklar)
12. [Admin Panel Entegrasyonu](#admin-panel-entegrasyonu)
13. [Authentication Mimarisi](#authentication-mimarisi)
14. [API Client Yapısı](#api-client-yapısı)
15. [Güvenlik Checklist](#güvenlik-checklist)
16. [Test Strategy](#test-strategy)
17. [Migration Checklist](#migration-checklist)
18. [Geliştirme Roadmap](#geliştirme-roadmap)
19. [Yapılanlar / Changelog](#yapılanlar--changelog)

---

## Proje Vizyonu

```
┌─────────────────────────────────────────────────────────────┐
│              🌍 GURBETBİZ SUPER APP 🌍                      │
│         (Modüler Mimari - Genişletilebilir Yapı)            │
├─────────────────────────────────────────────────────────────┤
│   ✈️ SEYAHAT (İLK FAZ)                                      │
│      ├── Uçak Bileti        → Mevcut API'ler               │
│      ├── Otel Rezervasyonu   → Gelecek                      │
│      └── Araç Kiralama      → Gelecek                      │
│                                                             │
│   💸 PARA TRANSFERİ (SONRA)                                 │
│      └── Rapyd/Wise API entegrasyonu                       │
│                                                             │
│   🎮 OYUNLAR (SONRA)                                        │
│      ├── Tavla                                              │
│      ├── Okey                                               │
│      └── Batak                                              │
│                                                             │
│   💬 SOSYAL (SONRA)                                         │
│      ├── Sohbet                                             │
│      └── Arkadaşlar                                         │
└─────────────────────────────────────────────────────────────┘
```

**Hedef Kitle:** Avrupa'daki ~5 milyon Türk gurbetçi

### 🎯 İlk Faz Kapsamı (MVP)

**Hedef:** Super app altyapısı ile seyahat modülü

**Kapsam:**
- ✅ Super app mimarisi (modüler yapı)
- ✅ Uçak bileti rezervasyonu
- ✅ Otel rezervasyonu (temel)
- ✅ Araç kiralama (temel)
- ✅ Kullanıcı yönetimi
- ✅ Ödeme sistemi

**Kapsam Dışı (Gelecek Fazlar):**
- ❌ Para transferi
- ❌ Oyunlar
- ❌ Sosyal özellikler

**Önemli:** Sistem baştan super app olarak tasarlanacak, tüm modüller için altyapı hazır olacak.

---

## Sistem Mimarisi

### 🏗️ Genel Mimari

Gurbetbiz ekosistemi **3 ayrı frontend projesi** ve **1 ortak backend** üzerine kurulu:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Bilet Dükkanı API (External Service)                      │
│  └── Uçuş arama, rezervasyon, ödeme                         │
│       ↑                                                      │
│       │                                                      │
│  ┌────┴────┐                                               │
│  │         │                                               │
│  │  Web Backend (Next.js API Routes)                       │
│  │  https://gurbetbiz.app/api                              │
│  │  ├── /api/flights/*                                     │
│  │  ├── /api/reservations/*                                │
│  │  ├── /api/auth/*                                        │
│  │  └── /api/payment/*                                      │
│  │                                                          │
│  └────┬────┘                                               │
│       │                                                      │
│       ├──────────────┬──────────────┬──────────────┐       │
│       ↓              ↓              ↓              ↓      │
│                                                             │
│  Web Site          Admin Panel     Mobil App     (Future)   │
│  (grbt8)           (grbt8ap)       (grbt8-mobile)          │
│  gurbetbiz.app     grbt8.store     (Yakında)              │
│                                                             │
│  ───────────────────────────────────────────────────────   │
│  Hepsi AYNI Database & API kullanıyor! ✅                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 📦 Proje Yapısı

| Proje | Klasör | URL | Teknoloji | Amaç |
|-------|--------|-----|-----------|------|
| **Web Site** | `Desktop/grbt8` | `gurbetbiz.app` | Next.js + React | Kullanıcılar için ana site |
| **Admin Panel** | `Desktop/grbt8ap` | `grbt8.store` | Next.js + React | Admin yönetim paneli |
| **Mobil App** | `Desktop/grbt8-mobile` | (Yakında) | React Native + Expo | Mobil uygulama |

### 🔗 Ortak Kaynaklar

Tüm projeler **aynı kaynakları** paylaşıyor:

#### 1. Backend API'leri

```
https://gurbetbiz.app/api/flights/search
https://gurbetbiz.app/api/flights/book
https://gurbetbiz.app/api/reservations
https://gurbetbiz.app/api/auth/*
https://gurbetbiz.app/api/payment/*
```

**Önemli:** Mobil app **direkt Bilet Dükkanı API'sine gitmez**, web backend üzerinden gider.

#### 2. Database

- **Prisma Schema:** `grbt8/prisma/schema.prisma`
- **PostgreSQL:** Aynı database instance
- **Redis (Upstash):** Aynı cache instance

#### 3. Authentication

- **NextAuth.js:** Web ve Admin panel için
- **JWT Tokens:** Mobil app için (aynı backend'den)

### 🔄 Veri Akışı Örneği

```
1. Kullanıcı mobil app'ten uçuş arar
   ↓
2. Mobil App → Backend API: GET /api/flights/search
   ↓
3. Backend → Bilet Dükkanı API: External API call
   ↓
4. Sonuçlar database'e kaydedilir (cache için)
   ↓
5. Backend → Mobil App: JSON response
   ↓
6. Admin panel'de görülebilir (grbt8.store)
   ↓
7. Web sitesinde de görülebilir (gurbetbiz.app)
```

### 🎯 Mobil App İçin Sonuçlar

| Özellik | Durum |
|---------|-------|
| **API Endpoint'leri** | ✅ Web'deki aynı endpoint'ler kullanılacak |
| **Database** | ✅ Aynı database'e bağlanacak |
| **Authentication** | ✅ Aynı backend'den JWT alacak |
| **Cache** | ✅ Aynı Redis cache paylaşılacak |
| **Admin Panel Entegrasyonu** | ✅ Admin panel'deki veriler görülebilir |

### ⚠️ Önemli Notlar

1. **API Key Güvenliği:**
   - Bilet Dükkanı API key'leri sadece backend'de
   - Mobil app direkt erişemez ✅

2. **Rate Limiting:**
   - Backend'de merkezi kontrol
   - Tüm client'lar için aynı limitler

3. **Error Handling:**
   - Backend'de tek noktadan yönetim
   - Tüm client'lar aynı error formatını alır

4. **Cache Stratejisi:**
   - Backend'de Redis cache
   - Mobil app'te React Query cache (client-side)

---

## Super App Mimarisi

### 🏗️ Modüler Yapı

Sistem **modüler mimari** ile tasarlanacak. Her modül bağımsız çalışabilir ve sonradan eklenebilir:

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPER APP CORE                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Auth    │  │ Navigation│ │  State   │  │  API     │   │
│  │  Module  │  │  Module   │  │  Module  │  │  Module  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │
         └──────────────┴──────────────┴──────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
┌───▼────┐        ┌──────▼──────┐      ┌──────▼──────┐
│ SEYAHAT│        │ PARA TRANSFER│      │   OYUNLAR   │
│ MODULE │        │   MODULE     │      │   MODULE    │
│ ✅ İLK │        │   🔜 SONRA   │      │   🔜 SONRA   │
└────────┘        └─────────────┘      └─────────────┘
```

### 📦 Modül Yapısı

Her modül şu yapıya sahip olacak:

```
src/
├── modules/
│   ├── travel/              # SEYAHAT MODÜLÜ (İlk Faz)
│   │   ├── components/       # Modül-specific components
│   │   ├── screens/          # Modül screens
│   │   ├── services/         # Modül API services
│   │   ├── store/            # Modül state (Zustand)
│   │   ├── hooks/            # Modül-specific hooks
│   │   ├── types/            # Modül types
│   │   └── index.ts          # Modül export
│   │
│   ├── transfer/            # PARA TRANSFER MODÜLÜ (Sonra)
│   │   └── ... (aynı yapı)
│   │
│   ├── games/               # OYUNLAR MODÜLÜ (Sonra)
│   │   └── ... (aynı yapı)
│   │
│   └── social/              # SOSYAL MODÜLÜ (Sonra)
│       └── ... (aynı yapı)
```

### 🔌 Modül Entegrasyonu

**Modül Registry Pattern:**

```typescript
// src/modules/registry.ts
export interface Module {
  name: string;
  enabled: boolean;
  screens: NavigationScreen[];
  store?: Store;
  services?: Service[];
}

export const modules: Module[] = [
  {
    name: 'travel',
    enabled: true,  // İlk fazda aktif
    screens: [...],
    store: travelStore,
    services: [flightService, hotelService, carService]
  },
  {
    name: 'transfer',
    enabled: false,  // Sonra aktif edilecek
    screens: [],
    store: null,
    services: []
  },
  // ... diğer modüller
];
```

### 🎯 İlk Faz: Seyahat Modülü

**Seyahat modülü içinde:**
- ✈️ Uçak Bileti (tam özellikli)
- 🏨 Otel Rezervasyonu (temel)
- 🚗 Araç Kiralama (temel)

**Modül yapısı:**
```
src/modules/travel/
├── flights/          # Uçak bileti
│   ├── screens/
│   ├── components/
│   ├── services/
│   └── store/
├── hotels/           # Otel
│   └── ... (temel yapı)
└── cars/             # Araç kiralama
    └── ... (temel yapı)
```

---

## Teknoloji Seçimleri

### ✅ Kesin Kararlar

| Kategori | Seçim | Neden |
|----------|-------|-------|
| **Framework** | React Native + Expo | Hızlı geliştirme, cross-platform |
| **Language** | TypeScript | Web ile aynı, type safety |
| **Navigation** | React Navigation v6 | Standart, stable |
| **State** | Zustand | Basit, performanslı |
| **API Client** | Axios + React Query | Caching, retry |
| **Storage** | expo-secure-store | Şifreli depolama |
| **UI Kit** | NativeWind | Tailwind benzeri |
| **Forms** | React Hook Form + Zod | Web ile aynı |

### ❌ Kullanılmayacaklar

| Teknoloji | Neden Hayır |
|-----------|-------------|
| Redux | Çok karmaşık |
| AsyncStorage (hassas veri) | Şifreleme yok |
| Fetch API (direkt) | Interceptor yok |

---

## Tasarım & UI

### 🎨 Tasarım Prensibi

**Ana Referans:** Mobil uygulama tasarımı, **ana sitenin (`gurbetbiz.app`) mobil görünümü** gibi olacak. Renkler, layout ve genel görünüm aynı tutulacak.

**Stil Referansı:** Enuygun.com mobil uygulaması gibi **sade ve temiz** bir tasarım olacak. Enuygun'un yazı fontları ve sadelik prensipleri referans alınacak.

**Özet:**
- ✅ **Layout & Renkler:** `gurbetbiz.app` web sitesinin mobil görünümü
- ✅ **Sadelik & Fontlar:** Enuygun.com mobil uygulaması gibi sade
- ❌ **TAM Tasarım:** Enuygun'un tamamen aynı tasarımı DEĞİL

### 📱 Ana Site Referansı (Birincil)

- **Web Site:** `Desktop/grbt8` (kaynak tasarım)
- **Mobil Görünüm:** Ana sitenin responsive mobil görünümü **TAM REFERANS**
- **Renk Paleti:** Ana sitedeki renkler aynen kullanılacak
- **Layout:** Ana sitedeki component yerleşimleri korunacak
- **Component'ler:** Ana sitedeki component tasarımları adapte edilecek

### 🎯 Stil Referansı: Enuygun Mobil (İkincil)

**Enuygun.com mobil uygulamasından alınacaklar (sadece stil):**

1. **Sadelik Prensibi**
   - Karmaşık tasarımlardan kaçınılacak
   - Gereksiz öğeler kaldırılacak
   - Temiz ve minimal görünüm

2. **Yazı Fontları**
   - Enuygun'un kullandığı font ailesi referans alınacak
   - Okunabilirlik ön planda
   - Mobil için optimize font boyutları

3. **Spacing (Boşluklar)**
   - Enuygun gibi ferah boşluklar
   - Element'ler arası yeterli mesafe
   - Temiz görünüm

4. **Genel Sadelik**
   - Enuygun gibi sade arayüz
   - Kullanıcıyı yormayan tasarım
   - Odaklanmış içerik

### 🎨 Renk Paleti

Ana sitede kullanılan renkler (Tailwind CSS):

**Ana Renkler:**
- **Yeşil (Primary):** `green-500`, `green-600`, `green-700` - Ana butonlar, linkler, vurgular
- **Mavi (Secondary):** `blue-500`, `blue-600`, `blue-100` - İkincil öğeler, ikonlar
- **Gri (Text):** `gray-600`, `gray-700`, `gray-800` - Metinler, başlıklar
- **Beyaz (Background):** `white`, `bg-white` - Arka planlar
- **Yeşil Açık (Accent):** `green-50`, `green-100` - Vurgu arka planları

**Kullanım Örnekleri:**
```typescript
// Ana butonlar
className="bg-green-600 text-white"

// Linkler
className="text-green-600 hover:text-green-700"

// Vurgu arka planları
className="bg-green-50 border border-green-200"

// İkonlar
className="text-green-500" // veya "text-blue-500"
```

### 📐 UI Bileşenleri

**Ana sitedeki bileşenler mobil uygulamaya adapte edilecek:**

1. **Button (Buton)**
   - Ana site: `bg-green-600 text-white`
   - Mobil: Aynı stil, NativeWind ile

2. **Input (Giriş Alanları)**
   - Ana site: `border-gray-200 focus:border-green-500`
   - Mobil: Aynı stil

3. **Card (Kart)**
   - Ana site: `bg-white border border-gray-200 rounded-lg`
   - Mobil: Aynı stil

4. **Flight Card (Uçuş Kartı)**
   - Ana sitedeki uçuş kartı tasarımı aynen kullanılacak
   - Mobil görünümdeki layout korunacak

### 🎯 Tasarım Kuralları

1. **Renk Tutarlılığı:**
   - Ana sitedeki renkler aynen kullanılacak
   - Yeni renk eklenmeyecek
   - Renk kodları `src/constants/colors.ts` dosyasında tanımlanacak

2. **Tipografi:**
   - Ana sitedeki font boyutları ve ağırlıkları korunacak
   - Mobil için uygun ölçeklendirme yapılacak

3. **Spacing (Boşluklar):**
   - Ana sitedeki padding/margin değerleri korunacak
   - Mobil için uygun ölçeklendirme yapılacak

4. **İkonlar:**
   - Ana sitede kullanılan ikonlar (lucide-react) aynen kullanılacak
   - Aynı renkler ve boyutlar korunacak

### 📁 Renk Tanımları

**`src/constants/colors.ts` dosyası oluşturulacak:**

```typescript
// Ana sitedeki renkler (Tailwind CSS)
export const colors = {
  // Primary (Yeşil)
  primary: {
    50: '#f0fdf4',   // green-50
    100: '#dcfce7',  // green-100
    500: '#22c55e',  // green-500
    600: '#16a34a',  // green-600
    700: '#15803d',  // green-700
  },
  
  // Secondary (Mavi)
  secondary: {
    100: '#dbeafe',  // blue-100
    500: '#3b82f6',  // blue-500
    600: '#2563eb',  // blue-600
  },
  
  // Text (Gri)
  text: {
    600: '#525252',  // gray-600
    700: '#404040',  // gray-700
    800: '#262626',  // gray-800
  },
  
  // Background
  background: {
    white: '#ffffff',
    gray: '#f9fafb',  // gray-50
  },
};
```

### 🔍 Referans Kontrol

**Tasarım yaparken kontrol edilecekler (Öncelik Sırası):**

1. **Ana Site Mobil Görünüm (BİRİNCİL REFERANS):**
   - `gurbetbiz.app` sitesini mobil cihazda açın
   - Responsive tasarımı inceleyin
   - Renkleri, layout'u ve component yerleşimlerini not edin
   - **Bu ana referans - aynen uygulanacak**

2. **Web Site Kaynak Kodları:**
   - `Desktop/grbt8/src/components/` klasöründeki component'leri inceleyin
   - `Desktop/grbt8/src/app/globals.css` dosyasını kontrol edin
   - Tailwind class'larını referans alın
   - Component tasarımlarını mobil'e adapte edin

3. **Component Örnekleri (Ana Siteden):**
   - `FlightCard.tsx` - Uçuş kartı tasarımı (ana siteden)
   - `FlightSearchForm.tsx` - Arama formu tasarımı (ana siteden)
   - `Header.tsx` - Header tasarımı (ana siteden)
   - `Footer.tsx` - Footer tasarımı (ana siteden)

4. **Enuygun Mobil Uygulama (STİL REFERANSI - Sadece Sadelik):**
   - App Store veya Google Play'den Enuygun uygulamasını inceleyin
   - **Sadece:** Font stilleri, spacing, genel sadelik prensipleri
   - **DEĞİL:** Layout, renkler, component tasarımları
   - Enuygun'un temiz ve minimal yaklaşımını not edin

### 📐 Tasarım Yaklaşımı

**Nasıl Birleştirilecek:**

1. **Ana Siteden Alınacaklar:**
   - ✅ Renk paleti (yeşil, mavi, gri)
   - ✅ Component layout'ları
   - ✅ Button, Input, Card tasarımları
   - ✅ Genel görünüm ve stil

2. **Enuygun'dan Alınacaklar (Sadece Stil):**
   - ✅ Sadelik prensibi (gereksiz öğeler kaldırılacak)
   - ✅ Font ailesi ve okunabilirlik
   - ✅ Spacing (ferah boşluklar)
   - ✅ Temiz ve minimal yaklaşım

3. **Sonuç:**
   - Ana sitenin mobil görünümü + Enuygun'un sadeliği
   - Gurbetbiz renkleri + Enuygun fontları
   - Gurbetbiz layout'u + Enuygun spacing'i

### ⚠️ Önemli Notlar

1. **Ana Referans:**
   - **Birincil referans:** `gurbetbiz.app` web sitesinin mobil görünümü
   - Layout, renkler, component tasarımları ana siteden alınacak
   - Enuygun sadece stil referansı (sadelik, fontlar)

2. **NativeWind Kullanımı:**
   - NativeWind, Tailwind CSS'in React Native versiyonu
   - Ana sitedeki Tailwind class'ları NativeWind'de de çalışır
   - Özel renkler `tailwind.config.js` dosyasında tanımlanabilir
   - Ana sitedeki renkler aynen kullanılacak

3. **Mobil Optimizasyon:**
   - Ana sitedeki tasarım mobil için optimize edilecek
   - Touch-friendly butonlar (min 44x44px)
   - Mobil için uygun font boyutları (Enuygun referansı ile)
   - Enuygun gibi ferah spacing

4. **Tutarlılık:**
   - Tüm ekranlarda ana sitedeki renk paleti kullanılacak
   - Component'ler ana sitedeki tasarımlardan adapte edilecek
   - Ana site ile görsel uyum korunacak
   - Enuygun'un sadeliği uygulanacak (gereksiz öğeler kaldırılacak)

5. **Kullanıcı Deneyimi:**
   - Hızlı yükleme (skeleton screens)
   - Anlaşılır hata mesajları
   - Kolay navigasyon
   - Offline durum yönetimi
   - Enuygun gibi sade ve temiz arayüz

---

## 🚀 Hızlı Başlangıç (Yeni Asistanlar İçin)

> **Bu bölüm yeni bir AI asistanı olarak sisteme girenler için hazırlanmıştır.**  
> Rehberi okuduktan sonra bu bölümü takip ederek projeye hızlıca başlayabilirsiniz.

### 📍 Proje Konumları

**Önemli Dosya Yolları:**
- **Mobil App:** `Desktop/grbt8-mobile` (bu proje)
- **Web Site:** `Desktop/grbt8` (kaynak dosyalar buradan kopyalanacak)
- **Admin Panel:** `Desktop/grbt8ap` (referans için)

### ✅ 1. Proje Durumunu Kontrol Et

Önce projenin mevcut durumunu kontrol edin:

```bash
# Proje klasörüne git
cd Desktop/grbt8-mobile

# Dosya yapısını kontrol et
ls -la

# package.json var mı?
cat package.json

# src/ klasörü var mı?
ls src/
```

**Kontrol Listesi:**
- [ ] Proje klasörü var mı? (`Desktop/grbt8-mobile`)
- [ ] `package.json` dosyası var mı?
- [ ] `src/` klasörü var mı?
- [ ] Modül yapısı oluşturuldu mu? (`src/modules/`, `src/core/`)
- [ ] `node_modules/` yüklü mü?

### 🆕 2. Eğer Proje Yoksa - İlk Kurulum

Eğer proje henüz oluşturulmadıysa:

**Adım 1: Expo Projesi Oluştur**
```bash
cd Desktop
npx create-expo-app@latest grbt8-mobile --template expo-template-blank-typescript
cd grbt8-mobile
```

**Adım 2: Paketleri Yükle**
```bash
# Core paketler
npx expo install expo-secure-store expo-notifications expo-updates
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install zustand axios @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
npm install nativewind tailwindcss
npm install react-native-reanimated react-native-gesture-handler
```

**Adım 3: Klasör Yapısını Oluştur**
```bash
# Core klasörler
mkdir -p src/core/{auth,navigation,api,storage,utils}
mkdir -p src/modules/{travel,transfer,games,social}
mkdir -p src/components/{ui,common}
mkdir -p src/store
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/utils
mkdir -p src/constants
```

**Adım 4: Web Sitesinden Dosyaları Kopyala**
```bash
# Types dosyalarını kopyala
cp ../grbt8/src/types/flight.ts src/types/
cp ../grbt8/src/types/passenger.ts src/types/
cp ../grbt8/src/types/airline.ts src/types/
cp ../grbt8/src/types/travel.ts src/types/

# Utils dosyalarını kopyala
cp ../grbt8/src/utils/validation.ts src/utils/
cp ../grbt8/src/utils/format.ts src/utils/

# Countries dosyasını kopyala
cp ../grbt8/src/data/countries.ts src/constants/
```

**Adım 5: Environment Variables**
```bash
# .env dosyası oluştur
cat > .env << EOF
API_URL=https://gurbetbiz.app/api
NODE_ENV=development
EOF
```

### 🔄 3. Eğer Proje Varsa - Devam Et

Eğer proje zaten oluşturulduysa:

**Adım 1: Yapılanlar Bölümünü Oku**
- Rehberin sonundaki "Yapılanlar / Changelog" bölümünü okuyun
- Projenin hangi aşamada olduğunu anlayın
- Son yapılan değişiklikleri kontrol edin

**Adım 2: Geliştirme Roadmap'e Bak**
- Hangi fazdayız? (FAZ 0, FAZ 1, vb.)
- Hangi görevler tamamlandı?
- Sıradaki görevler neler?

**Adım 3: Migration Checklist'e Bak**
- Hangi dosyalar kopyalandı?
- Hangi dosyalar adapte edildi?
- Ne yazılması gerekiyor?

**Adım 4: Mevcut Kodu İncele**
```bash
# Proje yapısını gör
tree src/ -L 3

# Son değişiklikleri gör
git log --oneline -10  # Eğer git kullanılıyorsa

# package.json'ı kontrol et
cat package.json
```

### 🎯 4. İlk Görev - FAZ 0: Super App Altyapısı

Eğer proje yeni başlıyorsa veya FAZ 0 tamamlanmadıysa:

**Öncelik Sırası:**
1. ✅ **Modül Klasörlerini Oluştur**
   ```bash
   mkdir -p src/modules/travel/{flights,hotels,cars,components,screens,services,store,hooks,types}
   mkdir -p src/modules/transfer/{components,screens,services,store}
   mkdir -p src/modules/games/{components,screens,services,store}
   mkdir -p src/modules/social/{components,screens,services,store}
   ```

2. ✅ **Core Yapıyı Kur**
   - `src/core/api/client.ts` - API client (Axios)
   - `src/core/storage/secureStore.ts` - SecureStore wrapper
   - `src/core/auth/` - Auth utilities
   - `src/core/navigation/` - Navigation setup

3. ✅ **Modül Registry Oluştur**
   - `src/modules/registry.ts` - Modül kayıt sistemi

4. ✅ **Global Stores**
   - `src/store/authStore.ts` - Auth state
   - `src/store/appStore.ts` - App state

5. ✅ **Base UI Components**
   - `src/components/ui/Button.tsx`
   - `src/components/ui/Input.tsx`
   - `src/components/ui/Card.tsx`

### 📚 5. Önemli Bölümler

**Mutlaka Oku:**
- ✅ **Super App Mimarisi** - Modüler yapıyı anlamak için
- ✅ **Klasör Yapısı** - Dosya organizasyonu için
- ✅ **State Management (Modüler)** - Store yapısı için
- ✅ **Navigation (Modüler)** - Navigation yapısı için
- ✅ **En Önemli 6 Kural** - Kritik kurallar

**Referans İçin:**
- **Web Sitesinden Kullanılacaklar** - Hangi dosyaları kopyalayacağınız
- **API Client Yapısı** - API çağrıları nasıl yapılacak
- **Authentication Mimarisi** - Auth flow nasıl çalışacak

### ⚠️ Dikkat Edilmesi Gerekenler

1. **Modüler Mimariyi Koru**
   - Modüller arası bağımlılık YOK
   - Her modül bağımsız çalışabilmeli
   - Core yapıyı bozmayın

2. **TypeScript Strict Mode**
   - Tüm kodlar strict mode'da yazılmalı
   - `any` kullanmayın
   - Type safety önemli

3. **Token Storage**
   - `expo-secure-store` kullanın
   - `AsyncStorage` kullanmayın (hassas veri için)

4. **API URL**
   - Environment variable'dan alın
   - Hardcode etmeyin

5. **Değişiklik Yaptığınızda**
   - "Yapılanlar / Changelog" bölümüne ekleyin
   - Kısa açıklama yazın

### 🆘 Yardım Gerektiğinde

1. **Rehberi tekrar okuyun** - Çoğu soru rehberde cevaplanmıştır
2. **Yapılanlar bölümüne bakın** - Benzer sorunlar daha önce çözülmüş olabilir
3. **Web sitesi kodlarına bakın** - `Desktop/grbt8` klasöründeki implementasyonlar referans olabilir
4. **Admin panel'e bakın** - `Desktop/grbt8ap` klasöründeki yapılar referans olabilir

---

## Proje Kurulumu

```bash
# Expo projesi oluştur
npx create-expo-app@latest gurbetbiz-mobile --template expo-template-blank-typescript

cd gurbetbiz-mobile

# Gerekli paketler
npx expo install expo-secure-store expo-notifications expo-updates
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install zustand axios @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
npm install nativewind tailwindcss
npm install react-native-reanimated react-native-gesture-handler
```

### tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@hooks/*": ["src/hooks/*"],
      "@services/*": ["src/services/*"],
      "@types/*": ["src/types/*"],
      "@store/*": ["src/store/*"]
    }
  }
}
```

### Environment Variables

`.env` dosyası oluştur (`.env.example` örneği):

```bash
# Backend API
API_URL=https://gurbetbiz.app/api

# OAuth (Opsiyonel - gelecekte kullanılabilir)
GOOGLE_CLIENT_ID=your_google_client_id
FACEBOOK_CLIENT_ID=your_facebook_client_id

# Development
NODE_ENV=development
```

**Önemli:**
- `API_URL` mutlaka environment variable'dan alınmalı
- Production'da hardcode edilmemeli
- Expo için `expo-constants` ile erişilebilir

---

## Klasör Yapısı

```
gurbetbiz-mobile/
├── App.tsx
├── src/
│   ├── core/                  # Super App Core
│   │   ├── auth/              # Authentication
│   │   ├── navigation/        # Navigation config
│   │   ├── api/               # API client
│   │   ├── storage/           # SecureStore
│   │   └── utils/             # Core utilities
│   │
│   ├── modules/               # Modüller (Modüler Yapı)
│   │   ├── travel/            # SEYAHAT MODÜLÜ ✅ İLK FAZ
│   │   │   ├── flights/      # Uçak bileti
│   │   │   ├── hotels/       # Otel (temel)
│   │   │   ├── cars/         # Araç kiralama (temel)
│   │   │   ├── components/    # Modül components
│   │   │   ├── screens/       # Modül screens
│   │   │   ├── services/     # Modül API services
│   │   │   ├── store/        # Modül state
│   │   │   ├── hooks/        # Modül hooks
│   │   │   ├── types/        # Modül types
│   │   │   └── index.ts      # Modül export
│   │   │
│   │   ├── transfer/         # PARA TRANSFER MODÜLÜ 🔜 SONRA
│   │   │   └── ... (boş, hazır yapı)
│   │   │
│   │   ├── games/            # OYUNLAR MODÜLÜ 🔜 SONRA
│   │   │   └── ... (boş, hazır yapı)
│   │   │
│   │   └── social/           # SOSYAL MODÜLÜ 🔜 SONRA
│   │       └── ... (boş, hazır yapı)
│   │
│   ├── components/            # Shared UI components
│   │   ├── ui/               # Button, Input, Card
│   │   └── common/           # Common components
│   │
│   ├── store/                # Global state (Zustand)
│   │   ├── authStore.ts      # Global auth state
│   │   └── appStore.ts       # Global app state
│   │
│   ├── hooks/                # Shared hooks
│   ├── types/                # Shared types
│   ├── utils/                # Shared utilities
│   └── constants/            # Config, colors
│       ├── colors.ts         # Renk paleti (ana siteden)
│       └── config.ts         # App config
│
│   ├── screens/              # Screen components
│       ├── home/             # Home screen (örnek yapı)
│       │   ├── HomeScreen.tsx # Ana screen (sadece layout)
│       │   ├── components/    # Screen-specific components
│       │   │   ├── HomeHeader.tsx
│       │   │   ├── ServiceIcon.tsx
│       │   │   ├── ServiceIconsList.tsx
│       │   │   └── HomeContent.tsx
│       │   ├── constants/    # Screen-specific constants
│       │   │   └── services.ts
│       │   ├── styles/       # Screen-specific styles
│       │   │   └── homeScreenStyles.ts
│       │   └── index.ts     # Export dosyası
│       └── ...
```

### 🧩 Component-Based Yapı Prensipleri

**Önemli:** Tüm ekranlar ve modüller component-based, modüler yapıda yazılacak.

#### 📋 Temel Prensipler

1. **Her Ekran Kendi Component'lerini İçerir:**
   ```
   src/screens/home/
   ├── HomeScreen.tsx          # Ana screen (sadece layout, ~20 satır)
   ├── components/              # Screen-specific components
   │   ├── HomeHeader.tsx       # Header component
   │   ├── ServiceIcon.tsx      # Tek ikon component
   │   ├── ServiceIconsList.tsx  # İkon listesi wrapper
   │   └── HomeContent.tsx      # İçerik component
   ├── constants/                # Screen-specific data
   │   └── services.ts          # Service listesi
   ├── styles/                  # Screen-specific styles
   │   └── homeScreenStyles.ts   # Tüm StyleSheet'ler
   └── index.ts                 # Export dosyası
   ```

2. **Component Yapısı:**
   - ✅ Her component tek bir sorumluluğa sahip olmalı
   - ✅ Component'ler yeniden kullanılabilir olmalı
   - ✅ Props ile özelleştirilebilir olmalı
   - ✅ Stil ve mantık ayrı tutulmalı

3. **Stil Yönetimi:**
   - ✅ Her screen'in kendi `styles/` klasörü olmalı
   - ✅ StyleSheet'ler ayrı dosyada tutulmalı
   - ✅ Ortak stiller `src/components/ui/` altında olmalı

4. **Data Yönetimi:**
   - ✅ Screen-specific data `constants/` klasöründe
   - ✅ Global constants `src/constants/` altında

#### 🎯 Örnek: HomeScreen Yapısı

**Önce (Kötü - Tek Dosyada):**
```typescript
// HomeScreen.tsx - 260 satır, her şey iç içe
export const HomeScreen = () => {
  // 50 satır service listesi
  // 100 satır JSX
  // 110 satır StyleSheet
  return (...);
};
```

**Sonra (İyi - Component-Based):**
```typescript
// HomeScreen.tsx - 20 satır, sadece layout
import { HomeHeader, ServiceIconsList, HomeContent } from './components';
import { getServices } from './constants/services';

export const HomeScreen = () => {
  const services = getServices(navigation);
  return (
    <View>
      <HomeHeader />
      <ServiceIconsList services={services} />
      <HomeContent />
    </View>
  );
};
```

#### ✅ Component Oluşturma Kuralları

1. **Component Dosya Adlandırması:**
   - PascalCase: `HomeHeader.tsx`
   - Açıklayıcı isimler: `ServiceIcon.tsx` (✅), `Icon.tsx` (❌)

2. **Component İçeriği:**
   - Props interface tanımlanmalı
   - Component tek bir işe odaklanmalı
   - Stil dosyasından import edilmeli

3. **Export Yapısı:**
   - Her klasörde `index.ts` olmalı
   - Tüm export'lar `index.ts` üzerinden yapılmalı

#### 📦 Modül Yapısı (Aynı Prensipler)

Modüller de aynı yapıyı takip eder:

```
src/modules/travel/
├── screens/
│   ├── FlightSearchScreen.tsx
│   └── components/
│       ├── AirportSearchInput.tsx
│       └── DatePicker.tsx
├── constants/
│   └── airports.ts
└── styles/
    └── flightSearchStyles.ts
```

#### ⚠️ Önemli Notlar

1. **Tek Dosyada Her Şey Olmamalı:**
   - ❌ 200+ satırlık tek dosya
   - ✅ Component'lere bölünmüş, her biri <100 satır

2. **Stil ve Mantık Ayrı:**
   - ❌ StyleSheet component içinde
   - ✅ StyleSheet ayrı dosyada (`styles/` klasöründe)

3. **Data ve Component Ayrı:**
   - ❌ Data component içinde tanımlı
   - ✅ Data `constants/` klasöründe

4. **Yeniden Kullanılabilirlik:**
   - Component'ler başka yerlerde de kullanılabilir olmalı
   - Props ile özelleştirilebilir olmalı

#### 🎯 Refactoring Stratejisi

Yeni bir ekran oluştururken:

1. **İlk Adım:** Hızlı prototip (tek dosyada)
2. **İkinci Adım:** Component'lere böl (refactoring)
3. **Üçüncü Adım:** Stil ve data'yı ayır
4. **Son Adım:** Export yapısını düzenle

**Önemli:** Kod çalışır durumda olsa bile, component-based yapıya geçilmeli.

---

## State Management (Modüler)

### Zustand Store Yapısı

**Global Stores:**
- `authStore` - Authentication state (tüm modüller kullanır)
- `appStore` - Global app state (theme, language, vb.)

**Modül Stores:**
- `travelStore` - Seyahat modülü state
- `transferStore` - Para transfer modülü state (gelecek)
- `gamesStore` - Oyunlar modülü state (gelecek)
- `socialStore` - Sosyal modülü state (gelecek)

### Örnek Modül Store

```typescript
// src/modules/travel/store/travelStore.ts
import { create } from 'zustand';

interface TravelState {
  // Uçak bileti
  flightSearchResults: Flight[];
  selectedFlight: Flight | null;
  
  // Otel
  hotelSearchResults: Hotel[];
  selectedHotel: Hotel | null;
  
  // Araç kiralama
  carSearchResults: Car[];
  selectedCar: Car | null;
  
  // Actions
  setFlightResults: (flights: Flight[]) => void;
  setSelectedFlight: (flight: Flight | null) => void;
  // ... diğer actions
}

export const useTravelStore = create<TravelState>((set) => ({
  flightSearchResults: [],
  selectedFlight: null,
  hotelSearchResults: [],
  selectedHotel: null,
  carSearchResults: [],
  selectedCar: null,
  
  setFlightResults: (flights) => set({ flightSearchResults: flights }),
  setSelectedFlight: (flight) => set({ selectedFlight: flight }),
  // ...
}));
```

### Store Organizasyonu

```
src/store/
├── authStore.ts          # Global auth
├── appStore.ts           # Global app state
└── modules/
    ├── travelStore.ts    # Travel module state
    ├── transferStore.ts  # Transfer module state (gelecek)
    ├── gamesStore.ts     # Games module state (gelecek)
    └── socialStore.ts    # Social module state (gelecek)
```

---

## Navigation (Modüler)

### Modül Bazlı Navigation

Her modül kendi navigation yapısını tanımlar:

```typescript
// src/modules/travel/navigation/travelNavigation.ts
export const travelScreens = {
  FlightSearch: 'Travel/FlightSearch',
  FlightResults: 'Travel/FlightResults',
  FlightDetails: 'Travel/FlightDetails',
  HotelSearch: 'Travel/HotelSearch',
  CarSearch: 'Travel/CarSearch',
  // ...
};

// src/core/navigation/AppNavigator.tsx
import { travelScreens } from '@/modules/travel/navigation';

export type RootStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;
  
  // Travel Module
  ...travelScreens;
  
  // Transfer Module (gelecek)
  // ...transferScreens;
  
  // Games Module (gelecek)
  // ...gamesScreens;
};
```

### Bottom Tab Navigation

```typescript
// src/core/navigation/TabNavigator.tsx
export const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Travel" component={TravelTab} />  {/* ✅ İlk faz */}
      {/* <Tab.Screen name="Transfer" component={TransferTab} /> */}  {/* 🔜 Sonra */}
      {/* <Tab.Screen name="Games" component={GamesTab} /> */}  {/* 🔜 Sonra */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
```

### Navigation Yapısı

```
src/core/navigation/
├── AppNavigator.tsx       # Root navigator
├── TabNavigator.tsx       # Bottom tabs
├── AuthNavigator.tsx      # Auth screens
└── types.ts               # Navigation types

src/modules/travel/navigation/
├── travelNavigation.ts   # Travel module screens
└── TravelTab.tsx         # Travel tab component
```

---

## Web Sitesinden Kullanılacaklar

### ✅ Direkt Kopyalanacak

Web projesinden (`Desktop/grbt8`) mobil projeye direkt kopyalanacak dosyalar:

```
Web (grbt8)                    →    Mobil (grbt8-mobile)
────────────────────────────────────────────────────────
src/types/flight.ts            →    src/types/flight.ts
src/types/passenger.ts         →    src/types/passenger.ts
src/types/airline.ts           →    src/types/airline.ts
src/types/travel.ts            →    src/types/travel.ts  ✅ YENİ
src/utils/validation.ts        →    src/utils/validation.ts
src/utils/format.ts            →    src/utils/format.ts
src/data/countries.ts         →    src/constants/countries.ts
```

### ✅ Aynı Backend API'leri

Mobil app, web sitesi ve admin panel ile **aynı backend API'lerini** kullanır:

#### Authentication Endpoints
```
POST   /api/auth/login              → Email/şifre ile giriş (JWT döndürmüyor, yeni endpoint gerekli)
POST   /api/auth/register           → Yeni kullanıcı kaydı
POST   /api/auth/forgot-password    → Şifre sıfırlama isteği
POST   /api/auth/reset-password     → Şifre sıfırlama
POST   /api/auth/change-password    → Şifre değiştirme
POST   /api/auth/mobile-login       → Mobil için JWT döndüren endpoint (YENİ OLUŞTURULACAK)
POST   /api/auth/refresh            → Token yenileme (YENİ OLUŞTURULACAK)
```

#### Flight Endpoints
```
POST   /api/flights/search-cached   → Uçuş arama (cache'li)
GET    /api/airports/search         → Havalimanı arama (?q=query)
```

#### Reservation Endpoints
```
GET    /api/reservations            → Kullanıcının rezervasyonları (?type=flight|hotel|car)
POST   /api/reservations            → Yeni rezervasyon oluştur
```

#### Passenger Endpoints
```
GET    /api/passengers              → Kullanıcının yolcuları
POST   /api/passengers              → Yeni yolcu ekle
GET    /api/passengers/[id]         → Yolcu detayı
PUT    /api/passengers/[id]         → Yolcu güncelle
DELETE /api/passengers/[id]         → Yolcu sil
```

#### Payment Endpoints
```
POST   /api/payment/process         → Ödeme işlemi
POST   /api/payment/3d-secure/initiate    → 3D Secure başlat
POST   /api/payment/3d-secure/complete    → 3D Secure tamamla
GET    /api/payment/3d-secure-callback    → 3D Secure callback
POST   /api/payment/tokenize        → Kart tokenizasyonu
GET    /api/payment/bin-info        → BIN bilgisi sorgulama
```

#### User & Profile Endpoints
```
GET    /api/user/profile            → Kullanıcı profili
PUT    /api/user/update             → Profil güncelle
GET    /api/billing-info            → Fatura bilgileri
POST   /api/billing-info            → Fatura bilgisi ekle/güncelle
```

#### Utility Endpoints
```
GET    /api/euro-rate               → Euro kuru bilgisi
```

**Önemli:** 
- Mobil app **direkt Bilet Dükkanı API'sine gitmez**
- Tüm istekler web backend üzerinden yapılır
- API key'ler backend'de güvende kalır
- Mevcut `/api/auth/login` JWT token döndürmüyor, mobil için yeni endpoint gerekiyor

### 🔗 Admin Panel Entegrasyonu

Admin panel (`grbt8ap` - `grbt8.store`) ile mobil app **aynı database'i** kullanır:

- Admin panel'de yapılan değişiklikler mobil app'te görülebilir
- Mobil app'teki rezervasyonlar admin panel'de görülebilir
- Kullanıcı verileri her iki yerde de senkronize

**Örnek Akış:**
```
1. Kullanıcı mobil app'ten rezervasyon yapar
   ↓
2. Rezervasyon database'e kaydedilir
   ↓
3. Admin panel'de (grbt8.store) görülebilir
   ↓
4. Admin rezervasyonu onaylar/iptal eder
   ↓
5. Mobil app'te kullanıcı durumu görür
```

---

## Admin Panel Entegrasyonu

> **Admin Panel:** https://www.grbt8.store/  
> **Lokasyon:** `Desktop/grbt8ap`  
> **Teknoloji:** Next.js 13.5.6 + TypeScript + Prisma

### 📊 Admin Panel'den Mobil Uygulama Yönetimi

Admin panel, mobil uygulama kullanıcılarını ve işlemlerini yönetmek için kullanılacak:

#### 1. Kullanıcı Yönetimi
- **Endpoint:** `/api/users` (GET, POST)
- **Sayfa:** `/kullanici`
- **Özellikler:**
  - Mobil uygulama kullanıcılarını görüntüleme
  - Kullanıcı detayları (rezervasyonlar, ödemeler, yolcular)
  - Kullanıcı durumu değiştirme (aktif/pasif)
  - Kullanıcı silme
  - Toplu işlemler
  - CSV export

#### 2. Rezervasyon Yönetimi
- **Endpoint:** `/api/reservations` (GET, POST)
- **Sayfa:** `/rezervasyonlar`
- **Özellikler:**
  - Mobil uygulama rezervasyonlarını görüntüleme
  - Rezervasyon detayları
  - Rezervasyon durumu değiştirme
  - Rezervasyon iptal/onaylama
  - Filtreleme ve arama

#### 3. Dashboard & İstatistikler
- **Endpoint:** `/api/dashboard/stats`
- **Sayfa:** `/dashboard`
- **Mobil Uygulama Metrikleri:**
  - Mobil uygulama kullanıcı sayısı
  - Mobil uygulama rezervasyon sayısı
  - Mobil uygulama gelir istatistikleri
  - Aktif mobil kullanıcılar (24 saat)

#### 4. Kampanya Yönetimi
- **Endpoint:** `/api/campaigns`
- **Sayfa:** `/kampanyalar`
- **Mobil Uygulama İçin:**
  - Mobil uygulama kampanyaları oluşturma
  - Push notification ile kampanya gönderme (gelecek)
  - Kampanya istatistikleri

#### 5. Email Yönetimi
- **Endpoint:** `/api/email/send`
- **Sayfa:** `/email`
- **Mobil Uygulama İçin:**
  - Mobil kullanıcılara email gönderme
  - Rezervasyon onay email'leri
  - Kampanya email'leri

### 🔄 Veri Senkronizasyonu

Admin panel, mobil uygulama ve web sitesi **aynı database'i** kullanır:

```
┌─────────────────────────────────────────┐
│         PostgreSQL Database             │
│  (grbt8/prisma/schema.prisma)           │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴───────┬──────────────┐
       ↓              ↓              ↓
   Web Site      Admin Panel    Mobil App
  (grbt8)        (grbt8ap)    (grbt8-mobile)
```

**Sonuç:**
- Mobil uygulama rezervasyonları → Admin panel'de görünür ✅
- Admin panel'de yapılan değişiklikler → Mobil uygulama'da görünür ✅
- Kullanıcı verileri → Her iki yerde de senkronize ✅

### 📱 Mobil Uygulama İçin Admin Panel API'leri

Mobil uygulama, admin panel API'lerini **direkt kullanmaz**. Tüm istekler web backend (`gurbetbiz.app/api`) üzerinden yapılır.

**Admin Panel API'leri sadece admin panel UI için:**
- `/api/users` - Admin panel kullanıcı listesi
- `/api/dashboard/stats` - Admin panel dashboard
- `/api/email/send` - Admin panel email gönderimi

**Mobil Uygulama API'leri (web backend):**
- `https://gurbetbiz.app/api/auth/*` - Authentication
- `https://gurbetbiz.app/api/flights/*` - Uçuş işlemleri
- `https://gurbetbiz.app/api/reservations` - Rezervasyonlar
- `https://gurbetbiz.app/api/payment/*` - Ödemeler

### 🔮 Gelecek Özellikler (Admin Panel)

#### Push Notification Yönetimi
- **Endpoint:** `/api/push/notifications` (oluşturulacak)
- **Özellikler:**
  - Mobil uygulama kullanıcılarına push notification gönderme
  - Segment bazlı bildirimler (tüm kullanıcılar, belirli ülke, vb.)
  - Bildirim şablonları
  - Bildirim istatistikleri

#### Mobil Uygulama Ayarları
- **Endpoint:** `/api/mobile/settings` (oluşturulacak)
- **Özellikler:**
  - Mobil uygulama versiyon yönetimi
  - Zorunlu güncelleme ayarları
  - Maintenance mode
  - Feature flags

#### Mobil Uygulama Analytics
- **Endpoint:** `/api/mobile/analytics` (oluşturulacak)
- **Özellikler:**
  - Mobil uygulama kullanım istatistikleri
  - Ekran görüntüleme sayıları
  - Kullanıcı davranış analizi
  - Crash raporları

### ⚠️ Önemli Notlar

1. **Admin Yetkisi:**
   - Admin panel API'leri `requireAdmin` middleware ile korunuyor
   - Mobil uygulama kullanıcıları admin panel'e erişemez
   - Sadece admin rolündeki kullanıcılar admin panel'i kullanabilir

2. **Database Paylaşımı:**
   - Admin panel, mobil uygulama ve web sitesi aynı Prisma schema'yı kullanır
   - Schema değişiklikleri tüm projeleri etkiler
   - Migration'lar dikkatli yapılmalı

3. **API Güvenliği:**
   - Admin panel API'leri admin authentication gerektirir
   - Mobil uygulama API'leri JWT token ile korunur
   - Her iki sistem farklı authentication mekanizması kullanır

---

## Authentication Mimarisi

> **⚠️ ÖNEMLİ:** Web sitesindeki `/api/auth/login` endpoint'i JWT token döndürmüyor, sadece user bilgisi döndürüyor. 
> NextAuth cookie-based authentication kullanıyor. Mobil app için backend'de yeni endpoint'ler oluşturulmalı.

### Mevcut Durum (Web)
- `/api/auth/login` → `{ success: true, user: {...} }` döndürüyor (JWT yok)
- NextAuth cookie-based session kullanıyor
- `jose` paketi mevcut (JWT oluşturmak için kullanılabilir)

### Mobil İçin Gereken Endpoint'ler

#### 1. `/api/auth/mobile-login` (YENİ OLUŞTURULACAK)
```typescript
// Request
POST /api/auth/mobile-login
{
  email: string;
  password: string;
}

// Response
{
  success: true,
  accessToken: string,    // JWT token
  refreshToken: string,  // Refresh token
  user: {
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    phone?: string,
    // ... diğer user bilgileri
  }
}
```

#### 2. `/api/auth/refresh` (YENİ OLUŞTURULACAK)
```typescript
// Request
POST /api/auth/refresh
{
  refreshToken: string
}

// Response
{
  success: true,
  accessToken: string,
  refreshToken: string  // Yeni refresh token (rotate)
}
```

#### 3. OAuth Login (Google/Facebook)
Web sitesinde Google ve Facebook OAuth var. Mobil için de desteklenebilir:
- Google: `expo-auth-session/providers/google`
- Facebook: `expo-auth-session/providers/facebook`
- Backend'de `/api/auth/oauth-callback` endpoint'i gerekebilir

### JWT Flow (NextAuth ile uyumlu)

```
1. LOGIN
   User → App → API (/api/auth/login)
   ↓
   API returns: { accessToken, refreshToken, user }
   ↓
   App stores tokens in SecureStore

2. API REQUESTS
   Every request: Authorization: Bearer <accessToken>

3. TOKEN REFRESH
   401 error → Auto refresh → Retry request
```

### Secure Storage

```typescript
// src/services/storage/secureStore.ts
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  async setTokens(accessToken: string, refreshToken: string) {
    await SecureStore.setItemAsync('access_token', accessToken);
    await SecureStore.setItemAsync('refresh_token', refreshToken);
  },

  async getAccessToken() {
    return SecureStore.getItemAsync('access_token');
  },

  async clearAll() {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
  },
};
```

---

## API Client Yapısı

### Axios with Interceptors

```typescript
// src/services/api/client.ts
import axios from 'axios';
import { secureStorage } from '../storage/secureStore';
import { API_URL } from '@/constants/config';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Request - Add token
apiClient.interceptors.request.use(async (config) => {
  const token = await secureStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response - Handle 401 & Error Format
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 401 Unauthorized - Token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await secureStorage.getRefreshToken();
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        await secureStorage.setTokens(accessToken, newRefreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh başarısız - logout
        await secureStorage.clearAll();
        // Navigate to login
        return Promise.reject(refreshError);
      }
    }
    
    // Error format standardizasyonu
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.error 
      || error.message 
      || 'Bir hata oluştu';
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      code: error.response?.data?.errorCode,
      data: error.response?.data
    });
  }
);
```

### Error Handling Pattern

```typescript
// src/utils/error.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Kullanım
try {
  const response = await apiClient.get('/api/reservations');
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API error
  }
}
```

### 3D Secure Flow

Mobil uygulamada 3D Secure işlemi için WebView kullanılacak:

```typescript
// src/services/payment/3dSecure.ts
import { WebBrowser } from 'expo-web-browser';

export async function handle3DSecure(redirectUrl: string) {
  const result = await WebBrowser.openAuthSessionAsync(
    redirectUrl,
    'gurbetbiz://3d-secure-callback'
  );
  
  if (result.type === 'success') {
    // Callback URL'den token'ı al
    const url = new URL(result.url);
    const token = url.searchParams.get('token');
    return token;
  }
  
  throw new Error('3D Secure işlemi tamamlanamadı');
}
```

**Flow:**
1. `/api/payment/process` çağrılır
2. Response'da `requires3DSecure: true` ve `redirectUrl` gelir
3. WebView'da 3D Secure sayfası açılır
4. Kullanıcı doğrulama yapar
5. Callback URL'den token alınır
6. `/api/payment/3d-secure/complete` ile ödeme tamamlanır

---

## Güvenlik Checklist

### ✅ BAŞTAN Yapılacaklar

| # | Konu | Nasıl | Öncelik |
|---|------|-------|---------|
| 1 | **Token Storage** | expo-secure-store KULLAN | 🔴 Kritik |
| 2 | **API URL** | Environment variable | 🔴 Kritik |
| 3 | **HTTPS** | Tüm API çağrıları | 🔴 Kritik |
| 4 | **Input Validation** | Client + Server | 🔴 Kritik |
| 5 | **Logout** | Tüm token'ları temizle | 🔴 Kritik |

### Web'de Yaşanan Sorunlar → Mobil'de Çözüm

| Web Sorunu | Mobil Çözüm |
|------------|-------------|
| CORS hataları | Mobil'de CORS yok! ✅ |
| Cookie yönetimi | Token tabanlı auth |
| CSP sorunları | Mobil'de CSP yok ✅ |
| SEO endişeleri | Mobil'de SEO yok ✅ |

---

## Test Strategy

### Test Kütüphaneleri

```bash
# Test paketleri
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
npm install --save-dev jest-expo
```

### Test Yapısı

```
__tests__/
├── components/           # Component testleri
│   ├── ui/
│   │   └── Button.test.tsx
│   └── flight/
│       └── FlightCard.test.tsx
│
├── screens/              # Screen testleri
│   └── auth/
│       └── LoginScreen.test.tsx
│
├── hooks/                # Hook testleri
│   └── useAuth.test.ts
│
├── utils/                # Utility testleri
│   └── validation.test.ts
│
└── services/             # API mock testleri
    └── api/
        └── flights.test.ts
```

### Test Kategorileri

| Kategori | Araç | Kapsam |
|----------|------|--------|
| **Unit** | Jest | Utils, hooks, pure functions |
| **Component** | React Native Testing Library | UI components |
| **Integration** | Jest + MSW | API calls |
| **E2E** | Detox (opsiyonel) | Full user flows |

### Örnek Test

```typescript
// __tests__/utils/validation.test.ts
import { userSchema } from '@/utils/validation';

describe('userSchema.login', () => {
  it('should validate correct email', () => {
    const result = userSchema.login.safeParse({
      email: 'test@example.com',
      password: '12345678'
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = userSchema.login.safeParse({
      email: 'invalid-email',
      password: '12345678'
    });
    expect(result.success).toBe(false);
  });
});
```

### Web'den Aktarılacak Testler

```
Web (grbt8)                      →    Mobil
────────────────────────────────────────────────
__tests__/utils/*.ts             →    __tests__/utils/*.ts ✅
__tests__/lib/schemas.test.ts    →    Adapte edilecek
Test helpers/mocks               →    Adapte edilecek
```

---

## Migration Checklist

### ✅ HAZIR (Kopyala-Yapıştır)

Direkt kopyalanacak, değişiklik gerekmez:

- [ ] `src/types/flight.ts`
- [ ] `src/types/passenger.ts`
- [ ] `src/types/airline.ts`
- [ ] `src/types/travel.ts`  ✅ YENİ
- [ ] `src/utils/validation.ts` (Zod schemas)
- [ ] `src/utils/format.ts` (genişletilecek)
- [ ] `src/data/countries.ts`

### 🔧 ADAPTE EDİLECEK

Mantık aynı, syntax/import değişecek:

- [ ] `src/services/biletdukkani/*` → Axios'a çevir
- [ ] API error handling patterns
- [ ] Test utilities & mocks
- [ ] Date/time formatting (date-fns uyumu)

### 📝 YENİ YAZILACAK

Sıfırdan yazılacak:

- [ ] `/api/auth/mobile-login` endpoint (backend)
- [ ] `/api/auth/refresh` endpoint (backend)
- [ ] Zustand stores (authStore, travelStore, vb.)
- [ ] React Navigation setup
- [ ] SecureStore wrapper
- [ ] `src/constants/colors.ts` - Renk paleti (ana siteden)
- [ ] Base UI components (Button, Input, Card) - Ana site stilinde
- [ ] Socket.io client (oyunlar için - gelecek)
- [ ] Game engines (Tavla, Okey, Batak - gelecek)
- [ ] Push notification handlers (gelecek)

### 🔗 Admin Panel Entegrasyonu

Admin panel (`grbt8ap`) ile mobil uygulama entegrasyonu:

- [ ] Mobil uygulama kullanıcıları admin panel'de görüntülenebilir (zaten mevcut)
- [ ] Mobil uygulama rezervasyonları admin panel'de yönetilebilir (zaten mevcut)
- [ ] Mobil uygulama için push notification yönetimi (gelecek)
- [ ] Mobil uygulama analytics endpoint'leri (gelecek)
- [ ] Mobil uygulama ayarları yönetimi (gelecek)

### 📦 format.ts Genişletme Listesi

Mevcut `format.ts`'e eklenecekler:

```typescript
// Mobil için eklenecek formatlar

// Para birimi formatı (locale-aware)
export const formatCurrency = (amount: number, currency: string, locale = 'tr-TR') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

// Tarih formatı (kısa)
export const formatDateShort = (date: string | Date) => {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date));
};

// Saat formatı
export const formatTime = (date: string | Date) => {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Uçuş süresi formatı
export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}s ${mins}dk`;
};

// Telefon numarası formatı
export const formatPhone = (phone: string) => {
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
};

// IBAN formatı
export const formatIBAN = (iban: string) => {
  return iban.replace(/(.{4})/g, '$1 ').trim();
};
```

---

## Geliştirme Roadmap

### 🏗️ FAZ 0: Super App Altyapısı (2 hafta) - ŞİMDİ
**Amaç:** Modüler mimariyi kurmak, gelecekteki modüller için hazırlık

- [ ] Modül yapısını oluştur (travel, transfer, games, social klasörleri)
- [ ] Modül registry sistemi
- [ ] Core navigation yapısı (modüler)
- [ ] Core state management (global + modül stores)
- [ ] API client (genişletilebilir)
- [ ] Auth flow
- [ ] Base UI components
- [ ] Error handling & boundaries

### ✈️ FAZ 1: Seyahat Modülü - Uçak Bileti (3 hafta) - ŞİMDİ
- [ ] Uçuş arama formu
- [ ] Arama sonuçları
- [ ] Rezervasyon
- [ ] Ödeme entegrasyonu
- [ ] Rezervasyon geçmişi

### 🏨 FAZ 2: Seyahat Modülü - Otel & Araç (2 hafta) - ŞİMDİ
- [ ] Otel arama (temel)
- [ ] Otel rezervasyonu
- [ ] Araç kiralama arama (temel)
- [ ] Araç kiralama rezervasyonu

### 👤 FAZ 3: Profil & Hesap (1 hafta) - ŞİMDİ
- [ ] Profil sayfası
- [ ] Rezervasyon geçmişi (tüm seyahat türleri)
- [ ] Ayarlar sayfası

### 🚀 FAZ 4: MVP Launch (1 hafta) - ŞİMDİ
- [ ] Testing
- [ ] Performance optimization
- [ ] Store publish hazırlığı

### 🔜 FAZ 5: Para Transferi Modülü (3 hafta) - SONRA
- [ ] Transfer modülü yapısını doldur
- [ ] Rapyd/Wise entegrasyonu
- [ ] Transfer formu
- [ ] KYC flow
- [ ] Transfer geçmişi

### 🔜 FAZ 6: Oyunlar Modülü (6 hafta) - SONRA
- [ ] Games modülü yapısını doldur
- [ ] Game server (Socket.io)
- [ ] Tavla
- [ ] Okey
- [ ] Batak

### 🔜 FAZ 7: Sosyal Modülü (2 hafta) - SONRA
- [ ] Social modülü yapısını doldur
- [ ] Arkadaş listesi
- [ ] Oyun daveti
- [ ] Sohbet

---

## En Önemli 6 Kural

1. **Token'ları SecureStore'da sakla** - AsyncStorage KULLANMA
2. **API URL'yi env variable'dan al** - Hardcode ETME
3. **TypeScript strict mode** - Hataları erken yakala
4. **Error boundary'leri baştan koy** - Crash önle
5. **Modüler mimariyi koru** - Modüller arası bağımlılık YOK
6. **Navigation types baştan tanımla** - Tip güvenliği

---

## Faydalı Kaynaklar

- **Expo Docs:** https://docs.expo.dev
- **React Navigation:** https://reactnavigation.org
- **Zustand:** https://github.com/pmndrs/zustand
- **NativeWind:** https://nativewind.dev
- **Socket.io:** https://socket.io

---

## 🔍 Web vs Mobil Karşılaştırma Analizi

### Web Projesi (grbt8) Mevcut Durum

| Kategori | Web Projesi | Mobil'e Aktarım |
|----------|-------------|-----------------|
| **Framework** | Next.js 13.5.6 | - |
| **Language** | TypeScript 5.5.3 (strict) | ✅ Aynı |
| **UI** | React 18.2 + Tailwind 3.4.4 | NativeWind |
| **Database** | Prisma + PostgreSQL | Backend'de kalır |
| **Auth** | NextAuth 4.24.5 | JWT + SecureStore |
| **Validation** | Zod 3.22.4 | ✅ Aynı |
| **State** | Custom hooks | Zustand |
| **Path Aliases** | `@/*` | ✅ Aynı |

### Direkt Kopyalanacak Dosyalar

```
WEB                              →    MOBİL
────────────────────────────────────────────────
src/types/flight.ts              →    src/types/flight.ts ✅
src/types/passenger.ts           →    src/types/passenger.ts ✅
src/types/airline.ts             →    src/types/airline.ts ✅
src/types/travel.ts              →    src/types/travel.ts ✅ YENİ
src/utils/validation.ts          →    src/utils/validation.ts ✅
src/utils/format.ts              →    src/utils/format.ts ✅
src/data/countries.ts            →    src/constants/countries.ts ✅
```

### Backend Değişiklik Gereksinimi

⚠️ **JWT Endpoint'leri Eklenmeli:**

```typescript
// 1. Yeni endpoint: /api/auth/mobile-login
// Mevcut /api/auth/login JWT döndürmüyor, sadece user bilgisi döndürüyor
// NextAuth cookie-based çalışıyor
// Mobil için JWT token döndüren yeni endpoint gerekli

// 2. Yeni endpoint: /api/auth/refresh
// Refresh token ile yeni access token almak için

// 3. Mevcut endpoint'ler mobil için de kullanılabilir:
// - /api/auth/register
// - /api/auth/forgot-password
// - /api/auth/reset-password
// - /api/auth/change-password
```

**Not:** Web sitesinde `jose` paketi mevcut, JWT oluşturmak için kullanılabilir.

### Uyum Skoru: 9/10 🎯

| Kriter | Durum |
|--------|-------|
| Teknoloji uyumu | ✅ |
| Kod paylaşımı | ✅ |
| Backend uyumu | ✅ |
| Web hatalarından kaçınma | ✅ |
| Güvenlik | ✅ |

### Web'de Yaşanan → Mobil'de Yok

- ❌ CORS hataları → Mobil'de CORS yok
- ❌ Cookie/Session karmaşası → JWT basit
- ❌ CSP sorunları → Mobil'de CSP yok
- ❌ SEO endişeleri → Mobil'de SEO yok

---

## Yapılanlar / Changelog

> **Not:** Her yeni asistan, yaptığı değişiklikleri buraya eklemelidir. Bu sayede proje gelişimi takip edilir ve yeni asistanlar kolayca anlayabilir.

### 📝 Format

Her giriş şu formatta olmalıdır:
- **Tarih:** YYYY-MM-DD
- **Asistan:** (opsiyonel)
- **Değişiklik:** Kısa açıklama
- **Detay:** (opsiyonel) Daha detaylı bilgi

---

### 2024-12-XX - Rehber Oluşturuldu

**Değişiklik:** İlk rehber versiyonu oluşturuldu

**Detay:**
- Proje vizyonu tanımlandı
- Sistem mimarisi belirlendi
- Teknoloji seçimleri yapıldı
- Temel klasör yapısı planlandı

---

### 2024-12-XX - Web Sitesi ve Admin Panel Analizi

**Değişiklik:** Web sitesi (`grbt8`) ve admin panel (`grbt8ap`) analiz edildi, rehbere entegre edildi

**Detay:**
- Web sitesinden kopyalanacak dosyalar belirlendi (`flight.ts`, `passenger.ts`, `airline.ts`, `travel.ts`, `validation.ts`, `format.ts`, `countries.ts`)
- Tüm API endpoint'leri listelendi (Auth, Flight, Reservation, Passenger, Payment, User, Utility)
- Admin panel entegrasyonu bölümü eklendi
- Admin panel'den mobil uygulama yönetimi özellikleri dokümante edildi
- 3D Secure flow açıklaması eklendi
- Error handling pattern eklendi
- Environment variables bölümü eklendi

---

### 2024-12-XX - Super App Mimarisi Eklendi

**Değişiklik:** Rehber super app mimarisi için güncellendi

**Detay:**
- Proje vizyonu güncellendi: Modüler mimari vurgulandı, ilk faz kapsamı (MVP) eklendi
- Yeni bölüm: "Super App Mimarisi" eklendi
  - Modüler yapı açıklaması
  - Modül Registry Pattern örneği
  - İlk faz: Seyahat modülü detayları
- Klasör yapısı modüler yapıya göre güncellendi
  - `core/` klasörü eklendi (Super App Core)
  - `modules/` klasörü eklendi (travel, transfer, games, social)
  - Tüm modüller için hazır klasör yapısı oluşturuldu
- Yeni bölüm: "State Management (Modüler)" eklendi
  - Global stores (authStore, appStore)
  - Modül stores (travelStore, transferStore, gamesStore, socialStore)
  - Örnek modül store kodu
- Yeni bölüm: "Navigation (Modüler)" eklendi
  - Modül bazlı navigation yapısı
  - Bottom Tab Navigation örneği
- Geliştirme Roadmap güncellendi
  - FAZ 0: Super App Altyapısı eklendi (2 hafta)
  - FAZ 1-4: Seyahat modülü (MVP)
  - FAZ 5-7: Gelecek modüller
- En Önemli Kurallar'a 6. kural eklendi: "Modüler mimariyi koru"

**Sonuç:** Sistem baştan super app olarak tasarlandı, ilk fazda sadece seyahat modülü geliştirilecek, diğer modüller için altyapı hazır.

---

### 2024-12-XX - Hızlı Başlangıç Bölümü Eklendi

**Değişiklik:** Yeni asistanlar için "Hızlı Başlangıç" bölümü eklendi

**Detay:**
- Proje durumunu kontrol etme adımları eklendi
- İlk kurulum için detaylı adımlar eklendi
- Mevcut projeye devam etme rehberi eklendi
- İlk görevler (FAZ 0) için öncelik sırası belirlendi
- Önemli bölümler listesi eklendi
- Dikkat edilmesi gerekenler vurgulandı
- Yardım gerektiğinde nereye bakılacağı belirtildi

**Sonuç:** Yeni asistanlar artık rehberi okuyarak projeye hızlıca başlayabilir, projenin durumunu anlayabilir ve ilk görevlerini belirleyebilir.

---

### 2024-12-XX - Tasarım & UI Bölümü Eklendi

**Değişiklik:** Tasarım prensipleri ve UI rehberi eklendi

**Detay:**
- Ana sitenin mobil görünümü **birincil referans** olarak belirlendi
- **Enuygun.com mobil uygulaması sadece stil referansı** olarak eklendi (sadelik, fontlar)
- Renk paleti tanımlandı (yeşil, mavi, gri tonları - ana siteden)
- UI bileşenleri (Button, Input, Card) için stil rehberi eklendi
- Renk tanımları için `src/constants/colors.ts` dosyası planlandı
- Tasarım kuralları belirlendi (renk tutarlılığı, tipografi, spacing)
- Tasarım yaklaşımı netleştirildi:
  - **Ana siteden:** Layout, renkler, component tasarımları
  - **Enuygun'dan:** Sadece sadelik, fontlar, spacing
- Referans kontrol listesi eklendi (öncelik sırası ile)
- NativeWind kullanımı için notlar eklendi

**Sonuç:** Mobil uygulama tasarımı ana site (`gurbetbiz.app`) mobil görünümü gibi olacak, renkler ve layout aynı kalacak. Enuygun'un sadeliği ve fontları stil referansı olarak kullanılacak.

---

### 2024-12-XX - FAZ 0 Başlatıldı: Modül Klasör Yapısı Oluşturuldu

**Değişiklik:** Super app altyapısı için modül klasör yapısı oluşturuldu

**Detay:**
- Core klasör yapısı oluşturuldu (`src/core/`)
  - `auth/` - Authentication utilities
  - `navigation/` - Navigation config
  - `api/` - API client
  - `storage/` - SecureStore wrapper
  - `utils/` - Core utilities
- Modül klasör yapısı oluşturuldu (`src/modules/`)
  - `travel/` - Seyahat modülü (flights, hotels, cars alt klasörleri ile)
  - `transfer/` - Para transfer modülü (gelecek)
  - `games/` - Oyunlar modülü (gelecek)
  - `social/` - Sosyal modülü (gelecek)
- Travel modülü alt yapısı oluşturuldu:
  - `flights/`, `hotels/`, `cars/` alt klasörleri
  - `components/`, `screens/`, `services/`, `store/`, `hooks/`, `types/` klasörleri

**Dosyalar:**
- Klasör yapısı oluşturuldu (henüz dosya yok)

---

### 2024-12-XX - Core Yapı Kuruldu: SecureStore ve API Client

**Değişiklik:** Core yapı dosyaları oluşturuldu

**Detay:**
- SecureStore wrapper oluşturuldu (`src/core/storage/secureStore.ts`)
  - Token storage (access, refresh)
  - User data storage
  - Clear all functionality
- API Client oluşturuldu (`src/core/api/client.ts`)
  - Axios instance with interceptors
  - Request interceptor (token ekleme)
  - Response interceptor (401 handling, token refresh, error formatting)
  - Config'den API URL kullanımı
- Error handling utilities eklendi (`src/utils/error.ts`)
  - ApiError class
  - Error type checking
  - Error message formatting
- Core utils index eklendi (`src/core/utils/index.ts`)

**Dosyalar:**
- `src/core/storage/secureStore.ts` - Oluşturuldu
- `src/core/api/client.ts` - Oluşturuldu
- `src/utils/error.ts` - Oluşturuldu
- `src/core/utils/index.ts` - Oluşturuldu

---

### 2024-12-XX - Auth ve Navigation Types Oluşturuldu

**Değişiklik:** Authentication service ve navigation types eklendi

**Detay:**
- Auth types oluşturuldu (`src/core/auth/types.ts`)
  - User interface
  - LoginCredentials, LoginResponse, RefreshTokenResponse
  - RegisterData interface
- Auth service oluşturuldu (`src/core/auth/authService.ts`)
  - login() - Email/password ile giriş
  - register() - Yeni kullanıcı kaydı
  - refreshToken() - Token yenileme
  - getCurrentUser() - Mevcut kullanıcı bilgisi
  - logout() - Çıkış
  - isAuthenticated() - Auth kontrolü
- Navigation types oluşturuldu (`src/core/navigation/types.ts`)
  - AuthStackParamList
  - TravelStackParamList
  - MainTabParamList
  - RootStackParamList
  - Type-safe navigation için global type declarations

**Dosyalar:**
- `src/core/auth/types.ts` - Oluşturuldu
- `src/core/auth/authService.ts` - Oluşturuldu
- `src/core/auth/index.ts` - Oluşturuldu
- `src/core/navigation/types.ts` - Oluşturuldu
- `src/core/navigation/index.ts` - Oluşturuldu

---

### 2024-12-XX - Modül Registry Sistemi Oluşturuldu

**Değişiklik:** Super app için modül kayıt sistemi eklendi

**Detay:**
- Module Registry oluşturuldu (`src/modules/registry.ts`)
  - ModuleConfig interface
  - ModuleRegistry interface ve implementation
  - Singleton pattern ile merkezi kayıt sistemi
  - Module kayıt, sorgulama, filtreleme metodları
- Modüller kayıt edildi:
  - Travel Module: Aktif (enabled: true)
  - Transfer Module: Kapalı (FAZ 5'te aktif)
  - Games Module: Kapalı (FAZ 6'da aktif)
  - Social Module: Kapalı (FAZ 7'de aktif)

**Dosyalar:**
- `src/modules/registry.ts` - Oluşturuldu

---

### 2024-12-XX - Global Stores Oluşturuldu

**Değişiklik:** Zustand ile global state management kuruldu

**Detay:**
- Auth Store oluşturuldu (`src/store/authStore.ts`)
  - User state
  - isAuthenticated state
  - isLoading state
  - login() action
  - logout() action
  - checkAuth() action
  - setUser() action
- App Store oluşturuldu (`src/store/appStore.ts`)
  - Theme state (light/dark)
  - Language state (tr/en)
  - isInitialized state
  - isOnline state (network status)
  - Setter actions
- Store index eklendi (`src/store/index.ts`)

**Dosyalar:**
- `src/store/authStore.ts` - Oluşturuldu
- `src/store/appStore.ts` - Oluşturuldu
- `src/store/index.ts` - Oluşturuldu

---

### 2024-12-XX - Base UI Components Oluşturuldu

**Değişiklik:** Ana site renkleri ve Enuygun sadeliği ile base UI component'leri oluşturuldu

**Detay:**
- Button component oluşturuldu (`src/components/ui/Button.tsx`)
  - Variants: primary, secondary, outline, ghost
  - Sizes: small, medium, large
  - Loading state
  - Disabled state
  - Full width option
  - Touch-friendly (min 44px height)
  - Ana site renkleri kullanıldı (green-600 primary)
- Input component oluşturuldu (`src/components/ui/Input.tsx`)
  - Label support
  - Error state
  - Left/right icon support
  - Focus state (green border)
  - Touch-friendly (min 44px height)
  - Enuygun benzeri sade tasarım
- Card component oluşturuldu (`src/components/ui/Card.tsx`)
  - Variants: default, elevated, outlined
  - Padding options: none, small, medium, large
  - Optional onPress (touchable)
  - Ana site border radius ve renkler
- UI components index eklendi (`src/components/ui/index.ts`)

**Dosyalar:**
- `src/components/ui/Button.tsx` - Oluşturuldu
- `src/components/ui/Input.tsx` - Oluşturuldu
- `src/components/ui/Card.tsx` - Oluşturuldu
- `src/components/ui/index.ts` - Oluşturuldu

---

### 2024-12-XX - Navigation Yapısı Kuruldu

**Değişiklik:** React Navigation ile modüler navigation yapısı oluşturuldu

**Detay:**
- AppNavigator oluşturuldu (`src/navigation/AppNavigator.tsx`)
  - NavigationContainer wrapper
  - Auth kontrolü ile conditional navigation
  - Loading state handling
- AuthStack oluşturuldu (`src/navigation/AuthStack.tsx`)
  - Login, Register, ForgotPassword, ResetPassword ekranları
  - Ana site renkleri ile header styling
- MainNavigator oluşturuldu (`src/navigation/MainNavigator.tsx`)
  - Bottom Tab Navigator
  - Travel Stack Navigator (modül bazlı)
  - Module registry'den enabled modüller dinamik yükleniyor
  - Profile tab eklendi
- Navigation index eklendi (`src/navigation/index.ts`)

**Dosyalar:**
- `src/navigation/AppNavigator.tsx` - Oluşturuldu
- `src/navigation/AuthStack.tsx` - Oluşturuldu
- `src/navigation/MainNavigator.tsx` - Oluşturuldu
- `src/navigation/index.ts` - Oluşturuldu

---

### 2024-12-XX - Web Sitesinden Type Dosyası Kopyalandı

**Değişiklik:** travel.ts type dosyası web sitesinden kopyalandı

**Detay:**
- `src/types/travel.ts` dosyası oluşturuldu
  - Passenger type
  - FlightReservation type
  - HotelReservation type
  - CarReservation type
  - TabType type
- Web sitesindeki (`Desktop/grbt8/src/types/travel.ts`) dosyası aynen kopyalandı

**Dosyalar:**
- `src/types/travel.ts` - Oluşturuldu (kopyalandı)

---

### 2024-12-XX - Error Handling ve Boundaries Eklendi

**Değişiklik:** Error boundary ve error display component'leri eklendi

**Detay:**
- ErrorBoundary component oluşturuldu (`src/components/common/ErrorBoundary.tsx`)
  - React Error Boundary class component
  - Error yakalama ve loglama
  - Fallback UI gösterimi
  - Reset functionality
  - Dev mode'da error detayları gösterimi
- ErrorDisplay component oluşturuldu (`src/components/common/ErrorDisplay.tsx`)
  - Error mesajı gösterimi
  - Retry functionality
  - formatErrorMessage utility kullanımı
- Common components index eklendi (`src/components/common/index.ts`)

**Dosyalar:**
- `src/components/common/ErrorBoundary.tsx` - Oluşturuldu
- `src/components/common/ErrorDisplay.tsx` - Oluşturuldu
- `src/components/common/index.ts` - Oluşturuldu

---

### 2024-12-XX - App.tsx Güncellendi ve Navigation Bağlandı

**Değişiklik:** Ana App component'i ErrorBoundary ile sarmalandı ve navigation bağlandı

**Detay:**
- App.tsx güncellendi
  - ErrorBoundary ile sarmalandı
  - AppNavigator bağlandı
  - Minimal, temiz yapı

**Dosyalar:**
- `App.tsx` - Güncellendi

---

## 🎉 FAZ 0: Super App Altyapısı TAMAMLANDI

**Tarih:** 2024-12-XX

**Özet:** Super app için tüm altyapı kuruldu, modüler mimari hazır

**Tamamlananlar:**
- ✅ Modül klasör yapısı (core/, modules/)
- ✅ Core yapı (API client, SecureStore, Auth, Navigation types)
- ✅ Modül registry sistemi
- ✅ Global stores (authStore, appStore)
- ✅ Base UI components (Button, Input, Card)
- ✅ Navigation yapısı (AppNavigator, AuthStack, MainNavigator)
- ✅ Type dosyaları (travel.ts kopyalandı)
- ✅ Error handling (ErrorBoundary, ErrorDisplay)
- ✅ App.tsx güncellendi

**Sonraki Adım:** FAZ 1 - Seyahat Modülü - Uçak Bileti

---

### 2024-12-XX - FAZ 1 Başlatıldı: Travel Store ve Service Oluşturuldu

**Değişiklik:** Travel modülü için store ve service yapısı kuruldu

**Detay:**
- Travel Store oluşturuldu (`src/modules/travel/store/travelStore.ts`)
  - Flight search state management
  - Search query, flights, loading, error states
  - Actions: setSearchQuery, setFlights, setLoading, setError, setSelectedFlight, clearSearch
- Flight Service oluşturuldu (`src/modules/travel/services/flightService.ts`)
  - searchFlights() - Uçuş arama
  - searchAirports() - Havalimanı arama
  - getFlightDetails() - Uçuş detayları
- Format utilities genişletildi (`src/utils/format.ts`)
  - formatCurrency() - Para birimi formatı
  - formatDateShort() - Kısa tarih formatı
  - formatTime() - Saat formatı
  - formatDuration() - Uçuş süresi formatı
  - formatPhone() - Telefon formatı
  - formatIBAN() - IBAN formatı

**Dosyalar:**
- `src/modules/travel/store/travelStore.ts` - Oluşturuldu
- `src/modules/travel/services/flightService.ts` - Oluşturuldu
- `src/utils/format.ts` - Güncellendi

---

### 2024-12-XX - Travel Module Components Oluşturuldu

**Değişiklik:** Travel modülü için UI component'leri oluşturuldu

**Detay:**
- AirportSearchInput component oluşturuldu (`src/modules/travel/components/AirportSearchInput.tsx`)
  - Havalimanı arama input'u
  - Otomatik arama (2+ karakter)
  - Dropdown sonuçlar
  - Airport selection
- FlightCard component oluşturuldu (`src/modules/travel/components/FlightCard.tsx`)
  - Uçuş kartı gösterimi
  - Airline, flight number, price
  - Route (origin-destination)
  - Duration, baggage bilgisi
  - Direct flight badge
  - Ana site renkleri ve Enuygun sadeliği
- DatePicker component oluşturuldu (`src/modules/travel/components/DatePicker.tsx`)
  - Tarih seçici
  - iOS ve Android desteği
  - Minimum/maximum date validation
  - Modal picker (iOS)
- Components index eklendi (`src/modules/travel/components/index.ts`)

**Dosyalar:**
- `src/modules/travel/components/AirportSearchInput.tsx` - Oluşturuldu
- `src/modules/travel/components/FlightCard.tsx` - Oluşturuldu
- `src/modules/travel/components/DatePicker.tsx` - Oluşturuldu
- `src/modules/travel/components/index.ts` - Oluşturuldu

---

### 2024-12-XX - Travel Module Screens Oluşturuldu

**Değişiklik:** Travel modülü için screen'ler oluşturuldu ve navigation'a bağlandı

**Detay:**
- FlightSearchScreen oluşturuldu (`src/modules/travel/screens/FlightSearchScreen.tsx`)
  - Uçuş arama formu
  - Trip type seçimi (one-way, round-trip)
  - Origin/destination airport seçimi
  - Departure/return date picker
  - Passenger count selector
  - Form validation
  - Navigation to results
- FlightResultsScreen oluşturuldu (`src/modules/travel/screens/FlightResultsScreen.tsx`)
  - Uçuş sonuçları listesi
  - FlightCard component kullanımı
  - Loading state
  - Error handling
  - Pull-to-refresh
  - Empty state
  - Navigation to details
- FlightDetailsScreen oluşturuldu (`src/modules/travel/screens/FlightDetailsScreen.tsx`)
  - Uçuş detayları gösterimi
  - Full flight information
  - Reserve button
  - Error handling
- Screens index eklendi (`src/modules/travel/screens/index.ts`)
- MainNavigator güncellendi - Travel screens bağlandı

**Dosyalar:**
- `src/modules/travel/screens/FlightSearchScreen.tsx` - Oluşturuldu
- `src/modules/travel/screens/FlightResultsScreen.tsx` - Oluşturuldu
- `src/modules/travel/screens/FlightDetailsScreen.tsx` - Oluşturuldu
- `src/modules/travel/screens/index.ts` - Oluşturuldu
- `src/navigation/MainNavigator.tsx` - Güncellendi
- `src/core/navigation/types.ts` - Güncellendi (FlightDetails params)

---

## 🎉 FAZ 1: Seyahat Modülü - Uçak Bileti TEMEL KISIMLAR TAMAMLANDI

**Tarih:** 2024-12-XX

**Özet:** Travel modülü için temel uçuş arama, sonuçlar ve detay ekranları oluşturuldu

**Tamamlananlar:**
- ✅ Travel store (flight search state)
- ✅ Flight service (API calls)
- ✅ Format utilities genişletildi
- ✅ AirportSearchInput component
- ✅ FlightCard component
- ✅ DatePicker component
- ✅ FlightSearchScreen
- ✅ FlightResultsScreen
- ✅ FlightDetailsScreen
- ✅ Navigation entegrasyonu

**Kalanlar (FAZ 1 devam):**
- ⏳ Rezervasyon ekranı
- ⏳ Ödeme entegrasyonu
- ⏳ Rezervasyon geçmişi

**Sonraki Adım:** Rezervasyon ve ödeme akışı

---

### 2024-12-XX - Auth Screens Oluşturuldu

**Değişiklik:** Kullanıcı girişi, kayıt ve şifre sıfırlama ekranları oluşturuldu

**Detay:**
- LoginScreen oluşturuldu (`src/screens/auth/LoginScreen.tsx`)
  - Email/password login form
  - React Hook Form + Zod validation
  - Error handling
  - Navigation to register/forgot password
- RegisterScreen oluşturuldu (`src/screens/auth/RegisterScreen.tsx`)
  - User registration form
  - Password validation (min 8 chars, uppercase, lowercase, number)
  - Success state
  - Navigation to login
- ForgotPasswordScreen oluşturuldu (`src/screens/auth/ForgotPasswordScreen.tsx`)
  - Email input for password reset
  - Success state with email sent message
- Input component güncellendi - React Hook Form desteği eklendi
- AuthStack güncellendi - Screens bağlandı

**Dosyalar:**
- `src/screens/auth/LoginScreen.tsx` - Oluşturuldu
- `src/screens/auth/RegisterScreen.tsx` - Oluşturuldu
- `src/screens/auth/ForgotPasswordScreen.tsx` - Oluşturuldu
- `src/screens/auth/index.ts` - Oluşturuldu
- `src/components/ui/Input.tsx` - Güncellendi (React Hook Form support)
- `src/navigation/AuthStack.tsx` - Güncellendi

---

### 2024-12-XX - Rezervasyon ve Ödeme Akışı Oluşturuldu

**Değişiklik:** Rezervasyon, ödeme ve başarı ekranları oluşturuldu

**Detay:**
- ReservationScreen oluşturuldu (`src/modules/travel/screens/ReservationScreen.tsx`)
  - Passenger form (name, identity, birth date, gender, phone)
  - Flight summary card
  - Form validation
  - Navigation to payment
- PaymentScreen oluşturuldu (`src/modules/travel/screens/PaymentScreen.tsx`)
  - Credit card form (card number, holder, expiry, CVV)
  - Payment summary
  - Form validation
  - 3D Secure support (prepared)
- ReservationSuccessScreen oluşturuldu (`src/modules/travel/screens/ReservationSuccessScreen.tsx`)
  - Success confirmation
  - PNR display
  - Navigation to reservations history
- ReservationService oluşturuldu (`src/modules/travel/services/reservationService.ts`)
  - createReservation()
  - getReservations()
  - getReservationDetails()
- PaymentService oluşturuldu (`src/modules/travel/services/paymentService.ts`)
  - processPayment()
- Navigation types güncellendi - Reservation, Payment, Success screens eklendi
- MainNavigator güncellendi - Yeni screens bağlandı

**Dosyalar:**
- `src/modules/travel/screens/ReservationScreen.tsx` - Oluşturuldu
- `src/modules/travel/screens/PaymentScreen.tsx` - Oluşturuldu
- `src/modules/travel/screens/ReservationSuccessScreen.tsx` - Oluşturuldu
- `src/modules/travel/services/reservationService.ts` - Oluşturuldu
- `src/modules/travel/services/paymentService.ts` - Oluşturuldu
- `src/core/navigation/types.ts` - Güncellendi
- `src/navigation/MainNavigator.tsx` - Güncellendi

---

### 2024-12-XX - Profile ve Rezervasyon Geçmişi Ekranları Oluşturuldu

**Değişiklik:** Profil, ayarlar ve rezervasyon geçmişi ekranları oluşturuldu

**Detay:**
- ProfileScreen oluşturuldu (`src/screens/profile/ProfileScreen.tsx`)
  - User info display (avatar, name, email)
  - Menu items (Reservations, Settings, Help)
  - Logout button
- SettingsScreen oluşturuldu (`src/screens/profile/SettingsScreen.tsx`)
  - Theme selection (light/dark)
  - Language selection (tr/en)
  - Notification settings
- ReservationsHistoryScreen oluşturuldu (`src/screens/profile/ReservationsHistoryScreen.tsx`)
  - Flight reservations list
  - Reservation cards (PNR, route, date, status)
  - Pull-to-refresh
  - Empty state
  - Error handling
- Profile screens index eklendi
- Navigation types güncellendi - Profile screens eklendi
- MainNavigator güncellendi - Profile tab bağlandı

**Dosyalar:**
- `src/screens/profile/ProfileScreen.tsx` - Oluşturuldu
- `src/screens/profile/SettingsScreen.tsx` - Oluşturuldu
- `src/screens/profile/ReservationsHistoryScreen.tsx` - Oluşturuldu
- `src/screens/profile/index.ts` - Oluşturuldu
- `src/core/navigation/types.ts` - Güncellendi
- `src/navigation/MainNavigator.tsx` - Güncellendi

---

## 🎉 SEYAHAT MOBİL UYGULAMASI TEMEL ÖZELLİKLER TAMAMLANDI

**Tarih:** 2024-12-XX

**Özet:** Seyahat mobil uygulaması için tüm temel özellikler tamamlandı

**Tamamlananlar:**
- ✅ Kullanıcı girişi (Login, Register, Forgot Password)
- ✅ Uçuş arama (Search, Results, Details)
- ✅ Rezervasyon akışı (Passenger Form, Payment, Success)
- ✅ Rezervasyon geçmişi
- ✅ Profil ve ayarlar
- ✅ Tüm navigation yapısı
- ✅ State management (Auth, Travel, App)
- ✅ API services (Flight, Reservation, Payment)
- ✅ UI Components (Button, Input, Card, ErrorDisplay)
- ✅ Error handling ve boundaries

**Sistem Hazır:** Kullanıcılar giriş yapabilir, uçuş arayabilir, rezervasyon yapabilir ve geçmişlerini görüntüleyebilir!

---

### 2024-12-XX - FAZ 2 Başlatıldı: Otel ve Araç Kiralama Temel Ekranları

**Değişiklik:** Otel arama ve araç kiralama için temel ekranlar ve servisler oluşturuldu

**Detay:**
- HotelService oluşturuldu (`src/modules/travel/services/hotelService.ts`)
  - searchHotels() - Otel arama
  - getHotelDetails() - Otel detayları
  - Hotel ve HotelSearchQuery interfaces
- CarService oluşturuldu (`src/modules/travel/services/carService.ts`)
  - searchCars() - Araç arama
  - getCarDetails() - Araç detayları
  - Car ve CarSearchQuery interfaces
- HotelCard component oluşturuldu (`src/modules/travel/components/HotelCard.tsx`)
  - Otel kartı gösterimi
  - Image, name, location, rating, price
  - Amenities badges
- CarCard component oluşturuldu (`src/modules/travel/components/CarCard.tsx`)
  - Araç kartı gösterimi
  - Image, name, brand, type, price
  - Features badges
- HotelSearchScreen oluşturuldu (`src/modules/travel/screens/HotelSearchScreen.tsx`)
  - Otel arama formu (location, check-in/out, guests, rooms)
  - Form validation
- CarSearchScreen oluşturuldu (`src/modules/travel/screens/CarSearchScreen.tsx`)
  - Araç kiralama arama formu (pickup/dropoff location, dates, times)
  - Location swap button
  - Form validation
- Navigation güncellendi - Hotel ve Car search screens bağlandı

**Dosyalar:**
- `src/modules/travel/services/hotelService.ts` - Oluşturuldu
- `src/modules/travel/services/carService.ts` - Oluşturuldu
- `src/modules/travel/components/HotelCard.tsx` - Oluşturuldu
- `src/modules/travel/components/CarCard.tsx` - Oluşturuldu
- `src/modules/travel/screens/HotelSearchScreen.tsx` - Oluşturuldu
- `src/modules/travel/screens/CarSearchScreen.tsx` - Oluşturuldu
- `src/modules/travel/components/index.ts` - Güncellendi
- `src/modules/travel/screens/index.ts` - Güncellendi
- `src/navigation/MainNavigator.tsx` - Güncellendi

---

### 2024-12-XX - FAZ 2 Tamamlandı: Otel ve Araç Kiralama Sonuç ve Rezervasyon Ekranları

**Değişiklik:** Otel ve araç için results ve reservation ekranları oluşturuldu

**Detay:**
- HotelResultsScreen oluşturuldu (`src/modules/travel/screens/HotelResultsScreen.tsx`)
  - Otel sonuçları listesi
  - HotelCard component kullanımı
  - Loading, error, empty states
  - Pull-to-refresh
  - Navigation to reservation
- CarResultsScreen oluşturuldu (`src/modules/travel/screens/CarResultsScreen.tsx`)
  - Araç sonuçları listesi
  - CarCard component kullanımı
  - Loading, error, empty states
  - Pull-to-refresh
  - Navigation to reservation
- HotelReservationScreen oluşturuldu (`src/modules/travel/screens/HotelReservationScreen.tsx`)
  - Otel rezervasyon formu
  - Guest information (name, email, phone)
  - Hotel summary card
  - Form validation
  - Navigation to payment
- CarReservationScreen oluşturuldu (`src/modules/travel/screens/CarReservationScreen.tsx`)
  - Araç kiralama formu
  - Renter information (name, email, phone, license)
  - Car summary card
  - Form validation
  - Navigation to payment
- Navigation types güncellendi - Hotel ve Car screens eklendi
- MainNavigator güncellendi - Tüm screens bağlandı
- HotelSearchScreen ve CarSearchScreen güncellendi - Navigation to results eklendi

**Dosyalar:**
- `src/modules/travel/screens/HotelResultsScreen.tsx` - Oluşturuldu
- `src/modules/travel/screens/CarResultsScreen.tsx` - Oluşturuldu
- `src/modules/travel/screens/HotelReservationScreen.tsx` - Oluşturuldu
- `src/modules/travel/screens/CarReservationScreen.tsx` - Oluşturuldu
- `src/modules/travel/screens/index.ts` - Güncellendi
- `src/core/navigation/types.ts` - Güncellendi
- `src/navigation/MainNavigator.tsx` - Güncellendi
- `src/modules/travel/screens/HotelSearchScreen.tsx` - Güncellendi
- `src/modules/travel/screens/CarSearchScreen.tsx` - Güncellendi

---

## 🎉 FAZ 2: Seyahat Modülü - Otel & Araç TAMAMLANDI

**Tarih:** 2024-12-XX

**Özet:** Otel arama ve araç kiralama özellikleri tamamlandı

**Tamamlananlar:**
- ✅ Otel arama (Search, Results, Reservation)
- ✅ Araç kiralama (Search, Results, Reservation)
- ✅ Hotel ve Car services
- ✅ HotelCard ve CarCard components
- ✅ Tüm navigation bağlantıları
- ✅ Form validations
- ✅ Payment entegrasyonu (mevcut PaymentScreen kullanılıyor)

**Seyahat Modülü Tamamlandı:** Kullanıcılar artık uçak, otel ve araç kiralama için arama yapabilir ve rezervasyon oluşturabilir!

---

### 2024-12-XX - Reservation Service Genişletildi ve Entegrasyonlar Tamamlandı

**Değişiklik:** Reservation service hotel ve car desteği ile genişletildi, tüm reservation ekranları entegre edildi

**Detay:**
- ReservationService genişletildi (`src/modules/travel/services/reservationService.ts`)
  - createFlightReservation() - Uçuş rezervasyonu
  - createHotelReservation() - Otel rezervasyonu
  - createCarReservation() - Araç kiralama rezervasyonu
  - Tüm reservation tipleri için interface'ler eklendi
- ReservationScreen güncellendi - createFlightReservation entegrasyonu
- HotelReservationScreen güncellendi - createHotelReservation entegrasyonu
- CarReservationScreen güncellendi - createCarReservation entegrasyonu
- PaymentScreen güncellendi - Tüm reservation tipleri için ödeme desteği
  - calculateTotal() ve getCurrency() helper functions
  - Payment processing entegrasyonu
  - 3D Secure hazırlığı (TODO)
- Countries data kopyalandı (`src/constants/countries.ts`)
  - Country interface ve array
  - Helper functions (getCountryByCode, getCountryByPhoneCode)
- Constants index güncellendi - Countries export eklendi

**Dosyalar:**
- `src/modules/travel/services/reservationService.ts` - Güncellendi
- `src/modules/travel/screens/ReservationScreen.tsx` - Güncellendi
- `src/modules/travel/screens/HotelReservationScreen.tsx` - Güncellendi
- `src/modules/travel/screens/CarReservationScreen.tsx` - Güncellendi
- `src/modules/travel/screens/PaymentScreen.tsx` - Güncellendi
- `src/constants/countries.ts` - Oluşturuldu (kopyalandı)
- `src/constants/index.ts` - Güncellendi

---

## 🎉 SEYAHAT MOBİL UYGULAMASI TAMAMEN TAMAMLANDI!

**Tarih:** 2024-12-XX

**Özet:** Seyahat modülü için tüm özellikler tamamlandı ve entegre edildi

**Tamamlanan Özellikler:**
- ✅ Kullanıcı girişi (Login, Register, Forgot Password)
- ✅ Uçuş arama ve rezervasyon (Search, Results, Details, Reservation, Payment)
- ✅ Otel arama ve rezervasyon (Search, Results, Reservation, Payment)
- ✅ Araç kiralama (Search, Results, Reservation, Payment)
- ✅ Rezervasyon geçmişi (Tüm tipler)
- ✅ Profil ve ayarlar
- ✅ Tüm API services (Flight, Hotel, Car, Reservation, Payment)
- ✅ Tüm navigation yapısı
- ✅ State management
- ✅ Error handling
- ✅ Countries data

**Sistem Durumu:** Seyahat mobil uygulaması tamamen hazır! Kullanıcılar tüm seyahat ihtiyaçlarını karşılayabilir.

---

### 2024-12-XX - Ana Siteden Eksik Özellikler Eklendi

**Değişiklik:** Ana sitedeki önemli özellikler mobil uygulamaya eklendi

**Detay:**
- PassengerService oluşturuldu (`src/services/passengerService.ts`)
  - getPassengers() - Yolcu listesi
  - addPassenger() - Yolcu ekleme
  - updatePassenger() - Yolcu güncelleme
  - deletePassenger() - Yolcu silme
- PassengersScreen oluşturuldu (`src/screens/profile/PassengersScreen.tsx`)
  - Yolcu listesi gösterimi
  - Yolcu ekleme/düzenleme/silme
  - Hesap sahibi koruması
  - Pull-to-refresh
- PNRQueryScreen oluşturuldu (`src/screens/travel/PNRQueryScreen.tsx`)
  - PNR sorgulama formu
  - Rezervasyon detayları gösterimi
- CheckInScreen oluşturuldu (`src/screens/travel/CheckInScreen.tsx`)
  - Online check-in formu
  - Check-in sonuçları gösterimi
  - Boarding bilgileri
- CancelTicketScreen oluşturuldu (`src/screens/travel/CancelTicketScreen.tsx`)
  - Bilet iptal formu
  - İptal koşulları gösterimi
  - İptal durumu bildirimi
- HelpScreen oluşturuldu (`src/screens/info/HelpScreen.tsx`)
  - SSS (Sık Sorulan Sorular)
  - İletişim bilgileri
- AboutScreen oluşturuldu (`src/screens/info/AboutScreen.tsx`)
  - Misyon, vizyon, hizmetler
  - İletişim bilgileri
- ProfileScreen güncellendi - Yeni menü öğeleri eklendi
- Navigation types güncellendi - ProfileStackParamList eklendi
- MainNavigator güncellendi - Tüm yeni ekranlar bağlandı

**Dosyalar:**
- `src/services/passengerService.ts` - Oluşturuldu
- `src/screens/profile/PassengersScreen.tsx` - Oluşturuldu
- `src/screens/travel/PNRQueryScreen.tsx` - Oluşturuldu
- `src/screens/travel/CheckInScreen.tsx` - Oluşturuldu
- `src/screens/travel/CancelTicketScreen.tsx` - Oluşturuldu
- `src/screens/travel/index.ts` - Oluşturuldu
- `src/screens/info/HelpScreen.tsx` - Oluşturuldu
- `src/screens/info/AboutScreen.tsx` - Oluşturuldu
- `src/screens/info/index.ts` - Oluşturuldu
- `src/screens/profile/ProfileScreen.tsx` - Güncellendi
- `src/screens/profile/index.ts` - Güncellendi
- `src/core/navigation/types.ts` - Güncellendi
- `src/navigation/MainNavigator.tsx` - Güncellendi

**Not:** Favorites, Search History ve Price Alerts özellikleri gelecek güncellemelerde eklenecek.

---

### 2024-12-XX - Eksikler Tamamlandı: Backend Entegrasyonları ve Yeni Özellikler

**Değişiklik:** Tüm TODO'lar tamamlandı, eksik özellikler eklendi, backend entegrasyonları yapıldı

**Detay:**
- Icon kütüphanesi eklendi (`@expo/vector-icons`)
  - Tab bar icon'ları eklendi (Travel, Profile)
  - Tüm ekranlarda icon kullanımı
- 3D Secure flow tamamlandı
  - ThreeDSecureScreen oluşturuldu (`src/screens/travel/ThreeDSecureScreen.tsx`)
  - WebView ile 3D Secure doğrulama
  - PaymentScreen'de 3D Secure navigation
  - react-native-webview paketi eklendi
- Backend API entegrasyonları tamamlandı
  - PNRQueryScreen - API entegrasyonu
  - CheckInScreen - API entegrasyonu
  - CancelTicketScreen - API entegrasyonu
  - HotelReservationScreen - Error handling
  - CarReservationScreen - Error handling
  - ReservationScreen - Error handling
- Favorites özelliği eklendi
  - FavoritesService oluşturuldu (`src/services/favoritesService.ts`)
  - FavoritesScreen oluşturuldu (`src/screens/profile/FavoritesScreen.tsx`)
  - Favori aramalar listesi, silme, arama
- Search History özelliği eklendi
  - SearchHistoryService oluşturuldu (`src/services/searchHistoryService.ts`)
  - SearchHistoryScreen oluşturuldu (`src/screens/profile/SearchHistoryScreen.tsx`)
  - Local storage fallback (`src/utils/storage.ts`)
  - AsyncStorage paketi eklendi
  - FlightSearchScreen'de otomatik kayıt
- Price Alerts özelliği eklendi
  - PriceAlertsService oluşturuldu (`src/services/priceAlertsService.ts`)
  - PriceAlertsScreen oluşturuldu (`src/screens/profile/PriceAlertsScreen.tsx`)
  - Fiyat alarmları listesi, silme, arama
- AddEditPassengerScreen eklendi
  - Yolcu ekleme/düzenleme ekranı
  - Form validation
  - Navigation entegrasyonu
- Toast component eklendi (`src/components/common/Toast.tsx`)
  - useToast hook eklendi (`src/hooks/useToast.ts`)
  - Success/Error/Info toast mesajları
- ProfileScreen güncellendi - Yeni menü öğeleri eklendi
- Navigation types güncellendi - Tüm yeni ekranlar eklendi
- MainNavigator güncellendi - Tüm ekranlar bağlandı

**Dosyalar:**
- `src/services/favoritesService.ts` - Oluşturuldu
- `src/services/searchHistoryService.ts` - Oluşturuldu
- `src/services/priceAlertsService.ts` - Oluşturuldu
- `src/utils/storage.ts` - Oluşturuldu
- `src/screens/profile/FavoritesScreen.tsx` - Oluşturuldu
- `src/screens/profile/SearchHistoryScreen.tsx` - Oluşturuldu
- `src/screens/profile/PriceAlertsScreen.tsx` - Oluşturuldu
- `src/screens/profile/AddEditPassengerScreen.tsx` - Oluşturuldu
- `src/screens/travel/ThreeDSecureScreen.tsx` - Oluşturuldu
- `src/components/common/Toast.tsx` - Oluşturuldu
- `src/hooks/useToast.ts` - Oluşturuldu
- `src/modules/travel/screens/PaymentScreen.tsx` - Güncellendi
- `src/modules/travel/screens/FlightSearchScreen.tsx` - Güncellendi
- `src/modules/travel/screens/ReservationScreen.tsx` - Güncellendi
- `src/modules/travel/screens/HotelReservationScreen.tsx` - Güncellendi
- `src/modules/travel/screens/CarReservationScreen.tsx` - Güncellendi
- `src/screens/travel/PNRQueryScreen.tsx` - Güncellendi
- `src/screens/travel/CheckInScreen.tsx` - Güncellendi
- `src/screens/travel/CancelTicketScreen.tsx` - Güncellendi
- `src/screens/profile/PassengersScreen.tsx` - Güncellendi
- `src/screens/profile/ProfileScreen.tsx` - Güncellendi
- `src/core/navigation/types.ts` - Güncellendi
- `src/navigation/MainNavigator.tsx` - Güncellendi
- `package.json` - Güncellendi (@expo/vector-icons, react-native-webview, @react-native-async-storage/async-storage)

---

## 🎉 TÜM EKSİKLER TAMAMLANDI!

**Tarih:** 2024-12-XX

**Özet:** Mobil seyahat uygulaması tamamen tamamlandı

**Tamamlananlar:**
- ✅ Backend API entegrasyonları (PNR, Check-in, Cancel, Reservations)
- ✅ 3D Secure flow (WebView ile)
- ✅ Favorites özelliği
- ✅ Search History özelliği (Local storage fallback ile)
- ✅ Price Alerts özelliği
- ✅ Add/Edit Passenger ekranı
- ✅ Icon kütüphanesi (@expo/vector-icons)
- ✅ Toast component ve hook
- ✅ Error handling iyileştirmeleri
- ✅ Tüm TODO'lar temizlendi

**Sistem Durumu:** Mobil seyahat uygulaması production'a hazır! Tüm özellikler tamamlandı ve backend entegrasyonları yapıldı.

---

### 📌 Yeni Asistanlar İçin Notlar

1. **Rehberi okuyun:** Bu rehber projenin tüm mimarisini ve kararları içerir
2. **Yapılanları kontrol edin:** Yukarıdaki changelog'u okuyarak projenin gelişimini anlayın
3. **⚠️ ÖNEMLİ - Değişiklik yaptığınızda:** Her yaptığınız değişikliği bu bölüme ekleyin (run demeden önce!)
4. **Modüler mimariyi koruyun:** Yeni özellikler eklerken modül yapısını bozmayın
5. **TypeScript strict mode:** Tüm kodlar TypeScript strict mode'da yazılmalı

### 📝 Changelog Formatı

Her değişiklik şu formatta eklenmeli:

```markdown
### YYYY-MM-DD - Kısa Başlık

**Değişiklik:** Ne yapıldı (kısa açıklama)

**Detay:**
- Yapılan işlem 1
- Yapılan işlem 2
- Oluşturulan dosyalar
- Değiştirilen dosyalar

**Dosyalar:**
- `src/core/api/client.ts` - Oluşturuldu
- `src/store/authStore.ts` - Oluşturuldu
```

**Örnek:**
```markdown
### 2024-12-XX - Core API Client Oluşturuldu

**Değişiklik:** API client yapısı kuruldu, Axios interceptor'lar eklendi

**Detay:**
- Axios client oluşturuldu
- Request interceptor (token ekleme) eklendi
- Response interceptor (401 handling, error format) eklendi
- Token refresh logic eklendi

**Dosyalar:**
- `src/core/api/client.ts` - Oluşturuldu
```

---

### 2024-12-XX - Fatura Bilgileri Sayfası Eklendi

**Değişiklik:** Ana sitedeki fatura bilgileri yönetimi sayfası mobil uygulamaya eklendi

**Detay:**
- Bireysel ve kurumsal fatura bilgileri ekleme/düzenleme/silme özelliği eklendi
- Varsayılan adres belirleme özelliği eklendi
- Fatura bilgileri listeleme ve görüntüleme ekranı oluşturuldu
- Backend API entegrasyonu tamamlandı (`/api/billing-info`)
- Form validasyonu eklendi (Zod schema ile)
- Bireysel/Kurumsal tip seçimi için toggle butonları eklendi
- Ülke listesi genişletildi (20 ülke)

**Dosyalar:**
- `src/services/billingInfoService.ts` - Oluşturuldu (CRUD işlemleri)
- `src/screens/profile/BillingInfoScreen.tsx` - Oluşturuldu (Ana ekran)
- `src/constants/countries.ts` - Güncellendi (Ülke listesi genişletildi)
- `src/core/navigation/types.ts` - Güncellendi (BillingInfo route eklendi)
- `src/navigation/MainNavigator.tsx` - Güncellendi (BillingInfoScreen eklendi)
- `src/screens/profile/index.ts` - Güncellendi (Export eklendi)
- `src/screens/profile/ProfileScreen.tsx` - Güncellendi (Navigation link eklendi)

---

### 2024-12-XX - Component-Based Yapı Prensipleri Eklendi ve HomeScreen Refactoring

**Değişiklik:** Kod yapısı component-based, modüler hale getirildi. HomeScreen refactoring yapıldı.

**Detay:**
- Component-based yapı prensipleri rehbere eklendi (Klasör Yapısı bölümüne)
- HomeScreen 260 satırdan 20 satıra düşürüldü (component'lere bölündü)
- Her screen için standart yapı oluşturuldu:
  - `components/` klasörü (screen-specific component'ler)
  - `constants/` klasörü (screen-specific data)
  - `styles/` klasörü (screen-specific StyleSheet'ler)
  - `index.ts` (export dosyası)
- HomeScreen component'leri:
  - `HomeHeader.tsx` - Logo ve gradient header
  - `ServiceIcon.tsx` - Tek servis ikonu
  - `ServiceIconsList.tsx` - Horizontal scrollable ikon listesi
  - `HomeContent.tsx` - İçerik alanı
- Stil ve data ayrıldı:
  - `homeScreenStyles.ts` - Tüm StyleSheet'ler
  - `services.ts` - Service listesi

**Dosyalar:**
- `src/screens/home/HomeScreen.tsx` - Refactor edildi (20 satır)
- `src/screens/home/components/HomeHeader.tsx` - Oluşturuldu
- `src/screens/home/components/ServiceIcon.tsx` - Oluşturuldu
- `src/screens/home/components/ServiceIconsList.tsx` - Oluşturuldu
- `src/screens/home/components/HomeContent.tsx` - Oluşturuldu
- `src/screens/home/components/index.ts` - Oluşturuldu
- `src/screens/home/constants/services.ts` - Oluşturuldu
- `src/screens/home/styles/homeScreenStyles.ts` - Oluşturuldu
- `MOBIL_APP_REHBERI.md` - Component-based yapı prensipleri eklendi

**Not:** Bu yapı tüm yeni ekranlar ve modüller için standart olarak kullanılacak. Kod çalışır durumda olsa bile, component-based yapıya geçilmeli.

**Not:** Ana sitedeki tüm sayfalar artık mobil uygulamada mevcut.

---

*Son güncelleme: Aralık 2024*

