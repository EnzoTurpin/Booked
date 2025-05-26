import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import apiService from "../../services/api";
import Toast from "react-native-toast-message";
import { ManageAppointmentsScreenProps } from "../../types/navigation";

interface Appointment {
  _id: string;
  date: string;
  time: string;
  duration: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  client: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  serviceName?: string;
}

const ManageAppointmentsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      // Récupérer l'ID du professionnel
      const professionalResponse = await apiService.get("/users/professional");

      if (!professionalResponse.data || !professionalResponse.data.success) {
        throw new Error(
          "Impossible de récupérer les informations du professionnel"
        );
      }

      const professionalId = professionalResponse.data.professionalId;

      // Utiliser cet ID pour récupérer les rendez-vous
      const response = await apiService.get(
        `/appointments/professional/${professionalId}`
      );

      if (response.data) {
        // Adapter le format de données si nécessaire
        const formattedAppointments = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];

        setAppointments(formattedAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des rendez-vous:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de récupérer vos rendez-vous",
      });
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const response = await apiService.put(`/appointments/${id}/status`, {
        status,
      });

      if (response.data.success) {
        // Mettre à jour localement
        setAppointments(
          appointments.map((appointment) =>
            appointment._id === id
              ? { ...appointment, status: status as any }
              : appointment
          )
        );

        Toast.show({
          type: "success",
          text1: "Succès",
          text2: `Rendez-vous ${
            status === "confirmed"
              ? "confirmé"
              : status === "cancelled"
              ? "annulé"
              : "marqué comme terminé"
          }`,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rendez-vous:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de mettre à jour le statut du rendez-vous",
      });
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (selectedFilter === "all") return true;
    return appointment.status === selectedFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFC107";
      case "confirmed":
        return "#4CAF50";
      case "completed":
        return "#2196F3";
      case "cancelled":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "confirmed":
        return "Confirmé";
      case "completed":
        return "Terminé";
      case "cancelled":
        return "Annulé";
      default:
        return status;
    }
  };

  const renderAppointmentItem = ({ item }: { item: Appointment }) => {
    const appointmentDate = new Date(item.date);
    const formattedDate = appointmentDate.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <Text style={styles.appointmentClient}>
            {item.client.firstName} {item.client.lastName}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <View style={styles.appointmentInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{formattedDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.time} ({item.duration} min)
            </Text>
          </View>
          {item.serviceName && (
            <View style={styles.infoRow}>
              <Ionicons name="medical-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{item.serviceName}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          {item.status === "pending" && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={() => updateAppointmentStatus(item._id, "confirmed")}
              >
                <Text style={styles.actionButtonText}>Confirmer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => updateAppointmentStatus(item._id, "cancelled")}
              >
                <Text style={styles.actionButtonText}>Annuler</Text>
              </TouchableOpacity>
            </>
          )}
          {item.status === "confirmed" && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => updateAppointmentStatus(item._id, "completed")}
              >
                <Text style={styles.actionButtonText}>Terminer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => updateAppointmentStatus(item._id, "cancelled")}
              >
                <Text style={styles.actionButtonText}>Annuler</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Mes Rendez-vous</Text>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === "all" && styles.activeFilter,
          ]}
          onPress={() => setSelectedFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "all" && styles.activeFilterText,
            ]}
          >
            Tous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === "pending" && styles.activeFilter,
          ]}
          onPress={() => setSelectedFilter("pending")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "pending" && styles.activeFilterText,
            ]}
          >
            En attente
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === "confirmed" && styles.activeFilter,
          ]}
          onPress={() => setSelectedFilter("confirmed")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "confirmed" && styles.activeFilterText,
            ]}
          >
            Confirmés
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === "completed" && styles.activeFilter,
          ]}
          onPress={() => setSelectedFilter("completed")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "completed" && styles.activeFilterText,
            ]}
          >
            Terminés
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#A8B9A3" style={styles.loader} />
      ) : filteredAppointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Aucun rendez-vous trouvé</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item._id}
          renderItem={renderAppointmentItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 16,
    textAlign: "center",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#A8B9A3",
    marginHorizontal: 4,
    marginVertical: 4,
  },
  activeFilter: {
    backgroundColor: "#A8B9A3",
  },
  filterText: {
    color: "#A8B9A3",
  },
  activeFilterText: {
    color: "#FFF",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    padding: 16,
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  appointmentClient: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  appointmentInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  infoText: {
    marginLeft: 8,
    color: "#666",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#F44336",
  },
  completeButton: {
    backgroundColor: "#2196F3",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ManageAppointmentsScreen;
