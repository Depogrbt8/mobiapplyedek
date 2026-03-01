import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { TabType } from '@/types/travel';

interface Tab {
  id: TabType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const tabs: Tab[] = [
  { id: 'ucak', label: 'Uçak', icon: 'airplane' },
  { id: 'otel', label: 'Otel', icon: 'business' },
  { id: 'arac', label: 'Araç', icon: 'car' },
  { id: 'esim', label: 'E-sim', icon: 'wifi' },
];

interface TripTabSelectorProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TripTabSelector: React.FC<TripTabSelectorProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={isActive ? colors.primary[600] : colors.text.secondary}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
  },
  scrollContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.primary[50],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.primary[600],
    fontWeight: '600',
  },
});









