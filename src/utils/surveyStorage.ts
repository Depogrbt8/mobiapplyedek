import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Survey storage utilities using AsyncStorage
 */
export const surveyStorage = {
  /**
   * Check if survey is completed for a user
   */
  async isCompleted(userId: string): Promise<boolean> {
    try {
      const key = `surveyCompleted_${userId}`;
      const value = await AsyncStorage.getItem(key);
      return value === 'true';
    } catch (error) {
      console.error('Failed to check survey completion:', error);
      return false;
    }
  },

  /**
   * Mark survey as completed
   */
  async setCompleted(userId: string): Promise<void> {
    try {
      const key = `surveyCompleted_${userId}`;
      await AsyncStorage.setItem(key, 'true');
    } catch (error) {
      console.error('Failed to set survey completion:', error);
    }
  },

  /**
   * Check if survey was shown today
   */
  async wasShownToday(userId: string): Promise<boolean> {
    try {
      const today = new Date().toDateString();
      const sessionKey = `surveyShown_${userId}_${today}`;
      const value = await AsyncStorage.getItem(sessionKey);
      return value === 'true';
    } catch (error) {
      console.error('Failed to check survey shown today:', error);
      return false;
    }
  },

  /**
   * Mark survey as shown today
   */
  async setShownToday(userId: string): Promise<void> {
    try {
      const today = new Date().toDateString();
      const sessionKey = `surveyShown_${userId}_${today}`;
      await AsyncStorage.setItem(sessionKey, 'true');
    } catch (error) {
      console.error('Failed to set survey shown today:', error);
    }
  },
};






