import React, { useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { homeScreenStyles } from '../styles/homeScreenStyles';
import { ServiceIcon } from './ServiceIcon';
import type { Service } from '../constants/services';

interface ServiceIconsListProps {
  services: Service[];
}

export const ServiceIconsList: React.FC<ServiceIconsListProps> = ({ services }) => {
  const servicesScrollViewRef = useRef<ScrollView>(null);

  return (
    <View
      style={homeScreenStyles.servicesContent}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={(evt, gestureState) => {
        // Sadece yatay hareket varsa true döndür
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      }}
    >
      <ScrollView
        ref={servicesScrollViewRef}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={homeScreenStyles.servicesContainer}
        style={homeScreenStyles.servicesScrollView}
        bounces={false}
        alwaysBounceVertical={false}
        alwaysBounceHorizontal={false}
        directionalLockEnabled={true}
        scrollEnabled={true}
        nestedScrollEnabled={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        pagingEnabled={false}
        snapToInterval={0}
        scrollsToTop={false}
        onScroll={(e) => {
          // Y ekseninde scroll varsa sıfırla
          if (e.nativeEvent.contentOffset.y !== 0) {
            servicesScrollViewRef.current?.scrollTo({ y: 0, animated: false });
          }
        }}
      >
        {services.map((service) => (
          <ServiceIcon key={service.id} service={service} />
        ))}
      </ScrollView>
    </View>
  );
};

