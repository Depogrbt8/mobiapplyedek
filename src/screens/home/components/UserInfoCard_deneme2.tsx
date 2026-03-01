import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';

interface UserInfoCardProps {
  userName?: string;
  points?: number;
  euroBalance?: number;
  accountNumber?: string;
}

// YEDEK DOSYA - Export edilmiyor
export const UserInfoCard_deneme2: React.FC<UserInfoCardProps> = ({
  userName = 'Armagan CAGLAYAN',
  points = 100,
  euroBalance = 40.45,
  accountNumber = '12345',
}) => {
  return (
    <View style={styles.cardWrapper}>
      {/* Yumuşak gölge (sol & alt) */}
      <View style={styles.shadow} />

      {/* Kart gövdesi */}
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={[colors.primary[900], colors.primary[700], colors.primary[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Cam efektli üst parlama */}
          <View style={styles.glassOverlay} />
          <LinearGradient
            colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shine}
          />

          {/* Kenar ışığı */}
          <View style={styles.borderHighlight} />

          {/* Sağ üst - gb logosu */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>
              <Text style={styles.logoG}>g</Text>
              <Text style={styles.logoB}>b</Text>
            </Text>
          </View>

          {/* Sağ alt köşe noktalar */}
          <View style={styles.dotsContainer}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          {/* Sağ üst - EURO */}
          <View style={styles.euroContainer}>
            <Text style={styles.infoText}>EURO : {euroBalance.toFixed(2)} TL</Text>
          </View>

          {/* İçerik */}
          <View style={styles.content}>
            {/* Üst - Ad Soyad */}
            <View style={styles.topRow}>
              <Text style={styles.userName}>{userName}</Text>
            </View>

            {/* Alt - Bilgiler */}
            <View style={styles.bottomRow}>
              <View style={styles.leftInfo}>
                <Text style={styles.accountText}>No: {accountNumber}</Text>
                <Text style={styles.infoText}>Puan:{points}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginTop: 8,
    marginBottom: 24,
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    top: 8,
    left: -4,
    right: 6,
    bottom: -8,
    backgroundColor: colors.gray[400],
    borderRadius: 12,
    opacity: 0.4,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cardContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  card: {
    padding: 24,
    minHeight: 185,
    justifyContent: 'space-between',
    borderRadius: 12,
  },
  glassOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  borderHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  logoContainer: {
    position: 'absolute',
    top: 24,
    right: 40,
    zIndex: 2,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  logoG: {
    color: colors.text.inverse,
  },
  logoB: {
    color: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.inverse,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  euroContainer: {
    position: 'absolute',
    bottom: 48,
    right: 24,
    alignItems: 'flex-end',
    zIndex: 2,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    gap: 4,
    zIndex: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 28,
  },
  leftInfo: {
    gap: 6,
    flex: 1,
  },
  rightInfo: {
    alignItems: 'flex-end',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.inverse,
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  accountText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.inverse,
    letterSpacing: 0.6,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

