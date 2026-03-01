import type { NavigationProp } from '@react-navigation/native';

export interface Service {
  id: string;
  name: string;
  icon: string;
  onPress: () => void;
}

export const getServices = (navigation: NavigationProp<any>): Service[] => [
  {
    id: 'flight',
    name: 'UÇAK',
    icon: 'airplane',
    onPress: () => navigation.navigate('Travel' as never, { screen: 'Travel/FlightSearch' } as never),
  },
  {
    id: 'hotel',
    name: 'OTEL',
    icon: 'business',
    onPress: () => navigation.navigate('Travel' as never, { screen: 'Travel/HotelSearch' } as never),
  },
  {
    id: 'car',
    name: 'ARAÇ',
    icon: 'car',
    onPress: () => navigation.navigate('Travel' as never, { screen: 'Travel/CarSearch' } as never),
  },
  {
    id: 'esim',
    name: 'E SIM',
    icon: 'wifi',
    onPress: () => {
      // TODO: E SIM servisi eklenecek
      console.log('E SIM servisi');
    },
  },
  // Daha fazla ikon ekleyerek scroll'un çalışmasını sağlıyoruz
  {
    id: 'extra1',
    name: 'EKSTRA',
    icon: 'star',
    onPress: () => {},
  },
  {
    id: 'extra2',
    name: 'EKSTRA',
    icon: 'heart',
    onPress: () => {},
  },
];











