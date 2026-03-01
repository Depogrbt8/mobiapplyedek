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
export const UserInfoCard_deneme3: React.FC<UserInfoCardProps> = ({
  userName = 'Armagan CAGLAYAN',
  points = 100,
  euroBalance = 40.45,
  accountNumber = '12345',
}) => {
  return (
    <View style={styles.cardWrapper}>
      {/* Kart gövdesi - sadece düz yeşil */}
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={[colors.primary[800], colors.primary[700], colors.primary[600], colors.primary[500]]}
          locations={[0, 0.3, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >

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
    color: '#ffffff',
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
    color: '#ffffff',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
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
    backgroundColor: 'rgba(255,255,255,0.6)',
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
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  accountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.6,
  },
});


