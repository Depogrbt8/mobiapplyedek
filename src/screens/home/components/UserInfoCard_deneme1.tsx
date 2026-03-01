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
export const UserInfoCard_deneme1: React.FC<UserInfoCardProps> = ({
  userName = 'Armagan CAGLAYAN',
  points = 100,
  euroBalance = 40.45,
  accountNumber = '12345',
}) => {
  return (
    <View style={styles.cardWrapper}>
      {/* Gri gölge - sol ve alt */}
      <View style={styles.shadow} />
      
      {/* Kart */}
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={[colors.primary[900], colors.primary[700], colors.primary[500]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Üst parlama efekti */}
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shine}
          />

          {/* Üst - Ad Soyad ve noktalar */}
          <View style={styles.topRow}>
            <Text style={styles.userName}>{userName}</Text>
            <View style={styles.dots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>

          {/* Alt - Bilgiler */}
          <View style={styles.bottomRow}>
            {/* Sol: EURO ve Puan */}
            <View style={styles.leftInfo}>
              <Text style={styles.infoText}>EURO : {euroBalance.toFixed(2)} TL</Text>
              <Text style={styles.infoText}>Puan:{points}</Text>
            </View>
            
            {/* Sağ: No */}
            <View style={styles.rightInfo}>
              <Text style={styles.accountText}>No: {accountNumber}</Text>
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
    top: 6,
    left: -6,
    right: 6,
    bottom: -10,
    backgroundColor: colors.gray[400],
    borderRadius: 18,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Android
    elevation: 8,
  },
  cardContainer: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  card: {
    padding: 24,
    minHeight: 180,
    justifyContent: 'space-between',
    borderRadius: 18,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.inverse,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.secondary[400],
    // Parlama efekti
    shadowColor: colors.secondary[300],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 1,
  },
  leftInfo: {
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.inverse,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  rightInfo: {
    alignItems: 'flex-end',
  },
  accountText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.inverse,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
