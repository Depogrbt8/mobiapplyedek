import { create } from 'zustand';

interface AppState {
  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Language
  language: 'tr' | 'en';
  setLanguage: (language: 'tr' | 'en') => void;
  
  // App state
  isInitialized: boolean;
  setInitialized: (value: boolean) => void;
  
  // Network
  isOnline: boolean;
  setIsOnline: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  
  language: 'tr',
  setLanguage: (language) => set({ language }),
  
  isInitialized: false,
  setInitialized: (value) => set({ isInitialized: value }),
  
  isOnline: true,
  setIsOnline: (value) => set({ isOnline: value }),
}));



