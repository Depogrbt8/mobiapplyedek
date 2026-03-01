import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { surveyService, type SurveyAnswer } from '@/services/surveyService';
import { surveyStorage } from '@/utils/surveyStorage';
import { flightService } from '@/modules/travel/services/flightService';
import type { Airport } from '@/types/flight';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';

interface SurveyQuestion {
  id: number;
  question: string;
  type: 'single' | 'multiple' | 'text' | 'rating' | 'searchable' | 'airports' | 'permissions' | 'demographics';
  options?: string[];
  required: boolean;
}

// Türkiye illeri
const turkishCities = [
  'ADANA', 'ADIYAMAN', 'AFYONKARAHİSAR', 'AĞRI', 'AMASYA', 'ANKARA', 'ANTALYA', 'ARTVİN', 'AYDIN', 'BALIKESİR',
  'BİLECİK', 'BİNGÖL', 'BİTLİS', 'BOLU', 'BURDUR', 'BURSA', 'ÇANAKKALE', 'ÇANKIRI', 'ÇORUM', 'DENİZLİ',
  'DİYARBAKIR', 'EDİRNE', 'ELAZIĞ', 'ERZİNCAN', 'ERZURUM', 'ESKİŞEHİR', 'GAZİANTEP', 'GİRESUN', 'GÜMÜŞHANE', 'HAKKARİ',
  'HATAY', 'ISPARTA', 'MERSİN', 'İSTANBUL', 'İZMİR', 'KARS', 'KASTAMONU', 'KAYSERİ', 'KIRKLARELİ', 'KIRŞEHİR',
  'KOCAELİ', 'KONYA', 'KÜTAHYA', 'MALATYA', 'MANİSA', 'KAHRAMANMARAŞ', 'MARDİN', 'MUĞLA', 'MUŞ', 'NEVŞEHİR',
  'NİĞDE', 'ORDU', 'RİZE', 'SAKARYA', 'SAMSUN', 'SİİRT', 'SİNOP', 'SİVAS', 'TEKİRDAĞ', 'TOKAT',
  'TRABZON', 'TUNCELİ', 'ŞANLIURFA', 'UŞAK', 'VAN', 'YOZGAT', 'ZONGULDAK', 'AKSARAY', 'BAYBURT', 'KARAMAN',
  'KIRIKKALE', 'BATMAN', 'ŞIRNAK', 'BARTIN', 'ARDAHAN', 'IĞDIR', 'YALOVA', 'KARABÜK', 'KİLİS', 'OSMANİYE', 'DÜZCE',
  'ISTANBUL', 'IZMIR', 'ISPARTA', 'IGDIR', 'KIRIKKALE', 'KILIS', 'SIVAS',
  'ADANA', 'ADIYAMAN', 'AFYONKARAHISAR', 'AGRI', 'AMASYA', 'ANKARA', 'ANTALYA', 'ARTVIN', 'AYDIN', 'BALIKESIR',
  'BILECIK', 'BINGOL', 'BITLIS', 'BOLU', 'BURDUR', 'BURSA', 'CANAKKALE', 'CANKIRI', 'CORUM', 'DENIZLI',
  'DIYARBAKIR', 'EDIRNE', 'ELAZIG', 'ERZINCAN', 'ERZURUM', 'ESKISEHIR', 'GAZIANTEP', 'GIRESUN', 'GUMUSHANE', 'HAKKARI',
  'HATAY', 'MERSIN', 'KARS', 'KASTAMONU', 'KAYSERI', 'KIRKLARELI', 'KIRSEHIR',
  'KOCAELI', 'KONYA', 'KUTAHYA', 'MALATYA', 'MANISA', 'KAHRAMANMARAS', 'MARDIN', 'MUGLA', 'MUS', 'NEVSEHIR',
  'NIGDE', 'ORDU', 'RIZE', 'SAKARYA', 'SAMSUN', 'SIIRT', 'SINOP', 'TEKIRDAG', 'TOKAT',
  'TRABZON', 'TUNCELI', 'SANLIURFA', 'USAK', 'VAN', 'YOZGAT', 'ZONGULDAK', 'AKSARAY', 'BAYBURT', 'KARAMAN',
  'BATMAN', 'SIRNAK', 'BARTIN', 'ARDAHAN', 'YALOVA', 'KARABUK', 'OSMANIYE', 'DUZCE'
];

const questions: SurveyQuestion[] = [
  {
    id: 1,
    question: 'Nerede gurbettesin?',
    type: 'single',
    options: [
      '🇩🇪 ALMANYA',
      '🇬🇧 İNGİLTERE',
      '🇫🇷 FRANSA',
      '🇧🇪 BELÇİKA',
      '🇳🇱 HOLLANDA',
      '🇨🇭 İSVİÇRE',
      '🇩🇰 DANİMARKA',
      '🇦🇹 AVUSTURYA',
      '🇸🇪 İSVEÇ',
      'DİĞER',
    ],
    required: true,
  },
  {
    id: 2,
    question: 'Memleketiniz neresi?',
    type: 'searchable',
    options: turkishCities,
    required: true,
  },
  {
    id: 3,
    question: 'En sık kullandığınız havaalanları',
    type: 'airports',
    required: true,
  },
  {
    id: 4,
    question: 'Genelde hangisiyle gidiyorsunuz?',
    type: 'single',
    options: ['Uçakla', 'Arabayla', 'Gemiyle'],
    required: true,
  },
  {
    id: 5,
    question: 'Okula devam eden çocuğunuz var mı?',
    type: 'single',
    options: ['Evet', 'Hayır'],
    required: true,
  },
  {
    id: 6,
    question: 'Türkiye\'de araç kiralıyor musunuz?',
    type: 'single',
    options: ['Evet her zaman', 'Bazen ihtiyaca göre', 'Hayır orada aracım var'],
    required: true,
  },
  {
    id: 7,
    question: 'Tatilde nasıl oteller tercih ediyorsunuz?',
    type: 'single',
    options: ['5 yıldızlı büyük oteller', 'Daha küçük oteller', 'Kiralık villalar'],
    required: true,
  },
  {
    id: 8,
    question: 'Türkiye\'de hangi telefon hattını kullanıyorsunuz?',
    type: 'single',
    options: ['Yurtdışı hattım', 'Türk hattı', 'E-sim'],
    required: true,
  },
  {
    id: 9,
    question: 'Cinsiyetiniz ve yaş aralığınız',
    type: 'demographics',
    required: true,
  },
  {
    id: 10,
    question: 'Teşekkür ederiz!',
    type: 'permissions',
    required: false,
  },
];

export const SurveyPopup: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  // TEST: Geçici olarak true yapıyoruz, sonra false yapacağız
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Searchable question states
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Airports question states
  const [departureAirport, setDepartureAirport] = useState<Airport | null>(null);
  const [returnAirport, setReturnAirport] = useState<Airport | null>(null);
  const [departureSearchTerm, setDepartureSearchTerm] = useState('');
  const [returnSearchTerm, setReturnSearchTerm] = useState('');
  const [departureSuggestions, setDepartureSuggestions] = useState<Airport[]>([]);
  const [returnSuggestions, setReturnSuggestions] = useState<Airport[]>([]);
  const [showDepartureResults, setShowDepartureResults] = useState(false);
  const [showReturnResults, setShowReturnResults] = useState(false);
  const [isSearchingAirports, setIsSearchingAirports] = useState(false);

  // Demographics states
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedAgeRange, setSelectedAgeRange] = useState('');

  // Permissions states
  const [emailPermission, setEmailPermission] = useState(false);
  const [phonePermission, setPhonePermission] = useState(false);

  // Check and show survey when component mounts or user changes
  useEffect(() => {
    const checkAndShowSurvey = async () => {
      console.log('SurveyPopup: useEffect çalıştı', { 
        isAuthenticated, 
        hasUser: !!user, 
        userId: user?.id,
        userEmail: user?.email 
      });

      if (!isAuthenticated) {
        console.log('SurveyPopup: Kullanıcı giriş yapmamış');
        return;
      }

      if (!user) {
        console.log('SurveyPopup: User objesi yok');
        return;
      }

      if (!user.id) {
        console.log('SurveyPopup: user.id yok', { user });
        return;
      }

      console.log('SurveyPopup: Kontrol başlatılıyor', { userId: user.id });

      try {
        // Check API for existing survey
        const surveyData = await surveyService.getSurveyStatus(user.id);
        console.log('SurveyPopup: API kontrolü', { surveyDataLength: surveyData.length });
        
        if (surveyData.length > 0) {
          console.log('SurveyPopup: Anket zaten doldurulmuş');
          return; // Already completed
        }

        // Check local storage
        const hasCompleted = await surveyStorage.isCompleted(user.id);
        const hasShownToday = await surveyStorage.wasShownToday(user.id);
        
        console.log('SurveyPopup: Local storage kontrolü', { hasCompleted, hasShownToday });

        if (!hasCompleted && !hasShownToday) {
          console.log('SurveyPopup: Popup gösteriliyor');
          setIsOpen(true);
          // setShownToday'ı popup kapatıldığında yapacağız
        } else {
          console.log('SurveyPopup: Popup gösterilmeyecek', { hasCompleted, hasShownToday });
        }
      } catch (error) {
        console.warn('SurveyPopup: Anket kontrolü hatası:', error);
        // Hata olsa bile popup göster (development için)
        console.log('SurveyPopup: Hata nedeniyle popup gösteriliyor (dev mode)');
        setIsOpen(true);
      }
    };

    // Small delay to ensure auth state is ready
    const timer = setTimeout(() => {
      checkAndShowSurvey();
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  // Auto-advance for airports
  useEffect(() => {
    if (questions[currentStep]?.type === 'airports' && departureAirport && returnAirport) {
      const timer = setTimeout(() => {
        handleNext();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [departureAirport, returnAirport, currentStep]);

  // Auto-advance for demographics
  useEffect(() => {
    if (questions[currentStep]?.type === 'demographics' && selectedGender && selectedAgeRange) {
      const timer = setTimeout(() => {
        handleNext();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedGender, selectedAgeRange, currentStep]);

  const handleAnswerChange = (answer: string) => {
    if (questions[currentStep].type === 'multiple') {
      const currentAnswers = Array.isArray(currentAnswer) ? currentAnswer : [];
      let newAnswers;
      if (currentAnswers.includes(answer)) {
        newAnswers = currentAnswers.filter((a) => a !== answer);
      } else {
        newAnswers = [...currentAnswers, answer];
      }
      setCurrentAnswer(newAnswers);

      const newAnswer: SurveyAnswer = {
        questionId: questions[currentStep].id,
        answer: newAnswers,
      };
      setAnswers((prevAnswers) => {
        const existingIndex = prevAnswers.findIndex((a) => a.questionId === questions[currentStep].id);
        if (existingIndex >= 0) {
          const updatedAnswers = [...prevAnswers];
          updatedAnswers[existingIndex] = newAnswer;
          return updatedAnswers;
        } else {
          return [...prevAnswers, newAnswer];
        }
      });
    } else {
      setCurrentAnswer(answer);
      if (questions[currentStep].type === 'searchable') {
        setShowSearchResults(false);
      }

      const newAnswer: SurveyAnswer = {
        questionId: questions[currentStep].id,
        answer: answer,
      };
      setAnswers((prevAnswers) => {
        const existingIndex = prevAnswers.findIndex((a) => a.questionId === questions[currentStep].id);
        if (existingIndex >= 0) {
          const updatedAnswers = [...prevAnswers];
          updatedAnswers[existingIndex] = newAnswer;
          return updatedAnswers;
        } else {
          return [...prevAnswers, newAnswer];
        }
      });

      // Auto-advance for searchable and single questions
      if (questions[currentStep].type === 'searchable' && currentAnswer) {
        setTimeout(() => {
          handleNext();
        }, 500);
      }

      if (questions[currentStep].type === 'single' && questions[currentStep].required) {
        setTimeout(() => {
          handleNext();
        }, 500);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      if (questions[currentStep].type === 'airports') {
        if (departureAirport && returnAirport) {
          const newAnswer: SurveyAnswer = {
            questionId: questions[currentStep].id,
            answer: JSON.stringify({
              departure: departureAirport,
              return: returnAirport,
            }),
          };
          setAnswers([...answers, newAnswer]);
        }
      } else if (currentAnswer && (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : (currentAnswer as string).trim() !== '')) {
        const newAnswer: SurveyAnswer = {
          questionId: questions[currentStep].id,
          answer: currentAnswer,
        };
        setAnswers([...answers, newAnswer]);
      }

      setCurrentStep(currentStep + 1);
      setCurrentAnswer([]);
      setSearchTerm('');
      setShowSearchResults(false);
      setDepartureAirport(null);
      setReturnAirport(null);
      setDepartureSearchTerm('');
      setReturnSearchTerm('');
      setShowDepartureResults(false);
      setShowReturnResults(false);
      setSelectedGender('');
      setSelectedAgeRange('');
    } else {
      handleSubmit();
    }
  };

  const handleClose = async () => {
    console.log('SurveyPopup: Kapatılıyor');
    setIsOpen(false);
    if (user?.id) {
      await surveyStorage.setShownToday(user.id);
      console.log('SurveyPopup: Bugün gösterildi olarak işaretlendi');
    }
  };

  const searchAirportsForSurvey = async (query: string, setSuggestions: React.Dispatch<React.SetStateAction<Airport[]>>) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearchingAirports(true);
    try {
      const results = await flightService.searchAirports(query);
      setSuggestions(results.slice(0, 8));
    } catch (error) {
      console.warn('Havalimanı arama hatası:', error);
      setSuggestions([]);
    } finally {
      setIsSearchingAirports(false);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const finalAnswers = [...answers];
      if (emailPermission || phonePermission) {
        finalAnswers.push({
          questionId: 10,
          answer: JSON.stringify({
            emailPermission,
            phonePermission,
          }),
        });
      }

      await surveyService.submitSurvey(user.id, finalAnswers, new Date().toISOString());
      await surveyStorage.setCompleted(user.id);
      setIsCompleted(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.warn('Anket gönderilirken hata:', error);
      await surveyStorage.setCompleted(user.id);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestion = questions[currentStep];
  const progress = currentQuestion ? ((currentStep + 1) / questions.length) * 100 : 0;

  // Safety check
  if (!currentQuestion) {
    console.error('SurveyPopup: currentQuestion undefined!', { currentStep, questionsLength: questions.length });
    return null;
  }

  const filteredCities = currentQuestion.type === 'searchable' && currentQuestion.options
    ? currentQuestion.options.filter((city) =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 8)
    : [];

  // Debug: Her zaman render et, sadece visible kontrolü yap
  console.log('SurveyPopup: Render', { 
    isOpen, 
    isAuthenticated, 
    hasUser: !!user, 
    userId: user?.id,
    currentStep,
    questionsLength: questions.length,
    currentQuestion: currentQuestion?.question 
  });

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.contentWrapper}>
            {!isCompleted && currentQuestion ? (
              <>
                <View style={styles.header}>
                  <Text style={styles.questionText}>
                    {currentQuestion.question}
                    {currentQuestion.required && <Text style={styles.required}> *</Text>}
                  </Text>
                  <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={colors.gray[600]} />
                  </TouchableOpacity>
                </View>

                {/* Progress bar */}
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>

                <View style={styles.content}>
                  {/* Question 1 - Grid buttons */}
                  {currentQuestion.id === 1 && currentQuestion.options && (
                    <View style={styles.gridContainer}>
                      {currentQuestion.options.map((option, index) => {
                        const isSelected = currentAnswer === option;
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.gridButton,
                              isSelected && styles.gridButtonSelected,
                            ]}
                            onPress={() => handleAnswerChange(option)}
                          >
                            <Text style={[styles.gridButtonText, isSelected && styles.gridButtonTextSelected]} numberOfLines={1}>
                              {option}
                            </Text>
                            {isSelected && (
                              <Ionicons name="checkmark" size={20} color={colors.primary[600]} style={{ marginLeft: 8 }} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {/* Searchable question */}
                  {currentQuestion.type === 'searchable' && (
                    <View style={styles.searchContainer}>
                      <View style={styles.searchInputContainer}>
                        <Ionicons name="search" size={20} color={colors.gray[400]} style={styles.searchIcon} />
                        <TextInput
                          style={styles.searchInput}
                          value={searchTerm}
                          onChangeText={(text) => {
                            setSearchTerm(text);
                            setShowSearchResults(true);
                          }}
                          onFocus={() => setShowSearchResults(true)}
                          placeholder="Şehir adı yazın..."
                          placeholderTextColor={colors.gray[500]}
                        />
                      </View>

                      {currentAnswer && (
                        <View style={styles.selectedCityContainer}>
                          <Text style={styles.selectedCityText}>{currentAnswer as string}</Text>
                          <TouchableOpacity
                            onPress={() => {
                              setCurrentAnswer('');
                              setSearchTerm('');
                            }}
                          >
                            <Ionicons name="close-circle" size={20} color={colors.primary[600]} />
                          </TouchableOpacity>
                        </View>
                      )}

                      {showSearchResults && searchTerm && filteredCities.length > 0 && (
                        <View style={styles.searchResults}>
                          <FlatList
                            data={filteredCities}
                            keyExtractor={(item, index) => `${item}-${index}`}
                            renderItem={({ item }) => (
                              <TouchableOpacity
                                style={styles.searchResultItem}
                                onPress={() => {
                                  handleAnswerChange(item);
                                  setSearchTerm(item);
                                  setShowSearchResults(false);
                                }}
                              >
                                <Text style={styles.searchResultText}>{item}</Text>
                              </TouchableOpacity>
                            )}
                            keyboardShouldPersistTaps="handled"
                          />
                        </View>
                      )}
                    </View>
                  )}

                  {/* Airports question */}
                  {currentQuestion.type === 'airports' && (
                    <View style={styles.airportsContainer}>
                      {/* Departure airport */}
                      <View style={styles.airportInputContainer}>
                        <Text style={styles.airportLabel}>Gidiş havaalanı</Text>
                        <View style={styles.searchInputContainer}>
                          <Ionicons name="search" size={20} color={colors.gray[400]} style={styles.searchIcon} />
                          <TextInput
                            style={styles.searchInput}
                            value={departureSearchTerm}
                            onChangeText={(text) => {
                              setDepartureSearchTerm(text);
                              searchAirportsForSurvey(text, setDepartureSuggestions);
                              setShowDepartureResults(true);
                            }}
                            onFocus={() => setShowDepartureResults(true)}
                            placeholder="Havaalanı adı veya kodu yazın..."
                            placeholderTextColor={colors.gray[500]}
                          />
                          {isSearchingAirports && (
                            <ActivityIndicator size="small" color={colors.primary[600]} />
                          )}
                        </View>

                        {departureAirport && (
                          <View style={styles.selectedCityContainer}>
                            <Text style={styles.selectedCityText}>
                              {departureAirport.name} ({departureAirport.code})
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                                setDepartureAirport(null);
                                setDepartureSearchTerm('');
                              }}
                            >
                              <Ionicons name="close-circle" size={20} color={colors.primary[600]} />
                            </TouchableOpacity>
                          </View>
                        )}

                        {showDepartureResults && departureSearchTerm && departureSuggestions.length > 0 && (
                          <View style={styles.searchResults}>
                            <FlatList
                              data={departureSuggestions}
                              keyExtractor={(item) => item.code}
                              renderItem={({ item }) => (
                                <TouchableOpacity
                                  style={styles.searchResultItem}
                                  onPress={() => {
                                    setDepartureAirport(item);
                                    setDepartureSearchTerm(`${item.name} (${item.code})`);
                                    setShowDepartureResults(false);
                                  }}
                                >
                                  <Text style={styles.airportNameText}>{item.name}</Text>
                                  <Text style={styles.airportCodeText}>{item.code} - {item.city}</Text>
                                </TouchableOpacity>
                              )}
                              keyboardShouldPersistTaps="handled"
                            />
                          </View>
                        )}
                      </View>

                      {/* Return airport */}
                      <View style={styles.airportInputContainer}>
                        <Text style={styles.airportLabel}>Dönüş havaalanı</Text>
                        <View style={styles.searchInputContainer}>
                          <Ionicons name="search" size={20} color={colors.gray[400]} style={styles.searchIcon} />
                          <TextInput
                            style={styles.searchInput}
                            value={returnSearchTerm}
                            onChangeText={(text) => {
                              setReturnSearchTerm(text);
                              searchAirportsForSurvey(text, setReturnSuggestions);
                              setShowReturnResults(true);
                            }}
                            onFocus={() => setShowReturnResults(true)}
                            placeholder="Havaalanı adı veya kodu yazın..."
                            placeholderTextColor={colors.gray[500]}
                          />
                          {isSearchingAirports && (
                            <ActivityIndicator size="small" color={colors.primary[600]} />
                          )}
                        </View>

                        {returnAirport && (
                          <View style={styles.selectedCityContainer}>
                            <Text style={styles.selectedCityText}>
                              {returnAirport.name} ({returnAirport.code})
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                                setReturnAirport(null);
                                setReturnSearchTerm('');
                              }}
                            >
                              <Ionicons name="close-circle" size={20} color={colors.primary[600]} />
                            </TouchableOpacity>
                          </View>
                        )}

                        {showReturnResults && returnSearchTerm && returnSuggestions.length > 0 && (
                          <View style={styles.searchResults}>
                            <FlatList
                              data={returnSuggestions}
                              keyExtractor={(item) => item.code}
                              renderItem={({ item }) => (
                                <TouchableOpacity
                                  style={styles.searchResultItem}
                                  onPress={() => {
                                    setReturnAirport(item);
                                    setReturnSearchTerm(`${item.name} (${item.code})`);
                                    setShowReturnResults(false);
                                  }}
                                >
                                  <Text style={styles.airportNameText}>{item.name}</Text>
                                  <Text style={styles.airportCodeText}>{item.code} - {item.city}</Text>
                                </TouchableOpacity>
                              )}
                              keyboardShouldPersistTaps="handled"
                            />
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Demographics question */}
                  {currentQuestion.type === 'demographics' && (
                    <View style={styles.demographicsContainer}>
                      <Text style={styles.demographicsLabel}>Cinsiyetiniz</Text>
                      <View style={styles.demographicsRow}>
                        <TouchableOpacity
                          style={[
                            styles.demographicsButton,
                            selectedGender === 'Kadın' && styles.demographicsButtonSelected,
                          ]}
                          onPress={() => {
                            setSelectedGender('Kadın');
                            const demographicsAnswer = {
                              gender: 'Kadın',
                              ageRange: selectedAgeRange,
                            };
                            const newAnswer: SurveyAnswer = {
                              questionId: questions[currentStep].id,
                              answer: JSON.stringify(demographicsAnswer),
                            };
                            setAnswers((prevAnswers) => {
                              const existingIndex = prevAnswers.findIndex((a) => a.questionId === questions[currentStep].id);
                              if (existingIndex >= 0) {
                                const updatedAnswers = [...prevAnswers];
                                updatedAnswers[existingIndex] = newAnswer;
                                return updatedAnswers;
                              } else {
                                return [...prevAnswers, newAnswer];
                              }
                            });
                          }}
                        >
                          <Text
                            style={[
                              styles.demographicsButtonText,
                              selectedGender === 'Kadın' && styles.demographicsButtonTextSelected,
                            ]}
                          >
                            Kadın
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.demographicsButton,
                            selectedGender === 'Erkek' && styles.demographicsButtonSelected,
                          ]}
                          onPress={() => {
                            setSelectedGender('Erkek');
                            const demographicsAnswer = {
                              gender: 'Erkek',
                              ageRange: selectedAgeRange,
                            };
                            const newAnswer: SurveyAnswer = {
                              questionId: questions[currentStep].id,
                              answer: JSON.stringify(demographicsAnswer),
                            };
                            setAnswers((prevAnswers) => {
                              const existingIndex = prevAnswers.findIndex((a) => a.questionId === questions[currentStep].id);
                              if (existingIndex >= 0) {
                                const updatedAnswers = [...prevAnswers];
                                updatedAnswers[existingIndex] = newAnswer;
                                return updatedAnswers;
                              } else {
                                return [...prevAnswers, newAnswer];
                              }
                            });
                          }}
                        >
                          <Text
                            style={[
                              styles.demographicsButtonText,
                              selectedGender === 'Erkek' && styles.demographicsButtonTextSelected,
                            ]}
                          >
                            Erkek
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={[styles.demographicsLabel, { marginTop: 20 }]}>Yaş aralığınız</Text>
                      <View style={styles.ageRangeContainer}>
                        {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map((ageRange) => (
                          <TouchableOpacity
                            key={ageRange}
                            style={[
                              styles.ageRangeButton,
                              selectedAgeRange === ageRange && styles.ageRangeButtonSelected,
                            ]}
                            onPress={() => {
                              setSelectedAgeRange(ageRange);
                              const demographicsAnswer = {
                                gender: selectedGender,
                                ageRange: ageRange,
                              };
                              const newAnswer: SurveyAnswer = {
                                questionId: questions[currentStep].id,
                                answer: JSON.stringify(demographicsAnswer),
                              };
                              setAnswers((prevAnswers) => {
                                const existingIndex = prevAnswers.findIndex((a) => a.questionId === questions[currentStep].id);
                                if (existingIndex >= 0) {
                                  const updatedAnswers = [...prevAnswers];
                                  updatedAnswers[existingIndex] = newAnswer;
                                  return updatedAnswers;
                                } else {
                                  return [...prevAnswers, newAnswer];
                                }
                              });
                            }}
                          >
                            <Text
                              style={[
                                styles.ageRangeButtonText,
                                selectedAgeRange === ageRange && styles.ageRangeButtonTextSelected,
                              ]}
                            >
                              {ageRange}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Permissions question */}
                  {currentQuestion.type === 'permissions' && (
                    <View style={styles.permissionsContainer}>
                      <Text style={styles.permissionsText}>
                        Sana uygun fırsatlardan haberdar olmak için lütfen e-posta ve telefon bildirimlerine izin ver.
                        Merak etme, seni sürekli rahatsız etmeyeceğiz.
                      </Text>

                      <TouchableOpacity
                        style={styles.permissionItem}
                        onPress={() => setEmailPermission(!emailPermission)}
                      >
                        <View style={styles.checkboxContainer}>
                          {emailPermission ? (
                            <Ionicons name="checkbox" size={24} color={colors.primary[600]} />
                          ) : (
                            <Ionicons name="checkbox-outline" size={24} color={colors.gray[400]} />
                          )}
                        </View>
                        <View style={styles.permissionTextContainer}>
                          <Text style={styles.permissionTitle}>E-posta bildirimlerine izin ver</Text>
                          <Text style={styles.permissionSubtitle}>En iyi fırsatları e-posta ile al</Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.permissionItem}
                        onPress={() => setPhonePermission(!phonePermission)}
                      >
                        <View style={styles.checkboxContainer}>
                          {phonePermission ? (
                            <Ionicons name="checkbox" size={24} color={colors.primary[600]} />
                          ) : (
                            <Ionicons name="checkbox-outline" size={24} color={colors.gray[400]} />
                          )}
                        </View>
                        <View style={styles.permissionTextContainer}>
                          <Text style={styles.permissionTitle}>Telefon bildirimlerine izin ver</Text>
                          <Text style={styles.permissionSubtitle}>Acil fırsatları SMS ile al</Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <ActivityIndicator color={colors.background} />
                        ) : (
                          <Text style={styles.submitButtonText}>Kapat</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Single choice (non-first question) */}
                  {currentQuestion.type === 'single' && currentQuestion.id !== 1 && currentQuestion.options && (
                    <View style={styles.optionsContainer}>
                      {currentQuestion.options.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.optionButton,
                            currentAnswer === option && styles.optionButtonSelected,
                          ]}
                          onPress={() => handleAnswerChange(option)}
                        >
                          <View style={styles.radioContainer}>
                            {currentAnswer === option ? (
                              <Ionicons name="radio-button-on" size={24} color={colors.primary[600]} />
                            ) : (
                              <Ionicons name="radio-button-off" size={24} color={colors.gray[400]} />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.optionText,
                              currentAnswer === option && styles.optionTextSelected,
                            ]}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Multiple choice */}
                  {currentQuestion.type === 'multiple' && currentQuestion.options && (
                    <View style={styles.optionsContainer}>
                      {currentQuestion.options.map((option, index) => {
                        const isSelected = Array.isArray(currentAnswer) && currentAnswer.includes(option);
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.optionButton,
                              isSelected && styles.optionButtonSelected,
                            ]}
                            onPress={() => handleAnswerChange(option)}
                          >
                            <View style={styles.checkboxContainer}>
                              {isSelected ? (
                                <Ionicons name="checkbox" size={24} color={colors.primary[600]} />
                              ) : (
                                <Ionicons name="checkbox-outline" size={24} color={colors.gray[400]} />
                              )}
                            </View>
                            <Text
                              style={[
                                styles.optionText,
                                isSelected && styles.optionTextSelected,
                              ]}
                            >
                              {option}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.completedContainer}>
                <View style={styles.completedIcon}>
                  <Ionicons name="checkmark-circle" size={64} color={colors.primary[600]} />
                </View>
                <Text style={styles.completedTitle}>Anketi Tamamladınız!</Text>
                <Text style={styles.completedText}>
                  Değerli görüşleriniz için teşekkür ederiz. Bu bilgiler bize daha iyi hizmet vermemize yardımcı olacak.
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 20,
    width: '100%',
    maxWidth: '100%',
    padding: 0,
    zIndex: 10000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  contentWrapper: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  required: {
    color: colors.error,
  },
  closeButton: {
    padding: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.gray[200],
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[600],
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  gridButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    backgroundColor: colors.background,
    minHeight: 56,
  },
  gridButtonSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  gridButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'left',
  },
  gridButtonTextSelected: {
    color: colors.primary[700],
  },
  searchContainer: {
    position: 'relative',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    padding: 0,
  },
  selectedCityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  selectedCityText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary[800],
    flex: 1,
  },
  searchResults: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    maxHeight: 200,
    marginTop: 4,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  searchResultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  searchResultText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  airportsContainer: {
    gap: 20,
  },
  airportInputContainer: {
    position: 'relative',
  },
  airportLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  airportNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  airportCodeText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  demographicsContainer: {
    gap: 16,
  },
  demographicsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  demographicsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  demographicsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    backgroundColor: colors.background,
    minHeight: 60,
  },
  demographicsButtonSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  demographicsButtonText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  demographicsButtonTextSelected: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  ageRangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ageRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  ageRangeButtonSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  ageRangeButtonText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  ageRangeButtonTextSelected: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  permissionsContainer: {
    gap: 16,
  },
  permissionsText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    backgroundColor: colors.background,
    minHeight: 70,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 4,
  },
  permissionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  submitButton: {
    backgroundColor: colors.primary[600],
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    backgroundColor: colors.background,
    minHeight: 56,
  },
  optionButtonSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  radioContainer: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  optionTextSelected: {
    color: colors.primary[700],
    fontWeight: '500',
  },
  completedContainer: {
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  completedIcon: {
    marginBottom: 20,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  completedText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});






