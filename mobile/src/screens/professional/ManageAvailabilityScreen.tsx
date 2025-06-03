import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../../contexts/AuthContext";
import apiService from "../../services/api";
import Toast from "react-native-toast-message";
import { ManageAvailabilityScreenProps } from "../../types/navigation";
import SafeAreaWrapper from "../../components/SafeAreaWrapper";

const TIME_SLOTS = [
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

interface AvailabilitySlot {
  time: string;
  available: boolean;
  _id?: string;
}

interface Availability {
  _id?: string;
  date: string;
  slots: AvailabilitySlot[];
}

// Type pour les dates marquées du calendrier
interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
  };
}

const ManageAvailabilityScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");
  const [interval, setInterval] = useState("30");
  const [professionalId, setProfessionalId] = useState("");

  useEffect(() => {
    fetchAvailability();
    fetchProfessionalId();
  }, []);

  const fetchAvailability = async () => {
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

      // Récupérer les disponibilités avec cet ID
      const response = await apiService.get(`/availability/${professionalId}`);

      if (response.data && response.data.success) {
        setAvailabilities(response.data.data || []);

        // Marquer les dates avec disponibilités
        const dates = (response.data.data || []).reduce(
          (acc: MarkedDates, item: Availability) => {
            acc[item.date] = { marked: true, dotColor: "#A8B9A3" };
            return acc;
          },
          {}
        );

        setMarkedDates(dates);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des disponibilités:",
        error
      );
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de récupérer vos disponibilités",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessionalId = async () => {
    try {
      const professionalResponse = await apiService.get("/users/professional");
      if (professionalResponse.data && professionalResponse.data.success) {
        setProfessionalId(professionalResponse.data.professionalId);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'ID professionnel:",
        error
      );
    }
  };

  const toggleTimeSlot = async (time: string) => {
    try {
      // Trouver si cette disponibilité existe déjà
      const existingAvailability = availabilities.find(
        (a) => a.date === selectedDate
      );
      const existingSlot = existingAvailability?.slots.find(
        (s) => s.time === time
      );

      // Récupérer l'ID du professionnel
      const professionalResponse = await apiService.get("/users/professional");

      if (!professionalResponse.data || !professionalResponse.data.success) {
        throw new Error(
          "Impossible de récupérer les informations du professionnel"
        );
      }

      const professionalId = professionalResponse.data.professionalId;

      // Si le créneau existe déjà, on inverse sa disponibilité
      if (existingSlot && existingAvailability) {
        const response = await apiService.put(
          `/availability/${professionalId}/${existingAvailability._id}/slot/${existingSlot._id}`,
          {
            available: !existingSlot.available,
          }
        );

        if (response.data && response.data.success) {
          // Mettre à jour localement
          setAvailabilities(
            availabilities.map((avail) => {
              if (avail.date === selectedDate) {
                return {
                  ...avail,
                  slots: avail.slots.map((slot) => {
                    if (slot.time === time) {
                      return { ...slot, available: !slot.available };
                    }
                    return slot;
                  }),
                };
              }
              return avail;
            })
          );
        }
      } else {
        // Créer un nouveau créneau explicitement indisponible
        // Par défaut tous les créneaux sont disponibles, donc on ne crée que les indisponibilités
        const response = await apiService.post(
          `/availability/${professionalId}`,
          {
            date: selectedDate,
            time,
            available: false, // Le créneau est explicitement marqué comme indisponible
          }
        );

        if (response.data && response.data.success) {
          // Ajouter la nouvelle indisponibilité
          const newSlot = response.data.slot || { time, available: false };
          const newAvailability = response.data.availability || {
            _id: response.data.availabilityId,
            date: selectedDate,
            slots: [newSlot],
          };

          if (existingAvailability) {
            // Ajouter le slot à une disponibilité existante
            setAvailabilities(
              availabilities.map((avail) => {
                if (avail.date === selectedDate) {
                  return {
                    ...avail,
                    slots: [...avail.slots, newSlot],
                  };
                }
                return avail;
              })
            );
          } else {
            // Créer une nouvelle disponibilité avec ce slot
            setAvailabilities([...availabilities, newAvailability]);

            // Marquer la date dans le calendrier
            setMarkedDates({
              ...markedDates,
              [selectedDate]: { marked: true, dotColor: "#F44336" }, // Rouge pour indiquer des indisponibilités
            });
          }
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de la disponibilité:",
        error
      );
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de mettre à jour la disponibilité",
      });
    }
  };

  const getSlotStatus = (time: string) => {
    const dateAvailability = availabilities.find(
      (a) => a.date === selectedDate
    );
    if (!dateAvailability) return true; // Par défaut, tous les créneaux sont disponibles

    const slot = dateAvailability.slots.find((s) => s.time === time);
    if (!slot) return true; // Si le créneau n'existe pas encore, il est disponible par défaut

    return slot.available;
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split("T")[0];
      setSelectedDate(dateString);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleCreateDefaultAvailability = async () => {
    try {
      setLoading(true);

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      const response = await apiService.post(
        `/availability/${professionalId}/batch-unavailable`,
        {
          startDate: startDateStr,
          endDate: endDateStr,
          startTime,
          endTime,
          interval,
        }
      );

      if (response.data && response.data.success) {
        Toast.show({
          type: "success",
          text1: "Indisponibilités définies",
          text2: "Vos indisponibilités ont été enregistrées avec succès",
        });

        // Actualiser les disponibilités
        fetchAvailability();
        setShowModal(false);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la définition des indisponibilités:",
        error
      );
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de définir les indisponibilités",
      });
    } finally {
      setLoading(false);
    }
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const renderDatePicker = () => {
    if (showDatePicker) {
      return (
        <DateTimePicker
          value={new Date(selectedDate)}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      );
    }
    return null;
  };

  const renderModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Définir des indisponibilités</Text>

            <Text style={styles.modalDescription}>
              Tous les créneaux sont disponibles par défaut. Cet outil vous
              permet de marquer une période comme indisponible pour éviter de
              recevoir des réservations pendant ces dates.
            </Text>

            <Text style={styles.modalLabel}>Date de début</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {startDate.toLocaleDateString("fr-FR")}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#A8B9A3" />
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onStartDateChange}
                minimumDate={new Date()}
              />
            )}

            <Text style={styles.modalLabel}>Date de fin</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {endDate.toLocaleDateString("fr-FR")}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#A8B9A3" />
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onEndDateChange}
                minimumDate={startDate}
              />
            )}

            <Text style={styles.modalLabel}>Heure de début</Text>
            <TextInput
              style={styles.input}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="08:00"
              keyboardType="default"
            />

            <Text style={styles.modalLabel}>Heure de fin</Text>
            <TextInput
              style={styles.input}
              value={endTime}
              onChangeText={setEndTime}
              placeholder="18:00"
              keyboardType="default"
            />

            <Text style={styles.modalLabel}>Intervalle (minutes)</Text>
            <TextInput
              style={styles.input}
              value={interval}
              onChangeText={setInterval}
              placeholder="30"
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateDefaultAvailability}
              >
                <Text style={styles.createButtonText}>Définir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaWrapper bottomTabBarHeight={50}>
      <Text style={styles.header}>Gérer vos disponibilités</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>
            Définir des indisponibilités
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.datePickerContainer}>
        <Text style={styles.datePickerLabel}>Date sélectionnée:</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {new Date(selectedDate).toLocaleDateString("fr-FR")}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#A8B9A3" />
        </TouchableOpacity>
        {renderDatePicker()}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#A8B9A3"
          style={styles.loading}
        />
      ) : (
        <ScrollView style={styles.timeSlotsContainer}>
          <Text style={styles.timeSlotsTitle}>
            Créneaux horaires du{" "}
            {new Date(selectedDate).toLocaleDateString("fr-FR")}
          </Text>

          <Text style={styles.timeSlotDescription}>
            Par défaut, tous les créneaux sont disponibles. Appuyez sur un
            créneau pour le marquer comme indisponible.
          </Text>

          <View style={styles.timeSlots}>
            {TIME_SLOTS.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  getSlotStatus(time)
                    ? styles.availableSlot
                    : styles.unavailableSlot,
                ]}
                onPress={() => toggleTimeSlot(time)}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    getSlotStatus(time)
                      ? styles.availableSlotText
                      : styles.unavailableSlotText,
                  ]}
                >
                  {time}
                </Text>
                <Ionicons
                  name={
                    getSlotStatus(time)
                      ? "checkmark-circle-outline"
                      : "close-circle-outline"
                  }
                  size={24}
                  color={getSlotStatus(time) ? "#4CAF50" : "#F44336"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {renderModal()}
    </SafeAreaWrapper>
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
  datePickerContainer: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    marginHorizontal: 16,
    borderRadius: 8,
  },
  datePickerLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  datePickerButton: {
    backgroundColor: "#A8B9A3",
    padding: 10,
    borderRadius: 8,
  },
  datePickerButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  dayHeader: {
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "capitalize",
  },
  timeSlotsContainer: {
    flex: 1,
    padding: 16,
  },
  timeSlot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    width: "48%", // Pour avoir 2 colonnes
    marginHorizontal: "1%",
  },
  availableSlot: {
    backgroundColor: "#E8F5E9",
    borderColor: "#A8B9A3",
  },
  unavailableSlot: {
    backgroundColor: "#FFEBEE",
    borderColor: "#FFCDD2",
  },
  timeText: {
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  actionButton: {
    backgroundColor: "#A8B9A3",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#5D4037",
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: "#5D4037",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    borderRadius: 5,
    padding: 12,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  createButton: {
    backgroundColor: "#A8B9A3",
  },
  cancelButtonText: {
    color: "#5D4037",
  },
  createButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 16,
  },
  timeSlotsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  timeSlots: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  timeSlotText: {
    fontSize: 16,
  },
  availableSlotText: {
    fontWeight: "bold",
    color: "#4CAF50",
  },
  unavailableSlotText: {
    fontWeight: "bold",
    color: "#F44336",
  },
  loading: {
    marginTop: 20,
  },
  timeSlotDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    fontStyle: "italic",
  },
  modalDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    fontStyle: "italic",
  },
});

export default ManageAvailabilityScreen;
