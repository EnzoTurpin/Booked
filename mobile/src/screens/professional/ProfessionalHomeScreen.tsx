import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import StyledText from "../../components/StyledText";
import StyledView from "../../components/StyledView";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import SafeAreaWrapper from "../../components/SafeAreaWrapper";
import apiService from "../../services/api";
import { TabNavigatorParamList } from "../../types/navigation";

interface AppointmentSummary {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

type ProfessionalScreenNavigationProp =
  BottomTabNavigationProp<TabNavigatorParamList>;

const ProfessionalHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appointmentSummary, setAppointmentSummary] =
    useState<AppointmentSummary>({
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    });
  const [professionalInfo, setProfessionalInfo] = useState<any>(null);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);

  useEffect(() => {
    fetchProfessionalData();
    fetchTodayAppointments();
  }, []);

  const fetchProfessionalData = async () => {
    try {
      setIsLoading(true);

      // Récupérer l'ID du professionnel
      const professionalResponse = await apiService.get("/users/professional");

      if (!professionalResponse.data || !professionalResponse.data.success) {
        throw new Error(
          "Impossible de récupérer les informations du professionnel"
        );
      }

      setProfessionalInfo(professionalResponse.data);

      // Récupérer le résumé des rendez-vous
      const professionalId = professionalResponse.data.professionalId;
      const summaryResponse = await apiService.get(
        `/appointments/professional/${professionalId}/summary`
      );

      if (summaryResponse.data) {
        setAppointmentSummary(summaryResponse.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      // Récupérer la date d'aujourd'hui au format ISO
      const today = new Date().toISOString().split("T")[0];

      // Récupérer l'ID du professionnel
      const professionalResponse = await apiService.get("/users/professional");

      if (!professionalResponse.data || !professionalResponse.data.success) {
        throw new Error(
          "Impossible de récupérer les informations du professionnel"
        );
      }

      const professionalId = professionalResponse.data.professionalId;

      // Récupérer les rendez-vous d'aujourd'hui
      const response = await apiService.get(
        `/appointments/professional/${professionalId}/date/${today}`
      );

      if (response.data && Array.isArray(response.data)) {
        setTodayAppointments(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setTodayAppointments(response.data.data);
      } else {
        setTodayAppointments([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des rendez-vous:", error);
      setTodayAppointments([]);
    }
  };

  // Fonctions de navigation
  const navigateTo = (screen: string, params?: any) => {
    // @ts-ignore
    navigation.navigate(screen, params);
  };

  console.log("ProfessionalHomeScreen - User role:", user?.role);
  console.log("PROFESSIONNEL: Écran d'accueil professionnel chargé.");

  return (
    <SafeAreaWrapper bottomTabBarHeight={50}>
      <ScrollView className="flex-1">
        {/* En-tête / Bannière */}
        <StyledView className="bg-sage p-6">
          <StyledText className="text-3xl font-bold text-white">
            Booked Pro
          </StyledText>
          <StyledText className="text-lg text-white mt-2">
            Espace professionnel
          </StyledText>
          <StyledText className="text-white mt-1 p-2 bg-brown/50 rounded-lg">
            Rôle actuel: {user?.role || "Non défini"} (Version affichée:
            professionnel)
          </StyledText>
        </StyledView>

        {/* Section principale */}
        <StyledView className="p-6">
          <StyledText className="text-2xl font-bold text-brown mb-4">
            Bienvenue, {user?.firstName || "Professionnel"}
          </StyledText>

          {isLoading ? (
            <StyledView className="items-center py-8">
              <ActivityIndicator size="large" color="#A8B9A3" />
            </StyledView>
          ) : (
            <>
              {/* Résumé des rendez-vous */}
              <StyledView className="mb-8">
                <StyledText className="text-xl font-bold text-brown mb-4">
                  Vos rendez-vous
                </StyledText>

                <StyledView className="flex-row flex-wrap justify-between">
                  <TouchableOpacity
                    className="bg-white rounded-lg shadow-sm border border-sage/20 w-[48%] p-4 mb-4"
                    onPress={() => navigateTo("ManageAppointmentsTab")}
                  >
                    <Ionicons name="calendar" size={24} color="#A8B9A3" />
                    <StyledText className="text-3xl font-bold text-brown mt-2">
                      {appointmentSummary.total}
                    </StyledText>
                    <StyledText className="text-sm text-brown-light">
                      Total
                    </StyledText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-white rounded-lg shadow-sm border border-sage/20 w-[48%] p-4 mb-4"
                    onPress={() =>
                      navigateTo("ManageAppointmentsTab", { filter: "pending" })
                    }
                  >
                    <Ionicons name="time" size={24} color="#FFC107" />
                    <StyledText className="text-3xl font-bold text-brown mt-2">
                      {appointmentSummary.pending}
                    </StyledText>
                    <StyledText className="text-sm text-brown-light">
                      En attente
                    </StyledText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-white rounded-lg shadow-sm border border-sage/20 w-[48%] p-4 mb-4"
                    onPress={() =>
                      navigateTo("ManageAppointmentsTab", {
                        filter: "confirmed",
                      })
                    }
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#4CAF50"
                    />
                    <StyledText className="text-3xl font-bold text-brown mt-2">
                      {appointmentSummary.confirmed}
                    </StyledText>
                    <StyledText className="text-sm text-brown-light">
                      Confirmés
                    </StyledText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-white rounded-lg shadow-sm border border-sage/20 w-[48%] p-4 mb-4"
                    onPress={() =>
                      navigateTo("ManageAppointmentsTab", {
                        filter: "completed",
                      })
                    }
                  >
                    <Ionicons
                      name="checkmark-done-circle"
                      size={24}
                      color="#2196F3"
                    />
                    <StyledText className="text-3xl font-bold text-brown mt-2">
                      {appointmentSummary.completed}
                    </StyledText>
                    <StyledText className="text-sm text-brown-light">
                      Terminés
                    </StyledText>
                  </TouchableOpacity>
                </StyledView>
              </StyledView>

              {/* Raccourcis */}
              <StyledView className="mb-8">
                <StyledText className="text-xl font-bold text-brown mb-4">
                  Accès rapides
                </StyledText>

                <StyledView className="space-y-4">
                  <TouchableOpacity
                    className="bg-white p-4 rounded-lg shadow-sm border border-sage/20 flex-row items-center"
                    onPress={() => navigateTo("ManageAvailabilityTab")}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={24}
                      color="#A8B9A3"
                      className="mr-4"
                    />
                    <StyledView className="ml-4 flex-1">
                      <StyledText className="text-lg font-bold text-brown">
                        Gérer vos disponibilités
                      </StyledText>
                      <StyledText className="text-sm text-brown-light">
                        Définir vos horaires de travail
                      </StyledText>
                    </StyledView>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#A8B9A3"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-white p-4 rounded-lg shadow-sm border border-sage/20 flex-row items-center"
                    onPress={() => navigateTo("ManageAppointmentsTab")}
                  >
                    <Ionicons
                      name="list-outline"
                      size={24}
                      color="#A8B9A3"
                      className="mr-4"
                    />
                    <StyledView className="ml-4 flex-1">
                      <StyledText className="text-lg font-bold text-brown">
                        Gérer vos rendez-vous
                      </StyledText>
                      <StyledText className="text-sm text-brown-light">
                        Voir et modifier vos rendez-vous
                      </StyledText>
                    </StyledView>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#A8B9A3"
                    />
                  </TouchableOpacity>
                </StyledView>
              </StyledView>

              {/* Rendez-vous du jour */}
              <StyledView className="mb-8">
                <StyledText className="text-xl font-bold text-brown mb-4">
                  Rendez-vous d'aujourd'hui
                </StyledText>

                {todayAppointments.length > 0 ? (
                  <StyledView className="space-y-4">
                    {todayAppointments.map((appointment, index) => (
                      <StyledView
                        key={index}
                        className="bg-white p-4 rounded-lg shadow-sm border border-sage/20"
                      >
                        <StyledView className="flex-row justify-between items-center mb-2">
                          <StyledText className="font-bold text-brown">
                            {appointment.client?.firstName}{" "}
                            {appointment.client?.lastName}
                          </StyledText>
                          <StyledView
                            className={`px-2 py-1 rounded-full ${
                              appointment.status === "confirmed"
                                ? "bg-green-100"
                                : appointment.status === "pending"
                                ? "bg-yellow-100"
                                : appointment.status === "completed"
                                ? "bg-blue-100"
                                : "bg-red-100"
                            }`}
                          >
                            <StyledText
                              className={`text-xs ${
                                appointment.status === "confirmed"
                                  ? "text-green-800"
                                  : appointment.status === "pending"
                                  ? "text-yellow-800"
                                  : appointment.status === "completed"
                                  ? "text-blue-800"
                                  : "text-red-800"
                              }`}
                            >
                              {appointment.status === "confirmed"
                                ? "Confirmé"
                                : appointment.status === "pending"
                                ? "En attente"
                                : appointment.status === "completed"
                                ? "Terminé"
                                : "Annulé"}
                            </StyledText>
                          </StyledView>
                        </StyledView>
                        <StyledText className="text-brown-light">
                          {appointment.time} ({appointment.duration} min)
                        </StyledText>
                        {appointment.serviceName && (
                          <StyledText className="text-brown-light mt-1">
                            {appointment.serviceName}
                          </StyledText>
                        )}
                      </StyledView>
                    ))}
                  </StyledView>
                ) : (
                  <StyledView className="bg-white p-4 rounded-lg shadow-sm border border-sage/20 items-center py-8">
                    <Ionicons
                      name="calendar-outline"
                      size={40}
                      color="#A8B9A3"
                    />
                    <StyledText className="text-brown-light mt-4 text-center">
                      Aucun rendez-vous prévu aujourd'hui
                    </StyledText>
                  </StyledView>
                )}
              </StyledView>
            </>
          )}
        </StyledView>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default ProfessionalHomeScreen;
