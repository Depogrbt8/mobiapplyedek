import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTravelStore } from '../store/travelStore';
import { reservationService } from '../services/reservationService';
import type { TravelStackParamList } from '@/core/navigation/types';
import { colors } from '@/constants/colors';
import {
  FlightDetailsCard,
  ContactForm,
  PassengerList,
  BaggageSelection,
  PriceSummary,
  type PassengerDetail,
} from '../components/booking';
import { passengerService } from '@/services/passengerService';

type RouteProp = RouteProp<TravelStackParamList, 'Travel/Reservation'>;
type NavigationProp = NativeStackNavigationProp<TravelStackParamList, 'Travel/Reservation'>;

const initialPassengerState: PassengerDetail = {
  id: null,
  firstName: '',
  lastName: '',
  birthDay: '',
  birthMonth: '',
  birthYear: '',
  gender: '',
  identityNumber: '',
  isForeigner: false,
  shouldSave: false,
  type: 'Yetişkin',
};

export const ReservationScreen: React.FC = () => {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { selectedFlight } = useTravelStore();
  const [isLoading, setIsLoading] = useState(false);

  const flightData = selectedFlight || route.params?.flight;
  
  // Gidiş-dönüş kontrolü
  const isRoundTrip = flightData && typeof flightData === 'object' && 'tripType' in flightData && flightData.tripType === 'roundTrip';
  const departureFlight = isRoundTrip && 'departure' in flightData ? flightData.departure : flightData;
  const returnFlight = isRoundTrip && 'return' in flightData ? flightData.return : undefined;
  const flight = departureFlight; // Geriye uyumluluk için

  // State management
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [savedPassengers, setSavedPassengers] = useState<any[]>([]);
  const [passengerDetails, setPassengerDetails] = useState<PassengerDetail[]>([]);
  const [baggageSelections, setBaggageSelections] = useState<any[]>([]);
  const [totalBaggagePrice, setTotalBaggagePrice] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+90');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [bookingType, setBookingType] = useState<'reserve' | 'book'>('book');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Initialize passengers from flight data
  useEffect(() => {
    if (flight) {
      // Get passenger count from flight or default to 1
      const totalPassengers = (flight as any).passengers || 1;
      const adults = totalPassengers;
      const children = 0;
      const infants = 0;

      setPassengers({ adults, children, infants });
      const total = adults + children;

      // Initialize passenger details
      const newPassengerDetails: PassengerDetail[] = Array(total).fill(null).map((_, i) => ({
        ...initialPassengerState,
        type: i < adults ? ('Yetişkin' as const) : ('Çocuk' as const),
      }));
      setPassengerDetails(newPassengerDetails);
      setBaggageSelections(Array(total).fill(null).map(() => [{ weight: 20, label: '20 kg Bagaj (Standart)', price: 0 }]));
    }
  }, [flight]);

  // Load saved passengers
  useEffect(() => {
    const loadSavedPassengers = async () => {
      try {
        const passengers = await passengerService.getPassengers();
        setSavedPassengers(passengers);
      } catch (error) {
        // Silently fail if user is not logged in
        console.log('Could not load saved passengers');
      }
    };
    loadSavedPassengers();
  }, []);

  const handlePassengerFormChange = (passengerIndex: number, field: string, value: any) => {
    const newDetails = [...passengerDetails];

    // If isForeigner is set to true, clear identityNumber
    if (field === 'isForeigner' && value === true) {
      newDetails[passengerIndex] = {
        ...newDetails[passengerIndex],
        [field]: value,
        identityNumber: '',
      };
    } else {
      newDetails[passengerIndex] = { ...newDetails[passengerIndex], [field]: value };
    }

    setPassengerDetails(newDetails);
  };

  const handleSelectSavedPassenger = (passengerIndex: number, passengerData: any | null) => {
    const newDetails = [...passengerDetails];
    if (passengerData) {
      newDetails[passengerIndex] = {
        ...passengerData,
        shouldSave: false,
        type: newDetails[passengerIndex].type,
        isForeigner: Boolean(passengerData.isForeigner),
      };
    } else {
      newDetails[passengerIndex] = { ...initialPassengerState, type: newDetails[passengerIndex].type };
    }
    setPassengerDetails(newDetails);
  };

  const handleSaveToggle = async (passengerIndex: number, checked: boolean) => {
    const newDetails = [...passengerDetails];
    newDetails[passengerIndex].shouldSave = checked;
    setPassengerDetails(newDetails);

    // If checked and passenger has required fields, save immediately
    if (checked && newDetails[passengerIndex].firstName && newDetails[passengerIndex].lastName) {
      await savePassenger(passengerIndex, newDetails[passengerIndex]);
    }
  };

  const savePassenger = async (passengerIndex: number, passengerData: PassengerDetail) => {
    try {
      const payload: any = {
        firstName: passengerData.firstName,
        lastName: passengerData.lastName,
        birthDay: passengerData.birthDay,
        birthMonth: passengerData.birthMonth,
        birthYear: passengerData.birthYear,
        gender: passengerData.gender as 'male' | 'female',
        identityNumber: passengerData.identityNumber || null,
        isForeigner: passengerData.isForeigner || false,
        countryCode: 'TR', // Default
      };

      if (passengerData.id) {
        // Update existing
        const updated = await passengerService.updatePassenger(passengerData.id, payload);
        const newDetails = [...passengerDetails];
        newDetails[passengerIndex] = { ...newDetails[passengerIndex], ...updated };
        setPassengerDetails(newDetails);
      } else {
        // Create new
        const newPassenger = await passengerService.addPassenger(payload);
        const newDetails = [...passengerDetails];
        newDetails[passengerIndex] = { ...newDetails[passengerIndex], id: newPassenger.id };
        setPassengerDetails(newDetails);
        setSavedPassengers((prev) => [newPassenger, ...prev]);
      }
    } catch (error: any) {
      console.error('Error saving passenger:', error);
    }
  };

  const handleBaggageChange = (passengerIndex: number, legIndex: number, baggage: any) => {
    const newSelections = [...baggageSelections];
    if (!newSelections[passengerIndex]) newSelections[passengerIndex] = [];
    newSelections[passengerIndex][legIndex] = baggage;
    setBaggageSelections(newSelections);

    // Recalculate total baggage price
    const total = newSelections.flat().reduce((acc, val) => acc + (val?.price || 0), 0);
    setTotalBaggagePrice(total);
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    // Contact info validation
    if (!contactEmail || !contactEmail.includes('@')) {
      errors.push('Geçerli bir e-posta adresi giriniz');
    }

    if (!contactPhone) {
      errors.push('Telefon numarası giriniz');
    }

    // Passenger validation
    passengerDetails.forEach((passenger, index) => {
      if (!passenger.firstName.trim()) {
        errors.push(`${index + 1}. yolcu için ad giriniz`);
      }
      if (!passenger.lastName.trim()) {
        errors.push(`${index + 1}. yolcu için soyad giriniz`);
      }
      if (!passenger.birthDay || !passenger.birthMonth || !passenger.birthYear) {
        errors.push(`${index + 1}. yolcu için doğum tarihi giriniz`);
      }
      if (!passenger.gender) {
        errors.push(`${index + 1}. yolcu için cinsiyet seçiniz`);
      }
      // TC kimlik numarası validasyonu - sadece T.C. vatandaşları için
      const isForeigner = Boolean(passenger.isForeigner);
      const hasIdentityNumber = passenger.identityNumber.trim().length > 0;

      if (!isForeigner && !hasIdentityNumber) {
        errors.push(`${index + 1}. yolcu için TC kimlik numarası giriniz`);
      }
    });

    return errors;
  };

  const handleProceedToPayment = async () => {
    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationModal(true);
      return;
    }

    if (!termsAccepted) {
      Alert.alert('Hata', 'Devam etmek için lütfen kullanım koşullarını kabul edin.');
      return;
    }

    setIsLoading(true);
    try {
      // Save passengers if needed
      const savePromises = passengerDetails
        .filter((p) => p.shouldSave)
        .map((p, idx) => {
          const passengerIndex = passengerDetails.findIndex((pd) => pd === p);
          return savePassenger(passengerIndex, p);
        });
      await Promise.all(savePromises);

      // Create reservation/order
      // TODO: Integrate with BiletDukkani API
      const reservation = await reservationService.createFlightReservation({
        type: 'flight',
        flightId: flight.id,
        passengers: passengerDetails.map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          birthDay: p.birthDay,
          birthMonth: p.birthMonth,
          birthYear: p.birthYear,
          gender: p.gender as 'male' | 'female',
          identityNumber: p.identityNumber,
          isForeigner: p.isForeigner || false,
        })),
        contactInfo: {
          email: contactEmail,
          phone: contactPhone,
          countryCode,
        },
        baggageSelections,
        bookingType,
        marketingConsent,
        amount: finalTotalPrice,
        currency: flight.currency || 'EUR',
      });

      if (bookingType === 'reserve') {
        // Show reservation modal
        Alert.alert(
          'Rezervasyon Başarılı',
          `PNR: ${reservation.pnr || 'N/A'}\nGeçerlilik: ${reservation.validUntil || 'N/A'}`,
          [{ text: 'Tamam', onPress: () => navigation.goBack() }]
        );
      } else {
        // Navigate to payment
      navigation.navigate('Travel/Payment', {
          reservationData: {
            reservation,
            flight,
            passengers: passengerDetails,
            contactInfo: { email: contactEmail, phone: contactPhone, countryCode },
            baggageSelections,
            type: 'flight',
          },
        });
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Rezervasyon oluşturulamadı');
    } finally {
      setIsLoading(false);
    }
  };

  if (!flight) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Uçuş bilgisi bulunamadı</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Geri</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalPassengers = passengers.adults + passengers.children;
  const baseTotalPrice = (flight.price || 0) * totalPassengers;
  const taxes = baseTotalPrice * 0.1;
  const finalTotalPrice = baseTotalPrice + taxes + totalBaggagePrice;

  // Status bar yüksekliğine göre sabit padding
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {/* Status bar için padding */}
      <View style={{ height: statusBarHeight }} />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Flight Details */}
        <View style={styles.sectionContainer}>
          <FlightDetailsCard flight={departureFlight} returnFlight={returnFlight} />
        </View>

        {/* Contact Form */}
        <View style={styles.sectionContainer}>
          <ContactForm
            userEmail={contactEmail}
            userPhone={contactPhone}
            onEmailChange={setContactEmail}
            onPhoneChange={setContactPhone}
            onCountryCodeChange={setCountryCode}
            countryCode={countryCode}
            marketingConsent={marketingConsent}
            onMarketingConsentChange={setMarketingConsent}
          />
        </View>

        {/* Passenger List */}
        <View style={styles.sectionContainer}>
          <PassengerList
            passengers={passengers}
            passengerDetails={passengerDetails}
            savedPassengers={savedPassengers}
            flight={flight}
            onSelectSavedPassenger={handleSelectSavedPassenger}
            onPassengerFormChange={handlePassengerFormChange}
            onSaveToggle={handleSaveToggle}
          />
        </View>

        {/* Baggage Selection */}
        <View style={styles.sectionContainer}>
          <BaggageSelection
            passengers={passengerDetails}
            flight={flight}
            onBaggageChange={handleBaggageChange}
            baggageSelections={baggageSelections}
          />
        </View>

        {/* Price Summary */}
        <View style={styles.sectionContainer}>
          <PriceSummary
            totalPassengers={totalPassengers}
            baseTotalPrice={baseTotalPrice}
            totalBaggagePrice={totalBaggagePrice}
            taxes={taxes}
            finalTotalPrice={finalTotalPrice}
            termsAccepted={termsAccepted}
            bookingType={bookingType}
            onTermsChange={setTermsAccepted}
            onBookingTypeChange={setBookingType}
            onProceedToPayment={handleProceedToPayment}
          />
        </View>
      </ScrollView>

      {/* Validation Modal */}
      <Modal
        visible={showValidationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowValidationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lütfen Düzeltin</Text>
              <TouchableOpacity onPress={() => setShowValidationModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.errorsList}>
              {validationErrors.map((error, index) => (
                <Text key={index} style={styles.errorItem}>
                  • {error}
                </Text>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowValidationModal(false)}
            >
              <Text style={styles.modalButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50], // Hafif gri arka plan
  },
  content: {
    padding: 12,
    paddingTop: 16,
    paddingBottom: 32,
  },
  sectionContainer: {
    marginBottom: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: colors.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary[600],
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  errorsList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  errorItem: {
    fontSize: 14,
    color: colors.error,
    marginBottom: 8,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: colors.primary[600],
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
});
