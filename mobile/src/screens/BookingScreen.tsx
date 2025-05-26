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
    if (selectedDate && availabilities.length > 0) {
      const dateString = format(selectedDate, "yyyy-MM-dd");
      const availabilityForDate = availabilities.find(
        (a) => a.date === dateString
      );

      if (availabilityForDate) {
        // Filtrer seulement les créneaux disponibles
        const availableSlots = availabilityForDate.slots.filter(
          (slot) => slot.available
        );
        setAvailableSlots(availableSlots);
      } else {
        setAvailableSlots([]);
      }
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, availabilities]);

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users?role=professional");
      console.log("Réponse des professionnels:", JSON.stringify(response.data));

      // Traitement correct de la réponse API
      if (response.data) {
        // Si la réponse contient une propriété data, utiliser cette propriété
        if (response.data.data && Array.isArray(response.data.data)) {
          // Filtrer pour ne garder que les professionnels
          const professionalsData = response.data.data.filter(
            (user: any) => user.role === "professional"
          );
          setProfessionals(professionalsData);
        }
        // Sinon, si la réponse est directement un tableau
        else if (Array.isArray(response.data)) {
          // Filtrer pour ne garder que les professionnels
          const professionalsData = response.data.filter(
            (user: any) => user.role === "professional"
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
      const response = await api.get(`/availability/${selectedProfessional}`);
      // Console log pour débogage
      console.log("Réponse disponibilités:", JSON.stringify(response.data));

      if (response.data && response.data.success) {
        setAvailabilities(response.data.data || []);
      } else {
        // Si le format est différent ou s'il n'y a pas de données
        setAvailabilities(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des disponibilités:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de charger les disponibilités",
      });
      setAvailabilities([]);
    } finally {
      setLoadingSlots(false);
    }
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

      const appointmentDate = format(selectedDate, "yyyy-MM-dd");

      const response = await api.post("/appointments", {
        professionalId: selectedProfessional,
        date: appointmentDate,
        time: selectedTimeSlot,
        status: "pending",
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
    } catch (error) {
      console.error("Erreur lors de la création du rendez-vous:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de créer le rendez-vous",
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <StyledView className="flex-row space-x-3 py-2">
              {availableSlots.map((slot) => (
                <TouchableOpacity
                  key={slot._id}
                  className={`py-2 px-4 rounded-lg border ${
                    selectedTimeSlot === slot.time
                      ? "bg-sage border-sage"
                      : "bg-white border-sage/20"
                  }`}
                  onPress={() => setSelectedTimeSlot(slot.time)}
                >
                  <StyledText
                    className={`${
                      selectedTimeSlot === slot.time
                        ? "text-white"
                        : "text-brown"
                    }`}
                  >
                    {slot.time}
                  </StyledText>
                </TouchableOpacity>
              ))}
            </StyledView>
          </ScrollView>
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
