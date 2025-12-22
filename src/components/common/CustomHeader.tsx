import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

interface CustomHeaderProps {
  title: string;
  showBackButton?: boolean;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({ title, showBackButton = true }) => {
  const navigation = useNavigation();
  const route = useRoute();

  const canGoBack = navigation.canGoBack();

  const handleGoBack = () => {
    const currentRouteName = route.name;
    
    // FlightSearchScreen'den gelen sayfalar: CheckIn, PNRQuery, CancelTicket, Help
    // Bu sayfalarda geri butonuna basınca HER ZAMAN Home'a dön
    // (Çünkü FlightSearchScreen'den geldiyse, kullanıcı Home'a dönmek istiyor)
    const flightSearchPages = ['CheckIn', 'PNRQuery', 'CancelTicket', 'Help'];
    
    if (flightSearchPages.includes(currentRouteName)) {
      // FlightSearchScreen'den gelen sayfalarda direkt Home'a dön
      navigation.navigate('Home' as never);
      return;
    }
    
    // Diğer sayfalar için normal geri git
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {showBackButton && canGoBack && (
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
        </TouchableOpacity>
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    height: 44,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
    borderRadius: 0,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.inverse,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  spacer: {
    width: 24,
    height: 24,
  },
});

