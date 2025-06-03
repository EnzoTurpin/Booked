import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  View,
} from "react-native";
import StyledText from "../components/StyledText";
import StyledView from "../components/StyledView";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import mongodbService from "../services/mongodb";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { useAuth } from "../contexts/AuthContext";
import SafeAreaWrapper from "../components/SafeAreaWrapper";

// Interface pour les rendez-vous directement depuis MongoDB
interface MongoAppointment {
  _id: string;
  userId: string;
  serviceId: MongoService | string;
  professionalId: MongoProfessional | string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Interface pour les services depuis MongoDB
interface MongoService {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

// Interface pour les professionnels depuis MongoDB
interface MongoProfessional {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
}

// Interface pour les rendez-vous avec détails
interface AppointmentWithDetails
  extends Omit<MongoAppointment, "serviceId" | "professionalId"> {
  service?: MongoService;
  professional?: MongoProfessional;
}

const MyAppointmentsScreen: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigation = useNavigation();

  // Créer une fonction mémorisée pour éviter les re-rendus inutiles
  const fetchAppointmentsFromMongoDB = useCallback(
    async (currentUserId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        console.log(
          "Récupération des rendez-vous pour l'utilisateur:",
          currentUserId
        );

        // Récupérer les rendez-vous de l'utilisateur via l'API
        const response = await mongodbService.find<MongoAppointment>(
          "appointments",
          { userId: currentUserId }
        );

        console.log("Rendez-vous récupérés:", response);

        if (response && response.length > 0) {
          // Convertir les données en format approprié pour l'UI
          const appointmentsWithDetails: AppointmentWithDetails[] =
            response.map((appointment) => {
              // Extraire les données de la réponse
              const { serviceId, professionalId, ...rest } = appointment;

              // Retourner un objet avec le bon format
              return {
                ...rest,
                service: typeof serviceId === "object" ? serviceId : undefined,
                professional:
                  typeof professionalId === "object"
                    ? professionalId
                    : undefined,
              };
            });

          setAppointments(appointmentsWithDetails);
        } else {
          // Pas d'erreur, juste aucun rendez-vous
          setAppointments([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des rendez-vous:", error);
        setError(
          "Impossible de charger vos rendez-vous. Veuillez réessayer plus tard."
        );
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de charger vos rendez-vous.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Ajouter un écouteur pour rafraîchir les données lorsque l'écran devient actif
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log(
        "MyAppointmentsScreen devient actif, rafraîchissement des données"
      );
      if (user && user.id) {
        fetchAppointmentsFromMongoDB(user.id);
      }
    });

    return unsubscribe;
  }, [navigation, user]);

  useEffect(() => {
    if (user && user.id) {
      fetchAppointmentsFromMongoDB(user.id);
    } else {
      setError("Utilisateur non connecté");
      setIsLoading(false);
    }
  }, [user, fetchAppointmentsFromMongoDB]);

  const getStatusClass = (status: MongoAppointment["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: MongoAppointment["status"]) => {
    switch (status) {
      case "confirmed":
        return "Confirmé";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulé";
      case "completed":
        return "Terminé";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "PPP", { locale: fr });
    } catch (error) {
      return "Date invalide";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      // Ne pas essayer de parser la date, renvoyer directement le temps
      return dateString || "--:--";
    } catch (error) {
      return "--:--";
    }
  };

  const confirmCancelAppointment = (id: string, date: string, time: string) => {
    Alert.alert(
      "Annuler le rendez-vous",
      `Êtes-vous sûr de vouloir annuler votre rendez-vous du ${formatDate(
        date
      )} à ${time} ?`,
      [
        {
          text: "Non",
          style: "cancel",
        },
        {
          text: "Oui, annuler",
          style: "destructive",
          onPress: () => handleCancelAppointment(id),
        },
      ]
    );
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      setCancellingId(id);

      // Mettre à jour le statut dans MongoDB
      const success = await mongodbService.updateOne("appointments", id, {
        status: "cancelled",
      });

      if (success) {
        // Mettre à jour l'état local
        setAppointments(
          appointments.map((appointment) =>
            appointment._id === id
              ? { ...appointment, status: "cancelled" }
              : appointment
          )
        );

        Toast.show({
          type: "success",
          text1: "Rendez-vous annulé",
          text2: "Votre rendez-vous a bien été annulé",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible d'annuler ce rendez-vous",
        });
      }
    } catch (error) {
      console.error(`Erreur lors de l'annulation du rendez-vous ${id}:`, error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Une erreur est survenue lors de l'annulation",
      });
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaWrapper>
        <StyledView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#A8B9A3" />
          <StyledText className="mt-4 text-brown/80">
            Chargement de vos rendez-vous...
          </StyledText>
        </StyledView>
      </SafeAreaWrapper>
    );
  }

  if (error) {
    return (
      <SafeAreaWrapper>
        <StyledView className="flex-1 justify-center items-center p-6">
          <StyledText className="text-red-500 text-center mb-4">
            {error}
          </StyledText>
          <TouchableOpacity
            className="bg-sage py-3 px-6 rounded-lg"
            onPress={() =>
              user && user.id && fetchAppointmentsFromMongoDB(user.id)
            }
          >
            <StyledText className="text-white font-bold">Réessayer</StyledText>
          </TouchableOpacity>
        </StyledView>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <ScrollView className="flex-1">
        <StyledView className="px-6 py-6">
          <StyledText className="text-2xl font-bold mb-6 text-center text-brown">
            Mes Rendez-vous
          </StyledText>

          {appointments.length === 0 ? (
            <StyledView className="items-center justify-center py-8">
              <StyledText className="text-brown/80 mb-4">
                Vous n'avez pas encore de rendez-vous.
              </StyledText>
              <TouchableOpacity
                onPress={() => navigation.navigate("BookingTab" as never)}
                className="bg-sage py-3 px-6 rounded-lg"
              >
                <StyledText className="text-white font-bold">
                  Prendre rendez-vous
                </StyledText>
              </TouchableOpacity>
            </StyledView>
          ) : (
            <StyledView className="space-y-4">
              {appointments.map((appointment) => (
                <StyledView
                  key={appointment._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-sage/20"
                >
                  <StyledView className="p-4">
                    <StyledView className="flex-row justify-between items-start">
                      <StyledView className="flex-1">
                        <StyledText className="text-lg font-bold text-brown">
                          {appointment.service?.name || "Service inconnu"}
                        </StyledText>
                        <StyledText className="text-brown/80 mt-1">
                          avec{" "}
                          {appointment.professional?.firstName ||
                            "Professionnel"}{" "}
                          {appointment.professional?.lastName || ""}
                        </StyledText>
                      </StyledView>
                      <StyledView
                        className={`px-3 py-1 rounded-full ${getStatusClass(
                          appointment.status
                        )}`}
                      >
                        <StyledText className="text-xs font-medium">
                          {getStatusText(appointment.status)}
                        </StyledText>
                      </StyledView>
                    </StyledView>

                    <StyledView className="mt-4 flex-row items-center">
                      <StyledText className="text-brown/80">
                        {formatDate(appointment.date)} à {appointment.time}
                      </StyledText>
                    </StyledView>

                    <StyledView className="mt-4 flex-row">
                      {appointment.status === "pending" ||
                      appointment.status === "confirmed" ? (
                        <TouchableOpacity
                          className="bg-red-100 py-2 px-4 rounded-lg"
                          onPress={() =>
                            confirmCancelAppointment(
                              appointment._id,
                              appointment.date,
                              appointment.time
                            )
                          }
                          disabled={cancellingId === appointment._id}
                        >
                          {cancellingId === appointment._id ? (
                            <ActivityIndicator size="small" color="#B91C1C" />
                          ) : (
                            <StyledText className="text-red-800 font-medium">
                              Annuler
                            </StyledText>
                          )}
                        </TouchableOpacity>
                      ) : null}
                    </StyledView>
                  </StyledView>
                </StyledView>
              ))}
            </StyledView>
          )}
        </StyledView>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default MyAppointmentsScreen;
