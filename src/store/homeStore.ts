import { create } from 'zustand';

type ServiceType = 'home' | 'flight' | 'hotel' | 'car' | 'esim';

interface HomeState {
  selectedService: ServiceType;
  setSelectedService: (service: ServiceType) => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  selectedService: 'home',
  setSelectedService: (service: ServiceType) => set({ selectedService: service }),
}));



