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
  'Travel/HotelReservation': { hotel?: any };
  'Travel/CarSearch': undefined;
  'Travel/CarResults': { searchParams: any };
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
  Home: undefined;
  Travel: undefined;
  // Transfer: undefined; // gelecek
  // Games: undefined; // gelecek
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

