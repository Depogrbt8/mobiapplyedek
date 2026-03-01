/**
 * Navigation types for type-safe navigation
 */

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

// Travel Module Stack
export type TravelStackParamList = {
  'Travel/FlightSearch': undefined;
  'Travel/FlightResults': { searchParams: any };
  'Travel/FlightDetails': { flightId: string; flight?: any };
  'Travel/Reservation': { flight?: any };
  'Travel/Payment': { reservationData: any };
  'Travel/ReservationSuccess': { reservationId: string };
  'Travel/HotelSearch': undefined;
  'Travel/HotelResults': { searchParams: any };
  'Travel/HotelDetails': { hotelId: string; searchParams: any };
  'Travel/HotelReservation': { hotel?: any; room?: any; rate?: any; searchParams?: any };
  'Travel/HotelReservationSuccess': {
    booking: any;
    hotel: any;
    room: any;
    rate: any;
    guest?: any;
    guestDetails?: any;
    guests?: { adults: number; children: number; rooms: number };
    searchParams?: any;
  };
  'Travel/CarSearch': undefined;
  'Travel/CarResults': { searchParams: any };
  'Travel/CarDetails': { carId: string; searchToken: string; searchParams: any };
  'Travel/CarBooking': { car: any; searchParams: any; searchToken: string; selectedInsurance: string | null; selectedExtras: Record<string, number> };
  'Travel/CarBookingSuccess': { booking: any; searchParams: any };
  'Travel/CarReservation': { car?: any };
  'Travel/3DSecure': { redirectUrl: string; reservationId: string };
  'Travel/CheckIn': undefined;
  'Travel/PNRQuery': undefined;
  'Travel/CancelTicket': undefined;
};

// Transfer Module Stack (gelecek)
export type TransferStackParamList = {
  // To be defined later
};

// Games Module Stack (gelecek)
export type GamesStackParamList = {
  // To be defined later
};

// Social Module Stack (gelecek)
export type SocialStackParamList = {
  // To be defined later
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileMain: undefined;
  AccountInfo: undefined;
  MyTrips: undefined;
  ReservationsHistory: undefined;
  Settings: undefined;
  Passengers: undefined;
  // PNRQuery, CheckIn, CancelTicket TravelStack'e taşındı
  Help: undefined;
  About: undefined;
  Favorites: undefined;
  SearchHistory: undefined;
  PriceAlerts: undefined;
  AddEditPassenger: { passengerId?: string } | undefined;
  BillingInfo: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: { service?: 'home' | 'flight' | 'hotel' | 'car' | 'esim'; searchParams?: any } | undefined;
  // Travel: undefined; // Removed - Travel stack still exists but not in tab bar
  // Transfer: undefined; // gelecek
  // Games: undefined; // gelecek
  Operations: undefined; // İşlemler tab'ı
  Profile: undefined;
  ReservationsHistory: undefined;
  Settings: undefined;
  Passengers: undefined;
  PNRQuery: undefined;
  CheckIn: undefined;
  CancelTicket: undefined;
  Help: undefined;
  About: undefined;
};

// Root Stack Navigator
export type RootStackParamList = AuthStackParamList &
  TravelStackParamList &
  MainTabParamList &
  ProfileStackParamList;

// Navigation prop types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

