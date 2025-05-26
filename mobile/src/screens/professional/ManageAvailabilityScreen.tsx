import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../../contexts/AuthContext";
import apiService from "../../services/api";
import Toast from "react-native-toast-message";
import { ManageAvailabilityScreenProps } from "../../types/navigation";

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

  useEffect(() => {
    fetchAvailability();
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

      if (existingSlot && existingAvailability) {
        // Inverser la disponibilité
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
        // Créer une nouvelle disponibilité
        const response = await apiService.post(
          `/availability/${professionalId}`,
          {
            date: selectedDate,
            time,
            available: true,
          }
        );

        if (response.data && response.data.success) {
          // Ajouter la nouvelle disponibilité
          const newSlot = response.data.slot || { time, available: true };
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
              [selectedDate]: { marked: true, dotColor: "#A8B9A3" },
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
    if (!dateAvailability) return false;

    const slot = dateAvailability.slots.find((s) => s.time === time);
    return slot?.available || false;
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Gérer mes disponibilités</Text>

      <View style={styles.datePickerContainer}>
        <Text style={styles.datePickerLabel}>
          Date sélectionnée:{" "}
          {new Date(selectedDate).toLocaleDateString("fr-FR")}
        </Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={showDatepicker}
        >
          <Text style={styles.datePickerButtonText}>Changer de date</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={new Date(selectedDate)}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>

      <View style={styles.dayHeader}>
        <Text style={styles.dayText}>
          {new Date(selectedDate).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#A8B9A3" />
      ) : (
        <ScrollView style={styles.timeSlotsContainer}>
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
              <Text style={styles.timeText}>{time}</Text>
              <Ionicons
                name={getSlotStatus(time) ? "checkmark-circle" : "close-circle"}
                size={24}
                color={getSlotStatus(time) ? "#4CAF50" : "#F44336"}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
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
});

export default ManageAvailabilityScreen;
