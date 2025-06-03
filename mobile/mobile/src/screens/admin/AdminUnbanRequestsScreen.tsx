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

const AdminUnbanRequestsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unbanRequests, setUnbanRequests] = useState<UnbanRequest[]>([]);

  const fetchUnbanRequests = async () => {
    try {
      setLoading(true);

      // Récupérer les demandes de déban
      const unbanResponse = await apiService.get("/users/unban-requests");
      if (unbanResponse.data && unbanResponse.data.success) {
        setUnbanRequests(unbanResponse.data.data || []);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des demandes de déban:",
        error
      );
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de charger les demandes de déban",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUnbanRequests();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchUnbanRequests();
  };

  const handleUnbanRequest = async (userId: string, approve: boolean) => {
    try {
      setLoading(true);
      const response = await apiService.put(`/users/${userId}/unban-request`, {
        approve,
      });

      if (response.data && response.data.success) {
        // Supprimer la demande de la liste
        setUnbanRequests(
          unbanRequests.filter((request) => request._id !== userId)
        );

        Toast.show({
          type: "success",
          text1: "Succès",
          text2: approve
            ? "Utilisateur débanni avec succès"
            : "Demande de déban rejetée",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de traiter la demande de déban",
        });
      }
    } catch (error) {
      console.error("Erreur lors du traitement de la demande de déban:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Une erreur est survenue",
      });
    } finally {
      setLoading(false);
    }
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
          <StyledView className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#5D4037" />
            </TouchableOpacity>
            <StyledText className="text-2xl font-bold text-brown">
              Demandes de déban
            </StyledText>
          </StyledView>

          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#A8B9A3" />
          ) : (
            <>
              {/* Compteur de demandes */}
              <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-6">
                <StyledText className="text-lg font-bold text-center text-brown">
                  {unbanRequests.length} demande
                  {unbanRequests.length !== 1 ? "s" : ""} en attente
                </StyledText>
              </StyledView>

              {/* Liste des demandes de déban */}
              {unbanRequests.length > 0 ? (
                unbanRequests.map((request) => (
                  <StyledView
                    key={request._id}
                    className="bg-white p-4 rounded-xl shadow-sm mb-3 border-l-4 border-yellow-500"
                  >
                    <StyledText className="text-lg font-bold text-brown mb-1">
                      {request.firstName} {request.lastName}
                    </StyledText>
                    <StyledText className="text-gray-600 mb-2">
                      {request.email}
                    </StyledText>
                    <StyledText className="text-gray-700 mb-2">
                      Demande du {formatDate(request.unbanRequestDate)}
                    </StyledText>
                    <StyledView className="bg-gray-100 p-3 rounded-lg mb-3">
                      <StyledText className="text-gray-700 italic">
                        "{request.unbanRequestReason}"
                      </StyledText>
                    </StyledView>
                    <StyledView className="flex-row justify-end">
                      <TouchableOpacity
                        className="bg-red-100 py-2 px-4 rounded-lg mr-2"
                        onPress={() => handleUnbanRequest(request._id, false)}
                      >
                        <StyledText className="text-red-800 font-bold">
                          Rejeter
                        </StyledText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-green-100 py-2 px-4 rounded-lg"
                        onPress={() => handleUnbanRequest(request._id, true)}
                      >
                        <StyledText className="text-green-800 font-bold">
                          Approuver
                        </StyledText>
                      </TouchableOpacity>
                    </StyledView>
                  </StyledView>
                ))
              ) : (
                <StyledView className="bg-white p-4 rounded-xl shadow-sm items-center">
                  <Ionicons name="checkmark-circle" size={40} color="#CCCCCC" />
                  <StyledText className="text-gray-500 mt-2">
                    Aucune demande de déban en attente
                  </StyledText>
                </StyledView>
              )}
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

export default AdminUnbanRequestsScreen;
