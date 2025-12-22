import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

export const CustomHeaderLeft: React.FC = () => {
  const navigation = useNavigation();

  // Eğer geri gidilecek ekran yoksa, butonu gösterme
  if (!navigation.canGoBack()) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{ 
        marginLeft: 16,
        padding: 0,
        backgroundColor: 'transparent',
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 0,
        overflow: 'hidden',
      }}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
    </TouchableOpacity>
  );
};

