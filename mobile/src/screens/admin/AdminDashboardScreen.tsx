import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import SafeAreaWrapper from "../../components/SafeAreaWrapper";
import StyledText from "../../components/StyledText";
import StyledView from "../../components/StyledView";
import apiService from "../../services/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Toast from "react-native-toast-message";

type UnbanRequest = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  unbanRequestReason: string;
  unbanRequestDate: string;
};

const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProfessionals: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
  });
  const [unbanRequests, setUnbanRequests] = useState<UnbanRequest[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Récupérer les statistiques
      const statsResponse = await apiService.get("/admin/stats");
      if (statsResponse.data && statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Récupérer les demandes de déban
      const unbanResponse = await apiService.get("/users/unban-requests");
      if (unbanResponse.data && unbanResponse.data.success) {
        setUnbanRequests(unbanResponse.data.data || []);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données du tableau de bord:",
        error
      );
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de charger les données du tableau de bord",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy à HH:mm", { locale: fr });
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
          <StyledText className="text-2xl font-bold text-brown mb-6">
            Tableau de bord
          </StyledText>

          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#A8B9A3" />
          ) : (
            <>
              {/* Statistiques */}
              <StyledView className="flex-row flex-wrap justify-between mb-6">
                <StyledView className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4">
                  <StyledView className="items-center">
                    <Ionicons name="people" size={30} color="#A8B9A3" />
                    <StyledText className="text-lg font-bold mt-2">
                      {stats.totalUsers}
                    </StyledText>
                    <StyledText className="text-gray-600 text-center">
                      Utilisateurs
                    </StyledText>
                  </StyledView>
                </StyledView>

                <StyledView className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4">
                  <StyledView className="items-center">
                    <Ionicons name="briefcase" size={30} color="#A8B9A3" />
                    <StyledText className="text-lg font-bold mt-2">
                      {stats.totalProfessionals}
                    </StyledText>
                    <StyledText className="text-gray-600 text-center">
                      Professionnels
                    </StyledText>
                  </StyledView>
                </StyledView>

                <StyledView className="w-[48%] bg-white p-4 rounded-xl shadow-sm">
                  <StyledView className="items-center">
                    <Ionicons name="calendar" size={30} color="#A8B9A3" />
                    <StyledText className="text-lg font-bold mt-2">
                      {stats.totalAppointments}
                    </StyledText>
                    <StyledText className="text-gray-600 text-center">
                      Rendez-vous
                    </StyledText>
                  </StyledView>
                </StyledView>

                <StyledView className="w-[48%] bg-white p-4 rounded-xl shadow-sm">
                  <StyledView className="items-center">
                    <Ionicons name="time" size={30} color="#A8B9A3" />
                    <StyledText className="text-lg font-bold mt-2">
                      {stats.pendingAppointments}
                    </StyledText>
                    <StyledText className="text-gray-600 text-center">
                      En attente
                    </StyledText>
                  </StyledView>
                </StyledView>
              </StyledView>

              {/* Demandes de déban en attente */}
              <StyledView className="mb-6">
                <StyledView className="flex-row justify-between items-center mb-3">
                  <StyledText className="text-xl font-bold text-brown">
                    Demandes de déban
                  </StyledText>
                  <TouchableOpacity
                    onPress={() => {
                      // @ts-ignore
                      navigation.navigate("AdminUnbanRequests");
                    }}
                    className="bg-white py-1 px-3 rounded-full border border-sage"
                  >
                    <StyledText className="text-sage font-bold">
                      Voir tout
                    </StyledText>
                  </TouchableOpacity>
                </StyledView>

                {unbanRequests.length > 0 ? (
                  <>
                    <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-3">
                      <StyledText className="text-brown font-bold mb-2">
                        {unbanRequests.length} demande
                        {unbanRequests.length !== 1 ? "s" : ""} en attente
                      </StyledText>

                      {/* Afficher seulement les 2 premières demandes */}
                      {unbanRequests.slice(0, 2).map((request) => (
                        <StyledView
                          key={request._id}
                          className="border-l-4 border-yellow-500 pl-3 py-2 mb-2"
                        >
                          <StyledText className="font-bold text-brown">
                            {request.firstName} {request.lastName}
                          </StyledText>
                          <StyledText className="text-gray-600 text-sm">
                            {request.email}
                          </StyledText>
                        </StyledView>
                      ))}

                      {unbanRequests.length > 2 && (
                        <StyledText className="text-gray-600 italic text-sm text-center mt-2">
                          +{unbanRequests.length - 2} autre
                          {unbanRequests.length - 2 > 1 ? "s" : ""}
                        </StyledText>
                      )}
                    </StyledView>
                  </>
                ) : (
                  <StyledView className="bg-white p-4 rounded-xl shadow-sm items-center">
                    <Ionicons
                      name="checkmark-circle"
                      size={40}
                      color="#CCCCCC"
                    />
                    <StyledText className="text-gray-500 mt-2">
                      Aucune demande de déban en attente
                    </StyledText>
                  </StyledView>
                )}
              </StyledView>

              {/* Actions rapides */}
              <StyledView>
                <StyledText className="text-xl font-bold text-brown mb-3">
                  Actions rapides
                </StyledText>
                <StyledView className="flex-row flex-wrap justify-between">
                  <TouchableOpacity
                    className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 items-center"
                    onPress={() => {
                      // @ts-ignore
                      navigation.navigate("AdminUsers");
                    }}
                  >
                    <Ionicons name="people" size={24} color="#5D4037" />
                    <StyledText className="text-brown mt-2">
                      Gérer les utilisateurs
                    </StyledText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 items-center"
                    onPress={() => {
                      // @ts-ignore
                      navigation.navigate("AdminProfessionals");
                    }}
                  >
                    <Ionicons name="briefcase" size={24} color="#5D4037" />
                    <StyledText className="text-brown mt-2">
                      Gérer les pros
                    </StyledText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="w-[48%] bg-white p-4 rounded-xl shadow-sm items-center"
                    onPress={() => {
                      // @ts-ignore
                      navigation.navigate("AdminAppointments");
                    }}
                  >
                    <Ionicons name="calendar" size={24} color="#5D4037" />
                    <StyledText className="text-brown mt-2">
                      Gérer les RDV
                    </StyledText>
                  </TouchableOpacity>
                </StyledView>
              </StyledView>
            </>
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

export default AdminDashboardScreen;
