import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';

interface UserInfoCardProps {
  userName?: string;
  points?: number;
  euroBalance?: number;
  accountNumber?: string;
}

export const UserInfoCard_deneme5: React.FC<UserInfoCardProps> = ({
  userName = 'Armagan CAGLAYAN',
  points = 100,
  euroBalance = 40.45,
  accountNumber = '12345',
}) => {
  return (
    <View style={styles.cardWrapper}>
      {/* Sol taraftan gölge */}
      <View style={styles.shadowLayer} />
      
      {/* Kart gövdesi */}
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={['#f5f5f5', '#e8e8e8', '#d0d0d0', '#d8d8d8', '#e5e5e5']}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Üst parlaklık - gümüş shine */}
          <LinearGradient
            colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)', 'transparent']}
            locations={[0, 0.2, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.topShine}
          />
          
          {/* Yan parlaklık - sol taraftan */}
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'transparent', 'transparent']}
            locations={[0, 0.3, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sideShine}
          />
          
          {/* Kenar highlight */}
          <View style={styles.borderGlow} />
          
          {/* Orta ışıltı efekti - iOS için daha parlak */}
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0.5)', 'transparent']}
            locations={[0, 0.3, 0.5, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.centerShine}
          />
          
          {/* Sağ tarafta hafif yeşil geçiş - üst bar renkleri */}
          <LinearGradient
            colors={['transparent', 'rgba(34,197,94,0.3)', '#22c55e', '#16a34a']}
            locations={[0, 0.4, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.greenOverlay}
          />

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
  shadowLayer: {
    position: 'absolute',
    top: -4,
    left: -6,
    right: 4,
    bottom: 4,
    backgroundColor: '#000',
    borderRadius: 16,
    opacity: Platform.OS === 'ios' ? 0.08 : 0.15,
    zIndex: 0,
  },
  cardContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    padding: 24,
    minHeight: 185,
    justifyContent: 'space-between',
    borderRadius: 12,
  },
  greenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    opacity: Platform.OS === 'ios' ? 0.5 : 0.7,
  },
  topShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    borderRadius: 12,
  },
  sideShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 80,
    borderRadius: 12,
  },
  borderGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  centerShine: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    bottom: '20%',
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
    fontWeight: '500',
    color: colors.gray[700],
    letterSpacing: 0.3,
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
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gray[500],
    opacity: 0.6,
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
    fontWeight: '500',
    color: colors.gray[700],
    letterSpacing: 0.2,
  },
  accountText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray[700],
    letterSpacing: 0.3,
  },
});







