import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Linking } from 'react-native';
import { campaignService, type Campaign } from '@/services/campaignService';
import { colors } from '@/constants/colors';

export const BannersSection: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await campaignService.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Banner yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBannerPress = async (campaign: Campaign) => {
    // Tıklama sayacını güncelle
    await campaignService.trackClick(campaign.id);

    // Link varsa aç
    if (campaign.linkUrl) {
      try {
        const canOpen = await Linking.canOpenURL(campaign.linkUrl);
        if (canOpen) {
          await Linking.openURL(campaign.linkUrl);
        }
      } catch (error) {
        console.error('Link açılamadı:', error);
      }
    }
  };

  const getImageSource = (campaign: Campaign) => {
    if (campaign.imageData && campaign.imageData.startsWith('data:')) {
      return { uri: campaign.imageData };
    }
    if (campaign.imageUrl) {
      // Eğer tam URL değilse, base URL ekle
      if (campaign.imageUrl.startsWith('http')) {
        return { uri: campaign.imageUrl };
      }
      return { uri: `https://gurbetbiz.app${campaign.imageUrl}` };
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary[600]} />
      </View>
    );
  }

  if (campaigns.length === 0) {
    return null; // Banner yoksa bölümü gizle
  }

  return (
    <View style={styles.container}>
      {campaigns.map((campaign) => {
        const imageSource = getImageSource(campaign);
        
        return (
          <TouchableOpacity
            key={campaign.id}
            style={styles.bannerCard}
            onPress={() => handleBannerPress(campaign)}
            activeOpacity={0.8}
          >
            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>{campaign.title}</Text>
              </View>
            )}
            {/* Overlay caption - bottom 20% */}
            <View style={styles.overlay}>
              <Text style={styles.title} numberOfLines={1}>
                {campaign.title}
              </Text>
              {campaign.description && (
                <Text style={styles.description} numberOfLines={1}>
                  {campaign.description}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 8,
    gap: 12,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  bannerCard: {
    width: '100%',
    height: 180,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: colors.gray[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  title: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    color: colors.text.inverse,
    fontSize: 12,
    opacity: 0.9,
  },
});






