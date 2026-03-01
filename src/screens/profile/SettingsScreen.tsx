import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/store/appStore';
import { colors } from '@/constants/colors';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme, setTheme, language, setLanguage } = useAppStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Görünüm</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Tema</Text>
          <View style={styles.themeButtons}>
            <TouchableOpacity
              style={[
                styles.themeButton,
                theme === 'light' && styles.themeButtonActive,
              ]}
              onPress={() => setTheme('light')}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  theme === 'light' && styles.themeButtonTextActive,
                ]}
              >
                Açık
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeButton,
                theme === 'dark' && styles.themeButtonActive,
              ]}
              onPress={() => setTheme('dark')}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  theme === 'dark' && styles.themeButtonTextActive,
                ]}
              >
                Koyu
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Dil</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Uygulama Dili</Text>
          <View style={styles.languageButtons}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === 'tr' && styles.languageButtonActive,
              ]}
              onPress={() => setLanguage('tr')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === 'tr' && styles.languageButtonTextActive,
                ]}
              >
                Türkçe
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === 'en' && styles.languageButtonActive,
              ]}
              onPress={() => setLanguage('en')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === 'en' && styles.languageButtonTextActive,
                ]}
              >
                English
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Bildirimler</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push Bildirimleri</Text>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: colors.gray[300], true: colors.primary[600] }}
            thumbColor={colors.background}
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 12,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  themeButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  themeButtonText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  themeButtonTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  languageButtonText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  languageButtonTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
});











