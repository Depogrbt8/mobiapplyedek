import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

interface UserInfoCardProps {
  userName?: string;
  points?: number;
  euroBalance?: number;
  accountNumber?: string;
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({
  userName = 'Armagan Caglayan',
  points = 230,
  euroBalance = 37.89,
  accountNumber = '01234',
}) => {
  return (
    <View style={styles.cardWrapper}>
      {/* Glow efekti için arka plan */}
      <View style={styles.glowBackground} />
      
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.primary[600], colors.primary[700], colors.primary[800], colors.primary[900]]}
          locations={[0, 0.3, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Dekoratif çizgiler (banka kartı efekti) */}
          <View style={styles.decorativeLines}>
            <View style={styles.line1} />
            <View style={styles.line2} />
          </View>
          
          {/* Hologram efekti (üst kısım) */}
          <View style={styles.hologramEffect}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.hologramGradient}
            />
          </View>

          {/* Chip simgesi - Daha gerçekçi */}
          <View style={styles.chipContainer}>
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#FF8C00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.chip}
            >
              <View style={styles.chipInner}>
                <View style={styles.chipLines}>
                  <View style={styles.chipLine} />
                  <View style={styles.chipLine} />
                  <View style={styles.chipLine} />
                  <View style={styles.chipLine} />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Contactless/NFC simgesi */}
          <View style={styles.contactlessContainer}>
            <Ionicons name="radio" size={24} color={colors.text.inverse} style={styles.contactlessIcon} />
          </View>

          <View style={styles.content}>
            {/* Sol Taraf */}
            <View style={styles.leftSection}>
              <Text style={styles.userName}>{userName}</Text>
              <View style={styles.pointsContainer}>
                <Text style={styles.label}>PUAN</Text>
                <Text style={styles.pointsValue}> : {points}</Text>
              </View>
            </View>

            {/* Sağ Taraf */}
            <View style={styles.rightSection}>
              <View style={styles.euroContainer}>
                <Text style={styles.label}>EURO</Text>
                <Text style={styles.euroValue}> : {euroBalance.toFixed(2)} TL</Text>
              </View>
              <View style={styles.accountContainer}>
                <Text style={styles.label}>NO</Text>
                <Text style={styles.accountValue}> :{accountNumber}</Text>
              </View>
            </View>
          </View>

          {/* Gurbetbiz Logo (sağ alt) */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>
              <Text style={styles.logoWhite}>gurbet</Text>
              <Text style={styles.logoBlack}>biz</Text>
            </Text>
          </View>

          {/* Alt kısım dekoratif elementler */}
          <View style={styles.bottomDecoration}>
            <View style={styles.decorativeCircle} />
            <View style={styles.decorativeCircle} />
            <View style={styles.decorativeCircle} />
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'relative',
    marginTop: 0,
    marginBottom: 16,
  },
  glowBackground: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 20,
    backgroundColor: colors.primary[400],
    opacity: 0.3,
    zIndex: 0,
  },
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 1,
  },
  gradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.primary[400],
    minHeight: 140,
    position: 'relative',
  },
  decorativeLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    opacity: 0.15,
  },
  line1: {
    position: 'absolute',
    top: 15,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.text.inverse,
  },
  line2: {
    position: 'absolute',
    top: 25,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.text.inverse,
  },
  hologramEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
    opacity: 0.4,
  },
  hologramGradient: {
    flex: 1,
  },
  chipContainer: {
    position: 'absolute',
    top: 18,
    left: 20,
    zIndex: 3,
  },
  chip: {
    width: 44,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  chipInner: {
    width: 38,
    height: 30,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipLines: {
    flexDirection: 'row',
    gap: 2.5,
  },
  chipLine: {
    width: 2.5,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 1,
  },
  contactlessContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 3,
  },
  contactlessIcon: {
    opacity: 0.8,
    transform: [{ rotate: '90deg' }],
  },
  logoContainer: {
    position: 'absolute',
    bottom: 16,
    right: 20,
    zIndex: 3,
  },
  logoText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  logoWhite: {
    color: colors.text.inverse,
  },
  logoBlack: {
    color: 'rgba(0, 0, 0, 0.3)',
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 12,
    left: 20,
    flexDirection: 'row',
    gap: 4,
  },
  decorativeCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.inverse,
    opacity: 0.2,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 50,
    zIndex: 2,
  },
  leftSection: {
    flex: 1,
    paddingRight: 12,
    paddingLeft: 0,
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.inverse,
    marginBottom: 16,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  euroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.inverse,
    opacity: 0.9,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.inverse,
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  euroValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.inverse,
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  accountValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.inverse,
    marginLeft: 4,
    letterSpacing: 1,
  },
});
