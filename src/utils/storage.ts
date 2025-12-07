import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = '@search_history';

export interface SearchHistoryItem {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  tripType: 'oneWay' | 'roundTrip';
  createdAt: string;
}

/**
 * Local storage utilities for search history
 * (Until backend endpoint is ready)
 */
export const searchHistoryStorage = {
  async getHistory(): Promise<SearchHistoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get search history:', error);
      return [];
    }
  },

  async saveSearch(search: Omit<SearchHistoryItem, 'id' | 'createdAt'>): Promise<void> {
    try {
      const history = await this.getHistory();
      const newItem: SearchHistoryItem = {
        ...search,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      // Remove duplicates (same origin, destination, date)
      const filtered = history.filter(
        (item) =>
          !(
            item.origin === search.origin &&
            item.destination === search.destination &&
            item.departureDate === search.departureDate
          )
      );
      
      // Add new item at the beginning
      const updated = [newItem, ...filtered].slice(0, 50); // Keep last 50 searches
      
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  },

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  },
};

