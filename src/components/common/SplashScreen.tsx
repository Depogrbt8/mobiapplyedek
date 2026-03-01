import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Gurbetten memlekete yol arkadaşınız!';
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cursorAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo fade-in animasyonu
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Cursor yanıp sönme animasyonu
    const cursorAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    cursorAnimation.start();

    return () => {
      cursorAnimation.stop();
    };
  }, []);

  useEffect(() => {
    // Yazı animasyonu - harf harf yazma
    if (currentIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(fullText.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 100); // Her harf için 100ms bekleme

      return () => clearTimeout(timer);
    } else {
      // Yazı tamamlandıktan sonra 1 saniye bekle ve bitir
      const finishTimer = setTimeout(() => {
        onFinish();
      }, 1000);

      return () => clearTimeout(finishTimer);
    }
  }, [currentIndex, fullText, onFinish]);

  return (
    <LinearGradient
      colors={[colors.primary[300], colors.primary[400], colors.primary[500]]}
      locations={[0, 0.3, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            <Text style={styles.logoWhite}>gurbet</Text>
            <Text style={styles.logoBlack}>biz</Text>
          </Text>
        </View>

        {/* Animasyonlu Slogan */}
        <View style={styles.sloganContainer}>
          <Text style={styles.sloganText}>{displayedText}</Text>
          {currentIndex < fullText.length && (
            <Animated.Text
              style={[
                styles.cursor,
                {
                  opacity: cursorAnim,
                },
              ]}
            >
              |
            </Animated.Text>
          )}
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
  },
  logoWhite: {
    color: colors.text.inverse,
  },
  logoBlack: {
    color: colors.text.primary,
  },
  sloganContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 30,
  },
  sloganText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text.inverse,
    textAlign: 'center',
  },
  cursor: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text.inverse,
    marginLeft: 2,
  },
});






