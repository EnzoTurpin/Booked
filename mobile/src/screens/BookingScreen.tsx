import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import StyledText from "../components/StyledText";
import StyledView from "../components/StyledView";
import api from "../services/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Toast from "react-native-toast-message";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import { useAuth } from "../contexts/AuthContext";

// Créneaux horaires standard
const TIME_SLOTS: string[] = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

interface Professional {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  profession: string;
}

interface AvailabilitySlot {
  _id: string;
  time: string;
  available: boolean;
}

interface Availability {
  _id: string;
  date: string;
  slots: AvailabilitySlot[];
}

const BookingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // Étapes du processus de réservation
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Données et sélections
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");

  // État pour l'affichage du sélecteur de date
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // État de chargement
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  const [weeklySchedule, setWeeklySchedule] = useState<any>(null);

  useEffect(() => {
    // Charger les professionnels au démarrage
    fetchProfessionals();
  }, []);

  useEffect(() => {
    // Récupérer les disponibilités lorsque le professionnel est sélectionné
    if (selectedProfessional) {
      fetchAvailabilities();
    }
  }, [selectedProfessional]);

  useEffect(() => {
    // Filtrer les créneaux disponibles pour la date sélectionnée
    if (selectedDate && selectedProfessional) {
      const dateString = format(selectedDate, "yyyy-MM-dd");
      const dayOfWeek = format(selectedDate, "EEEE", {
        locale: fr,
      }).toLowerCase();

      // Charger les horaires hebdomadaires du professionnel
      fetchProfessionalSchedule(dayOfWeek);
    }
  }, [selectedDate, selectedProfessional]);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users?role=professional");
      console.log("Réponse des professionnels:", JSON.stringify(response.data));

      // Traitement correct de la réponse API
      if (response.data) {
        // Si la réponse contient une propriété data, utiliser cette propriété
        if (response.data.data && Array.isArray(response.data.data)) {
          // Filtrer pour ne garder que les professionnels
          const professionalsData = response.data.data.filter(
            (user: any) =>
              user.role === "professional" || user.role === "professionnal"
          );
          setProfessionals(professionalsData);
        }
        // Sinon, si la réponse est directement un tableau
        else if (Array.isArray(response.data)) {
          // Filtrer pour ne garder que les professionnels
          const professionalsData = response.data.filter(
            (user: any) =>
              user.role === "professional" || user.role === "professionnal"
          );
          setProfessionals(professionalsData);
        } else {
          setProfessionals([]);
        }
      } else {
        setProfessionals([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des professionnels:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de charger les professionnels",
      });
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailabilities = async () => {
    setLoadingSlots(true);
    try {
      // Récupérer les disponibilités depuis l'API
      try {
        const response = await api.get(`/availability/${selectedProfessional}`);
        console.log(
          "Réponse disponibilités (si disponible):",
          JSON.stringify(response.data)
        );

        // Utiliser les données de l'API au lieu de les ignorer
        if (response.data && response.data.success) {
          // Vérifier et normaliser les dates pour chaque disponibilité
          const normalizedAvailabilities = response.data.data.map(
            (avail: any) => {
              // S'assurer que la date est au format YYYY-MM-DD
              if (avail.date) {
                // Si la date contient une heure (format ISO), la supprimer
                if (avail.date.includes("T")) {
                  const datePart = avail.date.split("T")[0];
                  return { ...avail, date: datePart };
                }
              }
              return avail;
            }
          );

          console.log(
            "Disponibilités normalisées:",
            normalizedAvailabilities.map((a: any) => a.date)
          );
          setAvailabilities(normalizedAvailabilities || []);
        }
      } catch (apiError) {
        console.log(
          "API de disponibilités non disponible, utilisation des données locales uniquement"
        );
        // En cas d'erreur seulement, on met un tableau vide
        setAvailabilities([]);
      }

      // Pas besoin d'attendre car nous passons directement aux horaires locaux
      const dateString = format(selectedDate, "yyyy-MM-dd");
      const dayOfWeek = format(selectedDate, "EEEE", {
        locale: fr,
      }).toLowerCase();

      // Charger directement les horaires hebdomadaires du professionnel
      fetchProfessionalSchedule(dayOfWeek);
    } catch (error) {
      console.error("Erreur lors du chargement des disponibilités:", error);
      // En cas d'erreur, passer quand même aux horaires locaux
      const dayOfWeek = format(selectedDate, "EEEE", {
        locale: fr,
      }).toLowerCase();
      fetchProfessionalSchedule(dayOfWeek);
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchProfessionalSchedule = async (dayOfWeek: string) => {
    try {
      setLoadingSlots(true);

      // Convertir le jour français en anglais pour correspondre aux clés du backend
      const dayMap: Record<string, string> = {
        lundi: "monday",
        mardi: "tuesday",
        mercredi: "wednesday",
        jeudi: "thursday",
        vendredi: "friday",
        samedi: "saturday",
        dimanche: "sunday",
      };

      const englishDay = dayMap[dayOfWeek] || dayOfWeek;

      console.log("Chargement des horaires pour", englishDay);

      // Vérifier si l'API est disponible en testant un point de terminaison existant
      try {
        const testResponse = await api.get("/users");
        console.log("Test de connexion API:", testResponse.status);
      } catch (error) {
        console.log(
          "L'API n'est pas accessible, utilisation des données locales"
        );
      }

      // Pour l'instant, nous utilisons des horaires prédéfinis
      // Lorsque l'API sera prête, nous pourrons la connecter ici
      console.log("Utilisation des horaires locaux pour la démonstration");
      const localSchedule = {
        monday: { isOpen: true, startTime: "09:00", endTime: "18:00" },
        tuesday: { isOpen: true, startTime: "09:00", endTime: "18:00" },
        wednesday: { isOpen: true, startTime: "10:00", endTime: "19:00" },
        thursday: { isOpen: true, startTime: "09:00", endTime: "18:00" },
        friday: { isOpen: true, startTime: "09:00", endTime: "17:00" },
        saturday: { isOpen: true, startTime: "10:00", endTime: "14:00" },
        sunday: { isOpen: false, startTime: "00:00", endTime: "00:00" },
      };

      setWeeklySchedule(localSchedule);
      filterAvailableTimeSlots(localSchedule, englishDay);

      // Simuler un court délai pour l'expérience utilisateur
      setTimeout(() => {
        setLoadingSlots(false);
      }, 500);
    } catch (error) {
      console.error("Erreur lors du traitement des horaires:", error);
      // Par défaut, utiliser tous les créneaux standards
      filterAvailableTimeSlots(null, dayOfWeek);
      setLoadingSlots(false);
    }
  };

  const filterAvailableTimeSlots = (schedule: any, dayOfWeek: string) => {
    const dateString = format(selectedDate, "yyyy-MM-dd");

    // Vérifier si le jour est ouvert selon l'emploi du temps hebdomadaire
    const isDayOpen =
      schedule && schedule[dayOfWeek] ? schedule[dayOfWeek].isOpen : true;

    if (!isDayOpen) {
      // Si le jour est fermé, aucun créneau disponible
      setAvailableSlots([]);
      setLoadingSlots(false);
      return;
    }

    // Récupérer les heures d'ouverture et de fermeture pour ce jour
    const startTime =
      schedule && schedule[dayOfWeek] ? schedule[dayOfWeek].startTime : "08:00";
    const endTime =
      schedule && schedule[dayOfWeek] ? schedule[dayOfWeek].endTime : "18:00";

    // Créer des créneaux uniquement pour les heures d'ouverture
    let filteredTimeSlots = TIME_SLOTS.filter((time) => {
      // Comparer l'heure avec les heures d'ouverture
      return time >= startTime && time <= endTime;
    }).map((time) => ({
      _id: `temp-${time}`,
      time: time,
      available: true, // Par défaut, tous les créneaux sont disponibles
    }));

    console.log(
      "Créneaux générés selon les horaires d'ouverture:",
      filteredTimeSlots.map((s) => s.time)
    );

    // Vérifier si nous avons des disponibilités spécifiques pour cette date
    console.log(
      "Dates disponibles:",
      availabilities.map((a) => a.date)
    );

    const availabilityForDate = availabilities.find(
      (a) => a.date === dateString
    );

    console.log(
      "Disponibilités pour",
      dateString,
      ":",
      availabilityForDate ? "trouvées" : "non trouvées"
    );

    // Si nous avons des disponibilités spécifiques, mettre à jour uniquement les créneaux indisponibles
    if (availabilityForDate && availabilityForDate.slots.length > 0) {
      console.log(
        "Créneaux dans la base de données:",
        availabilityForDate.slots.map(
          (s) => `${s.time} (${s.available ? "disponible" : "indisponible"})`
        )
      );

      // Mettre à jour les créneaux avec les données de la base de données, mais uniquement pour marquer les indisponibles
      filteredTimeSlots = filteredTimeSlots.map((slot) => {
        // Chercher si ce créneau existe dans la base de données
        const existingSlot = availabilityForDate.slots.find(
          (s) => s.time === slot.time
        );

        if (existingSlot) {
          // Si le créneau existe dans la base, utiliser sa disponibilité
          return {
            _id: existingSlot._id || `temp-${slot.time}`,
            time: slot.time,
            available: existingSlot.available,
          };
        }
        // Si le créneau n'existe pas dans la base, le garder comme disponible par défaut
        return slot;
      });
    } else {
      console.log(
        "Pas de disponibilités spécifiques pour cette date, tous les créneaux des horaires d'ouverture sont disponibles"
      );
    }

    // Filtrer pour ne garder que les créneaux disponibles
    const availableSlots = filteredTimeSlots.filter((slot) => slot.available);

    // Trier les créneaux par heure
    const sortedSlots = availableSlots.sort((a, b) => {
      const timeA = a.time.split(":").map(Number);
      const timeB = b.time.split(":").map(Number);

      // Comparer les heures d'abord, puis les minutes
      if (timeA[0] !== timeB[0]) {
        return timeA[0] - timeB[0];
      }
      return timeA[1] - timeB[1];
    });

    setAvailableSlots(sortedSlots);
    setLoadingSlots(false);

    // DÉBOGAGE: Afficher les créneaux disponibles
    console.log(
      "Créneaux disponibles après filtrage pour " + dayOfWeek + ":",
      sortedSlots.map((slot) => slot.time)
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setSelectedDate(selectedDate);
      setSelectedTimeSlot("");
    }
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!selectedProfessional || !selectedTimeSlot) {
        throw new Error("Veuillez sélectionner un professionnel et un horaire");
      }

      if (!user || !user.id) {
        throw new Error("Vous devez être connecté pour prendre un rendez-vous");
      }

      const appointmentDate = format(selectedDate, "yyyy-MM-dd");

      // S'assurer que l'heure est au bon format
      const timeToSend = selectedTimeSlot.trim();

      console.log("DÉBOGAGE - Données envoyées au serveur:", {
        professionalId: selectedProfessional,
        date: appointmentDate,
        time: timeToSend,
        status: "pending",
        userId: user.id,
      });

      // Vérifier d'abord si le créneau est réellement disponible dans la base de données
      const availabilityForDate = availabilities.find(
        (a) => a.date === appointmentDate
      );

      // Si nous avons des disponibilités pour cette date, vérifier seulement si le créneau n'est pas explicitement marqué comme indisponible
      if (availabilityForDate) {
        const existingSlot = availabilityForDate.slots.find(
          (slot) => slot.time === timeToSend
        );

        // Si le créneau existe et est explicitement marqué comme indisponible
        if (existingSlot && !existingSlot.available) {
          Toast.show({
            type: "error",
            text1: "Désolé",
            text2: "Ce créneau n'est pas disponible",
          });
          setLoading(false);
          return;
        }

        // Si le créneau existe et est disponible ou s'il n'existe pas encore, continuer
        console.log("Créneau disponible ou non défini, on continue");
      } else {
        // Si aucune disponibilité n'est définie pour cette date, vérifier uniquement les horaires d'ouverture
        console.log(
          "Pas de disponibilités pour cette date dans la base de données, vérification des horaires d'ouverture uniquement"
        );
      }

      // Vérifier si l'heure est dans les horaires d'ouverture
      const dayOfWeek = format(selectedDate, "EEEE", {
        locale: fr,
      }).toLowerCase();

      // Convertir le jour français en anglais
      const dayMap: Record<string, string> = {
        lundi: "monday",
        mardi: "tuesday",
        mercredi: "wednesday",
        jeudi: "thursday",
        vendredi: "friday",
        samedi: "saturday",
        dimanche: "sunday",
      };

      const englishDay = dayMap[dayOfWeek] || dayOfWeek;

      // Récupérer le planning pour ce jour
      const daySchedule = weeklySchedule?.[englishDay];

      if (!daySchedule || !daySchedule.isOpen) {
        Toast.show({
          type: "error",
          text1: "Désolé",
          text2: "Ce jour n'est pas ouvert",
        });
        setLoading(false);
        return;
      }

      if (
        !(
          timeToSend >= daySchedule.startTime &&
          timeToSend <= daySchedule.endTime
        )
      ) {
        Toast.show({
          type: "error",
          text1: "Désolé",
          text2: "Ce créneau est en dehors des horaires d'ouverture",
        });
        setLoading(false);
        return;
      }

      console.log(
        "Créneau dans les horaires d'ouverture, tentative de création du rendez-vous"
      );

      // Tentative de création de rendez-vous
      try {
        const response = await api.post("/appointments", {
          professionalId: selectedProfessional,
          date: appointmentDate,
          time: timeToSend,
          status: "pending",
          userId: user.id,
        });

        if (response.data) {
          // Réinitialiser le formulaire
          setSelectedProfessional("");
          setSelectedDate(new Date());
          setSelectedTimeSlot("");
          setCurrentStep(3); // Étape de confirmation

          Toast.show({
            type: "success",
            text1: "Succès",
            text2: "Votre rendez-vous a été enregistré",
          });
        }
      } catch (apiError: any) {
        console.error(
          "Erreur API lors de la création du rendez-vous:",
          apiError
        );

        // Afficher l'erreur réelle au lieu de simuler un succès
        let errorMessage = "Impossible de créer le rendez-vous";
        if (
          apiError.response &&
          apiError.response.data &&
          apiError.response.data.message
        ) {
          errorMessage = apiError.response.data.message;
        }

        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: errorMessage,
        });
      }
    } catch (error: any) {
      console.error("Erreur lors de la création du rendez-vous:", error);

      // Extraire le message d'erreur spécifique de la réponse API
      let errorMessage = "Impossible de créer le rendez-vous";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }

      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepOne = () => (
    <StyledView className="space-y-6">
      <StyledText className="text-xl font-bold text-brown mb-2">
        Choisissez un professionnel
      </StyledText>

      {loading ? (
        <ActivityIndicator size="large" color="#A8B9A3" />
      ) : (
        <ScrollView className="max-h-96">
          <StyledView className="space-y-4">
            {Array.isArray(professionals) && professionals.length > 0 ? (
              professionals.map((pro) => (
                <TouchableOpacity
                  key={pro._id}
                  className={`p-4 rounded-lg border ${
                    selectedProfessional === pro._id
                      ? "bg-sage border-sage"
                      : "bg-white border-sage/20"
                  }`}
                  onPress={() => setSelectedProfessional(pro._id)}
                >
                  <StyledText
                    className={`font-bold ${
                      selectedProfessional === pro._id
                        ? "text-white"
                        : "text-brown"
                    }`}
                  >
                    {pro.firstName} {pro.lastName}
                  </StyledText>
                  {pro.profession && (
                    <StyledText
                      className={`text-sm mt-1 ${
                        selectedProfessional === pro._id
                          ? "text-white/90"
                          : "text-brown-light"
                      }`}
                    >
                      {pro.profession}
                    </StyledText>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <StyledText className="text-brown text-center py-4">
                Aucun professionnel disponible pour le moment
              </StyledText>
            )}
          </StyledView>
        </ScrollView>
      )}

      <TouchableOpacity
        className={`py-3 rounded-lg items-center ${
          selectedProfessional ? "bg-sage" : "bg-gray-300"
        }`}
        onPress={nextStep}
        disabled={!selectedProfessional}
      >
        <StyledText className="text-white font-bold">Continuer</StyledText>
      </TouchableOpacity>
    </StyledView>
  );

  const renderStepTwo = () => (
    <StyledView className="space-y-6">
      <StyledText className="text-xl font-bold text-brown mb-2">
        Choisissez la date et l'heure
      </StyledText>

      {/* Sélection de la date */}
      <StyledView className="bg-white p-4 rounded-lg border border-sage/20">
        <StyledText className="font-bold text-brown mb-2">
          Date du rendez-vous
        </StyledText>

        <TouchableOpacity
          className="py-3 px-4 border border-sage/30 rounded-lg"
          onPress={() => setShowDatePicker(true)}
        >
          <StyledText className="text-brown">
            {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
          </StyledText>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </StyledView>

      {/* Sélection de l'heure */}
      <StyledView className="bg-white p-4 rounded-lg border border-sage/20">
        <StyledText className="font-bold text-brown mb-2">
          Heure du rendez-vous
        </StyledText>

        {loadingSlots ? (
          <ActivityIndicator size="small" color="#A8B9A3" />
        ) : availableSlots.length > 0 ? (
          <View className="flex-row flex-wrap justify-between">
            {availableSlots.map((slot) => (
              <TouchableOpacity
                key={slot._id}
                className={`py-2 px-4 rounded-lg border m-1 ${
                  selectedTimeSlot === slot.time
                    ? "bg-sage border-sage"
                    : "bg-white border-sage/20"
                }`}
                style={{ width: "30%", marginBottom: 8 }}
                onPress={() => setSelectedTimeSlot(slot.time)}
              >
                <StyledText
                  className={`text-center ${
                    selectedTimeSlot === slot.time ? "text-white" : "text-brown"
                  }`}
                >
                  {slot.time}
                </StyledText>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <StyledText className="text-brown-light">
            Aucun créneau disponible pour cette date
          </StyledText>
        )}
      </StyledView>

      <StyledView className="flex-row justify-between">
        <TouchableOpacity
          className="py-3 px-6 rounded-lg bg-white border border-sage"
          onPress={prevStep}
        >
          <StyledText className="text-sage font-bold">Retour</StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          className={`py-3 px-6 rounded-lg items-center ${
            selectedTimeSlot ? "bg-sage" : "bg-gray-300"
          }`}
          onPress={handleSubmit}
          disabled={!selectedTimeSlot || loading}
        >
          <StyledText className="text-white font-bold">
            {loading ? "Chargement..." : "Confirmer"}
          </StyledText>
        </TouchableOpacity>
      </StyledView>
    </StyledView>
  );

  const renderStepThree = () => (
    <StyledView className="items-center justify-center py-8">
      <StyledView className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
        <StyledText className="text-4xl text-green-600">✓</StyledText>
      </StyledView>

      <StyledText className="text-2xl font-bold text-brown mb-2 text-center">
        Réservation confirmée !
      </StyledText>

      <StyledText className="text-base text-brown-light mb-8 text-center px-6">
        Votre rendez-vous a été réservé avec succès. Vous recevrez une
        confirmation par email.
      </StyledText>

      <TouchableOpacity
        className="bg-sage py-3 px-6 rounded-lg"
        onPress={() => {
          setCurrentStep(1);
          // @ts-ignore
          navigation.navigate("MyAppointmentsTab");
        }}
      >
        <StyledText className="text-white font-bold">
          Voir mes rendez-vous
        </StyledText>
      </TouchableOpacity>
    </StyledView>
  );

  return (
    <SafeAreaWrapper>
      <ScrollView className="flex-1">
        <StyledView className="p-6">
          <StyledText className="text-2xl font-bold text-brown mb-6 text-center">
            Prendre rendez-vous
          </StyledText>

          {/* Indicateur d'étape */}
          <StyledView className="flex-row justify-between mb-8 px-4">
            {[1, 2].map((step) => (
              <StyledView
                key={step}
                className={`h-2 rounded-full ${
                  step <= currentStep ? "bg-sage" : "bg-sage/30"
                }`}
                style={{ width: "45%" }}
              />
            ))}
          </StyledView>

          {/* Contenu des étapes */}
          {currentStep === 1 && renderStepOne()}
          {currentStep === 2 && renderStepTwo()}
          {currentStep === 3 && renderStepThree()}
        </StyledView>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default BookingScreen;
