import { StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

export const homeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrapper: {
    backgroundColor: colors.primary[500], // İkon içindeki yeşil ile aynı
    paddingBottom: 56, // İkonların yarısına kadar uzat (biraz daha uzatıldı)
    overflow: 'visible', // İkonların alt kısmının görünmesi için
    zIndex: 1, // Arka plan için düşük z-index
  },
  header: {
    backgroundColor: 'transparent',
    paddingBottom: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
  },
  logoWhite: {
    color: colors.text.inverse,
  },
  logoBlack: {
    color: colors.text.primary,
  },
  servicesContent: {
    position: 'absolute',
    top: 0, // Header'ın üstünden başla
    left: 0,
    right: 0,
    // paddingTop dinamik olarak GlobalHeader'da hesaplanıyor (useSafeAreaInsets ile)
    marginTop: 0,
    zIndex: 9999, // EN ÜSTTE - İkonların her şeyin üzerine çıkması için
    elevation: 9999, // Android için EN ÜSTTE
    pointerEvents: 'box-none', // Touch event'lerin alt elementlere geçmesi için
  },
  servicesScrollView: {
    overflow: 'visible',
    zIndex: 100, // ScrollView'ın gradient'in üzerine çıkması için
    elevation: 100, // Android için
  },
  servicesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 0,
    marginBottom: -32, // İkonların yarısı beyaz alanda (64px / 2 = 32px)
  },
  serviceButton: {
    alignItems: 'center',
    gap: 6,
    zIndex: 100, // İkonların gradient'in üzerine çıkması için
    elevation: 100, // Android için
    marginHorizontal: 10, // İkonlar arası boşluk (gap yerine)
    minWidth: 80, // Her ikon için minimum genişlik
  },
  serviceIconWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 100, // Android için z-index - gradient'in üzerine çıkması için
    zIndex: 100, // iOS için z-index - gradient'in üzerine çıkması için
  },
  serviceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: colors.text.inverse,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100, // İkonların gradient'in üzerine çıkması için
    elevation: 100, // Android için
    overflow: 'hidden', // Gradient'in border içinde kalması için
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary[600],
    textAlign: 'center',
    zIndex: 100, // Yazıların gradient'in üzerine çıkması için
    elevation: 100, // Android için
    backgroundColor: 'transparent', // Yazıların arka planının şeffaf olması için
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    zIndex: 1, // İçerik alanı ikonların altında
  },
  contentContainer: {
    padding: 16,
    paddingTop: 30, // Servis ikonları ve yazıları için boşluk
    paddingBottom: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 24,
  },
});



