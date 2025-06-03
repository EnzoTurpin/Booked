import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import SafeAreaWrapper from "../../components/SafeAreaWrapper";
import StyledText from "../../components/StyledText";
import StyledView from "../../components/StyledView";
import apiService from "../../services/api";
import Toast from "react-native-toast-message";

type Appointment = {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  professionalId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  duration: number;
  createdAt: string;
};

const AdminAppointmentsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("/appointments");
      if (response.data) {
        setAppointments(response.data || []);
        setFilteredAppointments(response.data || []);
      } else {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de récupérer les rendez-vous",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des rendez-vous:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2:
          "Une erreur est survenue lors de la récupération des rendez-vous",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  useEffect(() => {
    if (searchTerm || statusFilter) {
      const filtered = appointments.filter((appointment) => {
        const clientName =
          `${appointment.userId?.firstName} ${appointment.userId?.lastName}`.toLowerCase();
        const professionalName =
          `${appointment.professionalId?.firstName} ${appointment.professionalId?.lastName}`.toLowerCase();

        const matchesSearch = searchTerm
          ? clientName.includes(searchTerm.toLowerCase()) ||
            professionalName.includes(searchTerm.toLowerCase())
          : true;

        const matchesStatus = statusFilter
          ? appointment.status === statusFilter
          : true;

        return matchesSearch && matchesStatus;
      });
      setFilteredAppointments(filtered);
    } else {
      setFilteredAppointments(appointments);
    }
  }, [searchTerm, statusFilter, appointments]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const handleUpdateStatus = async (
    appointmentId: string,
    newStatus: string
  ) => {
    try {
      setLoading(true);
      const response = await apiService.put(`/appointments/${appointmentId}`, {
        status: newStatus,
      });

      if (response.data) {
        // Mettre à jour la liste des rendez-vous
        setAppointments(
          appointments.map((appointment) =>
            appointment._id === appointmentId
              ? { ...appointment, status: newStatus as any }
              : appointment
          )
        );

        Toast.show({
          type: "success",
          text1: "Succès",
          text2: `Statut du rendez-vous modifié en "${newStatus}"`,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de modifier le statut du rendez-vous",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la modification du statut:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Une erreur est survenue",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    Alert.alert(
      "Supprimer le rendez-vous",
      "Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action est irréversible.",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await apiService.delete(
                `/appointments/${appointmentId}`
              );

              if (response.data) {
                // Mettre à jour la liste des rendez-vous
                setAppointments(
                  appointments.filter(
                    (appointment) => appointment._id !== appointmentId
                  )
                );

                Toast.show({
                  type: "success",
                  text1: "Succès",
                  text2: "Rendez-vous supprimé avec succès",
                });
              } else {
                Toast.show({
                  type: "error",
                  text1: "Erreur",
                  text2: "Impossible de supprimer le rendez-vous",
                });
              }
            } catch (error) {
              console.error("Erreur lors de la suppression:", error);
              Toast.show({
                type: "error",
                text1: "Erreur",
                text2: "Une erreur est survenue",
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "bg-yellow-100", text: "text-yellow-800" };
      case "confirmed":
        return { bg: "bg-blue-100", text: "text-blue-800" };
      case "cancelled":
        return { bg: "bg-red-100", text: "text-red-800" };
      case "completed":
        return { bg: "bg-green-100", text: "text-green-800" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800" };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "confirmed":
        return "Confirmé";
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
      return format(date, "dd MMMM yyyy", { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView
        className="flex-1"
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <StyledView className="p-6">
          <StyledView className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#5D4037" />
            </TouchableOpacity>
            <StyledText className="text-2xl font-bold text-brown">
              Gestion des rendez-vous
            </StyledText>
          </StyledView>

          {/* Recherche et filtres */}
          <StyledView className="mb-6">
            <StyledView className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-3">
              <Ionicons name="search" size={20} color="#8E8E93" />
              <TextInput
                placeholder="Rechercher par nom..."
                placeholderTextColor="#8E8E93"
                className="flex-1 ml-2 text-gray-800"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
              {searchTerm ? (
                <TouchableOpacity onPress={() => setSearchTerm("")}>
                  <Ionicons name="close-circle" size={20} color="#8E8E93" />
                </TouchableOpacity>
              ) : null}
            </StyledView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-2"
            >
              <TouchableOpacity
                className={`py-2 px-3 rounded-lg mr-2 ${
                  statusFilter === null ? "bg-sage" : "bg-gray-200"
                }`}
                onPress={() => setStatusFilter(null)}
              >
                <StyledText
                  className={
                    statusFilter === null ? "text-white" : "text-gray-700"
                  }
                >
                  Tous
                </StyledText>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-2 px-3 rounded-lg mr-2 ${
                  statusFilter === "pending" ? "bg-sage" : "bg-gray-200"
                }`}
                onPress={() => setStatusFilter("pending")}
              >
                <StyledText
                  className={
                    statusFilter === "pending" ? "text-white" : "text-gray-700"
                  }
                >
                  En attente
                </StyledText>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-2 px-3 rounded-lg mr-2 ${
                  statusFilter === "confirmed" ? "bg-sage" : "bg-gray-200"
                }`}
                onPress={() => setStatusFilter("confirmed")}
              >
                <StyledText
                  className={
                    statusFilter === "confirmed"
                      ? "text-white"
                      : "text-gray-700"
                  }
                >
                  Confirmés
                </StyledText>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-2 px-3 rounded-lg mr-2 ${
                  statusFilter === "cancelled" ? "bg-sage" : "bg-gray-200"
                }`}
                onPress={() => setStatusFilter("cancelled")}
              >
                <StyledText
                  className={
                    statusFilter === "cancelled"
                      ? "text-white"
                      : "text-gray-700"
                  }
                >
                  Annulés
                </StyledText>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-2 px-3 rounded-lg mr-2 ${
                  statusFilter === "completed" ? "bg-sage" : "bg-gray-200"
                }`}
                onPress={() => setStatusFilter("completed")}
              >
                <StyledText
                  className={
                    statusFilter === "completed"
                      ? "text-white"
                      : "text-gray-700"
                  }
                >
                  Terminés
                </StyledText>
              </TouchableOpacity>
            </ScrollView>
          </StyledView>

          {/* Liste des rendez-vous */}
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#A8B9A3" />
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => {
              const statusColors = getStatusColor(appointment.status);

              return (
                <StyledView
                  key={appointment._id}
                  className="mb-4 p-4 rounded-lg border border-gray-200 bg-white"
                >
                  <StyledView className="flex-row justify-between items-start">
                    <StyledView className="flex-1">
                      <StyledView className="flex-row items-center mb-2">
                        <StyledView
                          className={`px-2 py-1 rounded-full mr-2 ${statusColors.bg}`}
                        >
                          <StyledText
                            className={`text-xs ${statusColors.text}`}
                          >
                            {getStatusText(appointment.status)}
                          </StyledText>
                        </StyledView>
                        <StyledText className="text-gray-600">
                          {formatDate(appointment.date)} à {appointment.time}
                        </StyledText>
                      </StyledView>

                      <StyledText className="text-lg font-bold text-brown mb-1">
                        Client: {appointment.userId?.firstName}{" "}
                        {appointment.userId?.lastName}
                      </StyledText>

                      <StyledText className="text-gray-700 mb-1">
                        Professionnel: {appointment.professionalId?.firstName}{" "}
                        {appointment.professionalId?.lastName}
                      </StyledText>

                      <StyledText className="text-gray-600 text-sm">
                        Durée: {appointment.duration} min
                      </StyledText>
                    </StyledView>

                    <StyledView className="flex-row">
                      {/* Menu d'actions */}
                      {appointment.status !== "completed" &&
                        appointment.status !== "cancelled" && (
                          <TouchableOpacity
                            className="p-2 rounded-full mr-2 bg-green-100"
                            onPress={() =>
                              handleUpdateStatus(
                                appointment._id,
                                appointment.status === "pending"
                                  ? "confirmed"
                                  : "completed"
                              )
                            }
                          >
                            <Ionicons
                              name={
                                appointment.status === "pending"
                                  ? "checkmark-circle"
                                  : "checkbox"
                              }
                              size={20}
                              color="#4CAF50"
                            />
                          </TouchableOpacity>
                        )}

                      {appointment.status !== "cancelled" &&
                        appointment.status !== "completed" && (
                          <TouchableOpacity
                            className="p-2 rounded-full mr-2 bg-red-100"
                            onPress={() =>
                              handleUpdateStatus(appointment._id, "cancelled")
                            }
                          >
                            <Ionicons
                              name="close-circle"
                              size={20}
                              color="#F44336"
                            />
                          </TouchableOpacity>
                        )}

                      <TouchableOpacity
                        className="p-2 rounded-full bg-red-100"
                        onPress={() => handleDeleteAppointment(appointment._id)}
                      >
                        <Ionicons name="trash" size={20} color="#F44336" />
                      </TouchableOpacity>
                    </StyledView>
                  </StyledView>
                </StyledView>
              );
            })
          ) : (
            <StyledView className="items-center justify-center py-8">
              <Ionicons name="calendar" size={48} color="#CCCCCC" />
              <StyledText className="text-gray-400 mt-2">
                Aucun rendez-vous trouvé
              </StyledText>
            </StyledView>
          )}
        </StyledView>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F0E3",
    flex: 1,
  },
});

export default AdminAppointmentsScreen;
